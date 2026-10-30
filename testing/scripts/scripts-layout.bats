#!/usr/bin/env bats
# Contract tests for the scripts/ folder layout (#274).
# Every script lives in exactly one category folder: scripts/cicd, scripts/db
# or scripts/dev. Only README.md may sit directly in scripts/.
# Run with: npm run test:scripts

setup() {
  ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
}

@test "only README.md and the category folders sit directly in scripts/" {
  local entry name unexpected=()
  for entry in "$ROOT"/scripts/* "$ROOT"/scripts/.[!.]*; do
    [ -e "$entry" ] || continue
    name="$(basename "$entry")"
    case "$name" in
      README.md | cicd | db | dev) ;;
      *) unexpected+=("$name") ;;
    esac
  done
  echo "unexpected entries in scripts/: ${unexpected[*]}"
  [ "${#unexpected[@]}" -eq 0 ]
}

@test "scripts/README.md exists" {
  [ -f "$ROOT/scripts/README.md" ]
}

@test "the cicd, db and dev category folders exist and are not empty" {
  local category
  for category in cicd db dev; do
    [ -d "$ROOT/scripts/$category" ]
    [ -n "$(ls -A "$ROOT/scripts/$category")" ]
  done
}

@test "every script name appears in exactly one category" {
  local duplicates
  duplicates="$(find "$ROOT/scripts/cicd" "$ROOT/scripts/db" "$ROOT/scripts/dev" -type f -printf '%f\n' 2>/dev/null | sort | uniq -d)"
  echo "scripts in more than one category: $duplicates"
  [ -z "$duplicates" ]
}

@test "scripts/README.md lists every script" {
  local file rel missing=()
  while IFS= read -r file; do
    rel="${file#"$ROOT"/scripts/}"
    grep -qF "$rel" "$ROOT/scripts/README.md" || missing+=("$rel")
  done < <(find "$ROOT/scripts/cicd" "$ROOT/scripts/db" "$ROOT/scripts/dev" -type f 2>/dev/null)
  echo "scripts missing from README.md: ${missing[*]}"
  [ "${#missing[@]}" -eq 0 ]
}

@test ".claude/scripts no longer holds the story-sync scripts" {
  [ ! -e "$ROOT/.claude/scripts/sync-stories-to-gh.mjs" ]
  [ ! -e "$ROOT/.claude/scripts/sync-stories-from-gh.mjs" ]
  [ ! -e "$ROOT/.claude/scripts/lib/parseStories.mjs" ]
}
