#!/usr/bin/env bats
# Contract tests for scripts/cicd/develop2main.sh (Epic 5.1, Story 5.1.8).
# The script cds to its own repository root, so each test runs a copy of it
# inside a throw-away repository with a stubbed `gh` that logs every call.
# Run with: npm run test:scripts

setup() {
  TMP="$(mktemp -d)"
  export GIT_AUTHOR_NAME="bats" GIT_AUTHOR_EMAIL="bats@example.invalid"
  export GIT_COMMITTER_NAME="bats" GIT_COMMITTER_EMAIL="bats@example.invalid"
  export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1

  git init -q --bare -b main "$TMP/origin.git"
  git clone -q "$TMP/origin.git" "$TMP/repo" 2>/dev/null
  mkdir -p "$TMP/repo/scripts/cicd"
  cp "$BATS_TEST_DIRNAME/../../scripts/cicd/develop2main.sh" "$TMP/repo/scripts/cicd/"
  cd "$TMP/repo" || return 1
  git add -A && git commit -q -m "chore: initial" && git push -q origin HEAD:main
  git push -q origin HEAD:develop
  SCRIPT="$TMP/repo/scripts/cicd/develop2main.sh"

  # gh stub: logs its arguments, answers just enough for the promotion flow.
  mkdir -p "$TMP/bin"
  export GH_LOG="$TMP/gh.log"
  cat > "$TMP/bin/gh" <<'STUB'
#!/usr/bin/env bash
echo "$*" >> "$GH_LOG"
case "$1 $2" in
  "pr list")   echo "" ;;
  "pr create") echo "https://github.com/owner/repo/pull/42" ;;
  "pr view")   echo "42" ;;
esac
exit 0
STUB
  chmod +x "$TMP/bin/gh"
  export PATH="$TMP/bin:$PATH"
}

teardown() {
  rm -rf "$TMP"
}

add_develop_commit() {
  git switch -q -C develop origin/develop
  echo "$1" > "$1.txt"
  git add -A && git commit -q -m "feat: $1" && git push -q origin develop
}

@test "refuses to promote when develop has nothing new for main" {
  run bash "$SCRIPT" --yes --skip-release
  [ "$status" -eq 1 ]
  [[ "$output" == *"Nothing to promote"* ]]
  [ ! -s "$GH_LOG" ]
}

@test "opens the promotion PR from develop into main with a Conventional Commit title" {
  add_develop_commit a
  run bash "$SCRIPT" --yes --skip-release
  [ "$status" -eq 0 ]
  grep -q -- "pr create --base main --head develop --title chore(release): promote develop to main" "$GH_LOG"
}

@test "merges the promotion PR with a merge commit, never squash, --admin or branch deletion" {
  add_develop_commit a
  run bash "$SCRIPT" --yes --skip-release
  [ "$status" -eq 0 ]
  grep -q -- "pr checks 42 --watch" "$GH_LOG"
  grep -q -- "pr merge 42 --merge" "$GH_LOG"
  ! grep -qE -- "--squash|--admin|--delete-branch|--auto" "$GH_LOG"
}

@test "--dry-run calls no gh command and prints the explicit release images" {
  add_develop_commit a
  run bash "$SCRIPT" --dry-run
  [ "$status" -eq 0 ]
  [ ! -s "$GH_LOG" ]
  [[ "$output" == *"ghcr.io/demeesterroeland/sacred-fire-songs-app:vX.Y.Z"* ]]
  [[ "$output" == *"ghcr.io/demeesterroeland/sacred-fire-songs-migrator:vX.Y.Z"* ]]
  [[ "$output" != *"-app:latest"* && "$output" != *"-migrator:latest"* ]]
}

@test "without --yes the merge waits for an explicit owner confirmation" {
  add_develop_commit a
  run bash "$SCRIPT" --skip-release <<< "no"
  [ "$status" -eq 1 ]
  ! grep -q -- "pr merge" "$GH_LOG"
}

@test "rejects unknown options" {
  run bash "$SCRIPT" --bogus
  [ "$status" -eq 2 ]
}
