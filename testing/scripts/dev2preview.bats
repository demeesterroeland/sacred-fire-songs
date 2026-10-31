#!/usr/bin/env bats
# Contract tests for scripts/cicd/dev2preview.sh (Epic 5.1, Story 5.1.6).
# The script cds to its own repository root, so each test runs a copy of it
# inside a throw-away repository. --dry-run must never push or trigger CI.
# Run with: npm run test:scripts

setup() {
  TMP="$(mktemp -d)"
  export GIT_AUTHOR_NAME="bats" GIT_AUTHOR_EMAIL="bats@example.invalid"
  export GIT_COMMITTER_NAME="bats" GIT_COMMITTER_EMAIL="bats@example.invalid"
  export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1

  git init -q --bare -b main "$TMP/origin.git"
  git clone -q "$TMP/origin.git" "$TMP/repo" 2>/dev/null
  mkdir -p "$TMP/repo/scripts/cicd"
  cp "$BATS_TEST_DIRNAME/../../scripts/cicd/dev2preview.sh" "$TMP/repo/scripts/cicd/"
  cd "$TMP/repo" || return 1
  git add -A && git commit -q -m "chore: initial" && git push -q origin HEAD:main
  SCRIPT="$TMP/repo/scripts/cicd/dev2preview.sh"
}

teardown() {
  rm -rf "$TMP"
}

@test "--dry-run prints the app and migrator images CI actually pushes" {
  git switch -q -c feat/300-new-thing
  run bash "$SCRIPT" --dry-run
  [ "$status" -eq 0 ]
  [[ "$output" == *"ghcr.io/demeesterroeland/sacred-fire-songs-app:feat-300-new-thing"* ]]
  [[ "$output" == *"ghcr.io/demeesterroeland/sacred-fire-songs-migrator:feat-300-new-thing"* ]]
  [[ "$output" == *"ghcr.io/demeesterroeland/sacred-fire-songs-app:preview"* ]]
  [[ "$output" != *"sacred-fire-songs:feat"* ]]
}

@test "--dry-run does not push the branch" {
  git switch -q -c feat/300-new-thing
  run bash "$SCRIPT" --dry-run
  [ "$status" -eq 0 ]
  run git ls-remote --heads origin feat/300-new-thing
  [ -z "$output" ]
}

@test "sanitizes branch tags like docker/metadata-action (no lowercasing, runs collapsed)" {
  # metadata-action v5: tag.replace(/[^a-zA-Z0-9._-]+/g, '-')
  git switch -q -c fix/301-Some_Bug.v2
  run bash "$SCRIPT" --dry-run
  [ "$status" -eq 0 ]
  [[ "$output" == *"sacred-fire-songs-app:fix-301-Some_Bug.v2"* ]]
  git switch -q -c feat/303-a++b
  run bash "$SCRIPT" --dry-run
  [[ "$output" == *"sacred-fire-songs-app:feat-303-a-b"* ]]
}

@test "refuses to deploy develop or main to preview" {
  for branch in main develop; do
    git switch -q -C "$branch"
    run bash "$SCRIPT" --dry-run
    [ "$status" -eq 1 ]
    [[ "$output" == *"Cannot deploy '$branch'"* ]]
  done
}

@test "rejects unknown options" {
  run bash "$SCRIPT" --bogus
  [ "$status" -eq 2 ]
}
