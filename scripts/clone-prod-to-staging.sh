#!/usr/bin/env bash
#
# clone-prod-to-staging.sh
# -------------------------
# Make the STAGING Supabase database a 1-on-1 copy of PRODUCTION.
#
# Copies: auth.users + auth.identities (accounts, login methods, password hashes)
#         and ALL public-schema app data.
# Skips:  transient auth tables (sessions, refresh_tokens, flow_state,
#         one_time_tokens, mfa_*, oauth_*, webauthn_*) — they are invalid
#         cross-project because staging has a different JWT secret. Users
#         simply re-authenticate with their existing passwords.
#         storage.objects/files are NOT transferred (staging keeps its bucket).
#
# Why this script exists (the gotcha):
#   The pooler `postgres` role is not a superuser and cannot
#   `SET session_replication_role = replica`, so Supabase's documented
#   dump->psql restore flow fails. Instead we use only privileges `postgres`
#   actually has: it OWNS the public tables + the handle_new_user() function,
#   and has INSERT/DELETE on auth.users. So we temporarily no-op the
#   on_auth_user_created trigger (via its function, which we own), disable
#   public validation triggers, defer public FK constraints, wipe, COPY the
#   data, then restore everything.
#
# Everything runs in ONE transaction (psql --single-transaction): on any
# error staging is left exactly as it was.
#
# Credentials are read from .env.infrastructure (gitignored):
#   PROD_PROJECT_ID, PROD_DB_PASSWORD, PROD_HOST
#   STAGING_PROJECT_ID, STAGING_DB_PASSWORD, STAGING_HOST
#
# Usage:
#   scripts/clone-prod-to-staging.sh [--yes] [--delete-backup]
#     --yes             skip the interactive confirmation
#     --delete-backup   remove the dump dir on success (default: keep it; PII inside)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="$ROOT/.env.infrastructure"
[[ -f "$ENV_FILE" ]] || { echo "ERROR: missing $ENV_FILE"; exit 1; }
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

: "${PROD_PROJECT_ID:?set in .env.infrastructure}"
: "${PROD_DB_PASSWORD:?set in .env.infrastructure}"
: "${PROD_HOST:?set in .env.infrastructure}"
: "${STAGING_PROJECT_ID:?set in .env.infrastructure}"
: "${STAGING_DB_PASSWORD:?set in .env.infrastructure}"
: "${STAGING_HOST:?set in .env.infrastructure}"

ASSUME_YES=0
DELETE_BACKUP=0
for arg in "$@"; do
  case "$arg" in
    --yes) ASSUME_YES=1 ;;
    --delete-backup) DELETE_BACKUP=1 ;;
    *) echo "Unknown option: $arg"; exit 2 ;;
  esac
done

# Build a session-pooler connection URL with a URL-encoded password.
make_url() { # $1=project_ref  $2=password  $3=host
  REF="$1" PW="$2" HOST="$3" python3 - <<'PY'
import os, urllib.parse as u
print("postgresql://postgres.%s:%s@%s:5432/postgres" % (
    os.environ["REF"], u.quote(os.environ["PW"], safe=""), os.environ["HOST"]))
PY
}
PROD_URL="$(make_url "$PROD_PROJECT_ID" "$PROD_DB_PASSWORD" "$PROD_HOST")"
STG_URL="$(make_url "$STAGING_PROJECT_ID" "$STAGING_DB_PASSWORD" "$STAGING_HOST")"

prod_psql() { PGPASSWORD="$PROD_DB_PASSWORD" psql -h "$PROD_HOST" -p 5432 \
  -U "postgres.$PROD_PROJECT_ID" -d postgres -X "$@"; }
stg_psql()  { PGPASSWORD="$STAGING_DB_PASSWORD" psql -h "$STAGING_HOST" -p 5432 \
  -U "postgres.$STAGING_PROJECT_ID" -d postgres -X "$@"; }

BK="$HOME/sfs-db-backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BK"; chmod 700 "$HOME/sfs-db-backups" "$BK"

echo "============================================================"
echo " Clone PRODUCTION  ->  STAGING"
echo "   prod    : $PROD_PROJECT_ID"
echo "   staging : $STAGING_PROJECT_ID   (will be WIPED)"
echo "   backups : $BK   (chmod 700, contains PII)"
echo "============================================================"

