#!/bin/sh
# run-migrations.sh — Production-Grade Supabase-Compatible Migration Runner
set -eu

echo "[MIGRATOR] Initializing Supabase schema migrations..."

# 1. Configuration Defaults
DB_HOST="${POSTGRES_HOST:-db}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-postgres}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-/migrations}"

export PGPASSWORD="${POSTGRES_PASSWORD}"

# Helper wrapper for psql execution with strict error handling
run_psql() {
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 "$@"
}

# 2. Ensure schema and tracking table exist with all required Supabase columns
run_psql -c "
  CREATE SCHEMA IF NOT EXISTS supabase_migrations;
  CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version TEXT PRIMARY KEY,
    name TEXT,
    statements TEXT[],
    inserted_at TIMESTAMPTZ DEFAULT NOW()
  );
" > /dev/null

# Ensure 'inserted_at' and 'statements' exist if upgrading from older table structures
run_psql -c "
  ALTER TABLE supabase_migrations.schema_migrations 
  ADD COLUMN IF NOT EXISTS inserted_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS statements TEXT[];
" > /dev/null

# 3. Apply migration files sequentially in strict natural version order
if [ -d "$MIGRATIONS_DIR" ]; then
  for f in $(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort -V); do
    [ -f "$f" ] || continue
    fname=$(basename "$f")
    
    # Extract version prefix and extensionless name
    ver="${fname%%_*}"
    name_without_ext="${fname%.sql}"

    # Check if migration has already been executed
    applied=$(run_psql -tA -c "SELECT COUNT(*) FROM supabase_migrations.schema_migrations WHERE version='$ver';")

    if [ "$applied" = "0" ]; then
      echo "[MIGRATOR] Applying migration: $fname..."

      # Check for non-transactional statements or files containing explicit BEGIN/COMMIT blocks
      if grep -qiE "CONCURRENTLY|ALTER TYPE|ALTER COLUMN.*TYPE|VACUUM|disable_ddl_transaction|^\s*BEGIN" "$f"; then
        echo "[MIGRATOR] Non-transactional / explicit transaction block detected ($fname). Running in AUTOCOMMIT mode..."

        # Execute migration file directly in autocommit mode
        run_psql -f "$f"
        
        # Record successful migration with statements array in schema_migrations
        {
          echo "INSERT INTO supabase_migrations.schema_migrations (version, name, statements, inserted_at)"
          echo "VALUES ('$ver', '$name_without_ext', ARRAY[\$migration_code\$"
          cat "$f"
          echo "\$migration_code\$], NOW()) ON CONFLICT (version) DO NOTHING;"
        } | run_psql -f - > /dev/null
      else
        # Execute standard migration inside a single atomic transaction stream
        {
          echo "BEGIN;"
          cat "$f"
          echo "INSERT INTO supabase_migrations.schema_migrations (version, name, statements, inserted_at)"
          echo "VALUES ('$ver', '$name_without_ext', ARRAY[\$migration_code\$"
          cat "$f"
          echo "\$migration_code\$], NOW()) ON CONFLICT (version) DO NOTHING;"
          echo "COMMIT;"
        } | run_psql -f - > /dev/null
      fi

      echo "[MIGRATOR] Successfully applied $fname"
    else
      echo "[MIGRATOR] Skipping $fname (already applied)"
    fi
  done
else
  echo "[MIGRATOR] Warning: Migrations directory '$MIGRATIONS_DIR' not found."
fi

echo "[MIGRATOR] All migrations checked and up to date."
