#!/usr/bin/env bats
# Contract tests for scripts/dev/isolation-guard.sh --staged (pre-commit).
# Each test runs in a throw-away repository with its own denylist, so the
# real denylist is never needed or read.
# Run with: npm run test:scripts

setup() {
  SCRIPT="$BATS_TEST_DIRNAME/../../scripts/dev/isolation-guard.sh"
  TMP="$(mktemp -d)"
  export GIT_AUTHOR_NAME="bats" GIT_AUTHOR_EMAIL="bats@example.invalid"
  export GIT_COMMITTER_NAME="bats" GIT_COMMITTER_EMAIL="bats@example.invalid"
  export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1

  printf '# test denylist\nforbidden-example-host\n' > "$TMP/denylist"
  export SFS_DENYLIST="$TMP/denylist"

  git init -q "$TMP/repo"
  cd "$TMP/repo" || return 1
  printf 'line one\nline two\n' > notes.txt
  git add notes.txt
  git commit -q -m "chore: initial"
}

teardown() {
  rm -rf "$TMP"
}

@test "nothing staged is clean (message-only amend)" {
  run bash "$SCRIPT" --staged
  [ "$status" -eq 0 ]
}

@test "deletion-only change is clean" {
  printf 'line one\n' > notes.txt
  git add notes.txt
  run bash "$SCRIPT" --staged
  [ "$status" -eq 0 ]
}

@test "added clean line passes" {
  printf 'line three\n' >> notes.txt
  git add notes.txt
  run bash "$SCRIPT" --staged
  [ "$status" -eq 0 ]
}

@test "added denylisted line is blocked and redacted" {
  printf 'deploy to forbidden-example-host now\n' >> notes.txt
  git add notes.txt
  run bash "$SCRIPT" --staged
  [ "$status" -eq 1 ]
  [[ "$output" == *"<redacted>"* ]]
  [[ "$output" != *"forbidden-example-host"* ]]
}

@test "missing denylist fails closed" {
  export SFS_DENYLIST="$TMP/does-not-exist"
  run bash "$SCRIPT" --staged
  [ "$status" -eq 2 ]
}