echo "==> Verifying connectivity…"
prod_psql -tAc "select 1" >/dev/null || { echo "ERROR: cannot connect to prod"; exit 1; }
stg_psql  -tAc "select 1" >/dev/null || { echo "ERROR: cannot connect to staging"; exit 1; }

echo "==> Dumping production (roles / schema / data)…"
supabase db dump --db-url "$PROD_URL" -f "$BK/prod_roles.sql"  --role-only >/dev/null
supabase db dump --db-url "$PROD_URL" -f "$BK/prod_schema.sql"             >/dev/null
supabase db dump --db-url "$PROD_URL" -f "$BK/prod_data.sql"   --use-copy --data-only \
  -x "storage.buckets_vectors" -x "storage.vector_indexes" >/dev/null

echo "==> Backing up staging (rollback insurance)…"
supabase db dump --db-url "$STG_URL" -f "$BK/staging_roles.sql"  --role-only >/dev/null
supabase db dump --db-url "$STG_URL" -f "$BK/staging_schema.sql"             >/dev/null
supabase db dump --db-url "$STG_URL" -f "$BK/staging_data.sql"   --use-copy --data-only \
  -x "storage.buckets_vectors" -x "storage.vector_indexes" >/dev/null

echo "==> Reading staging schema metadata…"
# Public tables, public FK constraints, public user-triggers — derived live so the
# script keeps working as the schema evolves.
stg_psql -tAc "select relname from pg_class
               where relnamespace='public'::regnamespace and relkind='r' order by 1" \
  > "$BK/public_tables.txt"
stg_psql -tAF$'\t' -c "select conrelid::regclass::text, conname from pg_constraint
               where contype='f' and connamespace='public'::regnamespace order by 1" \
  > "$BK/public_fks.txt"
stg_psql -tAF$'\t' -c "select c.relname, t.tgname from pg_trigger t
               join pg_class c on c.oid=t.tgrelid
               where c.relnamespace='public'::regnamespace and not t.tgisinternal" \
  > "$BK/public_user_triggers.txt"
stg_psql -tAc "select pg_get_functiondef('public.handle_new_user()'::regprocedure)" \
  > "$BK/handle_new_user.orig.sql"

# Sanity: prod and staging must share the same public table set.
prod_psql -tAc "select relname from pg_class
                where relnamespace='public'::regnamespace and relkind='r' order by 1" \
  > "$BK/prod_public_tables.txt"
if ! diff -q "$BK/public_tables.txt" "$BK/prod_public_tables.txt" >/dev/null; then
  echo "ERROR: prod and staging have different public tables. Sync migrations first." >&2
  diff "$BK/prod_public_tables.txt" "$BK/public_tables.txt" || true
  exit 1
fi

echo "==> Generating clone + revert SQL…"
python3 - "$BK" <<'PY'
import re, sys
BK = sys.argv[1]

src = open(f"{BK}/prod_data.sql").read().splitlines(keepends=True)
public_tables = [l.strip() for l in open(f"{BK}/public_tables.txt") if l.strip()]
fks = [tuple(l.rstrip("\n").split("\t")) for l in open(f"{BK}/public_fks.txt") if l.strip()]
trigs = [tuple(l.rstrip("\n").split("\t")) for l in open(f"{BK}/public_user_triggers.txt") if l.strip()]

# Extract each COPY ... \. block, keyed by (schema, table).
blocks, i = {}, 0
copy_re = re.compile(r'^COPY\s+"([^"]+)"\."([^"]+)"\s')
while i < len(src):
    m = copy_re.match(src[i])
    if not m:
        i += 1; continue
    sch, tbl, buf = m.group(1), m.group(2), [src[i]]
    i += 1
    while i < len(src):
        buf.append(src[i])
        if src[i].rstrip("\n") == r"\.":
            i += 1; break
        i += 1
    blocks[(sch, tbl)] = "".join(buf)

# Load order: auth.users -> auth.identities -> public tables (FKs deferred).
order = [("auth", "users"), ("auth", "identities")] + [("public", t) for t in public_tables]
missing = [t for t in order if t not in blocks]
if missing:
    sys.exit("ERROR: COPY blocks missing from prod dump: %s" % (missing,))

clone = []
clone.append("-- Atomic clone: prod -> staging. Generated by clone-prod-to-staging.sh\n")
clone.append("-- 1) neutralize handle_new_user (auto-reverts on rollback; restored after on success)\n")
clone.append("CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger "
             "LANGUAGE plpgsql SECURITY DEFINER AS $fn$ BEGIN RETURN new; END; $fn$;\n")
clone.append("-- 2) disable public validation triggers\n")
for tbl, tg in trigs:
    clone.append(f"ALTER TABLE public.{tbl} DISABLE TRIGGER {tg};\n")
clone.append("-- 3) defer public FK constraints so tables can load in any order\n")
for tbl, con in fks:
    clone.append(f"ALTER TABLE {tbl} ALTER CONSTRAINT {con} DEFERRABLE INITIALLY IMMEDIATE;\n")
clone.append("SET CONSTRAINTS ALL DEFERRED;\n")
clone.append("-- 4) clear staging (public via TRUNCATE; auth via DELETE -> ON DELETE CASCADE)\n")
clone.append("TRUNCATE " + ", ".join(f"public.{t}" for t in public_tables) + " CASCADE;\n")
clone.append("DELETE FROM auth.users;\n")
clone.append("-- 5) load production data\n")
for t in order:
    clone.append(f"-- {t[0]}.{t[1]}\n")
    clone.append(blocks[t])
open(f"{BK}/clone_staging.sql", "w").write("".join(clone))

revert = []
revert.append("-- restore original handle_new_user\n")
revert.append(open(f"{BK}/handle_new_user.orig.sql").read().rstrip() + ";\n")
for tbl, tg in trigs:
    revert.append(f"ALTER TABLE public.{tbl} ENABLE TRIGGER {tg};\n")
for tbl, con in fks:
    revert.append(f"ALTER TABLE {tbl} ALTER CONSTRAINT {con} NOT DEFERRABLE;\n")
open(f"{BK}/revert_staging.sql", "w").write("".join(revert))

print(f"   tables: {len(public_tables)} public + auth.users + auth.identities")
print(f"   FKs deferred: {len(fks)}   triggers disabled: {len(trigs)}")
PY

if [[ "$ASSUME_YES" -ne 1 ]]; then
  echo
  echo "!!! This will WIPE staging ($STAGING_PROJECT_ID) and overwrite it with prod data."
  echo "!!! Prod user emails + password hashes (PII) will land in staging."
  read -r -p "Type 'clone' to proceed: " reply
  [[ "$reply" == "clone" ]] || { echo "Aborted."; exit 1; }
fi

echo "==> Applying clone (atomic; rolls back on any error)…"
psql --single-transaction --variable ON_ERROR_STOP=1 \
  -f "$BK/clone_staging.sql" --dbname "$STG_URL"

echo "==> Restoring trigger function, triggers, and FK deferrability…"
psql --single-transaction --variable ON_ERROR_STOP=1 \
  -f "$BK/revert_staging.sql" --dbname "$STG_URL"

echo "==> Verifying row counts (prod vs staging)…"
mapfile -t TABLES < <(printf 'auth.users\nauth.identities\n'; sed 's/^/public./' "$BK/public_tables.txt")
COUNT_SQL=""
for t in "${TABLES[@]}"; do
  [[ -n "$COUNT_SQL" ]] && COUNT_SQL+=" union all "
  COUNT_SQL+="select '$t' t, count(*) n from $t"
done
COUNT_SQL+=" order by 1"
prod_psql -tAF$'\t' -c "$COUNT_SQL" > "$BK/verify_prod.txt"
stg_psql  -tAF$'\t' -c "$COUNT_SQL" > "$BK/verify_staging.txt"
if diff -u "$BK/verify_prod.txt" "$BK/verify_staging.txt"; then
  echo "✅ Row counts match across all tables."
else
  echo "⚠️  Row counts differ (see diff above)."; exit 1
fi

if [[ "$DELETE_BACKUP" -eq 1 ]]; then
  rm -rf "$BK"
  echo "Backup dir removed."
else
  echo "Backups (PII) kept at: $BK"
  echo "Delete when done:  rm -rf \"$BK\""
fi
echo "Done."
