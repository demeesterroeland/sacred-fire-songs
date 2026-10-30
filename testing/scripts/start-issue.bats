#!/usr/bin/env bats
# Contract tests for scripts/cicd/start-issue.sh (Epic 5.1, stories 5.1.6 / 5.1.10).
# Each test runs the script in a throw-away clone whose "origin" is a local
# bare repository with diverged `main` and `develop` branches.
# Run with: npm run test:scripts

setup() {
  SCRIPT="$BATS_TEST_DIRNAME/../../scripts/cicd/start-issue.sh"
  TMP="$(mktemp -d)"
  export GIT_AUTHOR_NAME="bats" GIT_AUTHOR_EMAIL="bats@example.invalid"
  export GIT_COMMITTER_NAME="bats" GIT_COMMITTER_EMAIL="bats@example.invalid"
  export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1

  git init -q --bare -b main "$TMP/origin.git"
  git clone -q "$TMP/origin.git" "$TMP/seed" 2>/dev/null
  (
    cd "$TMP/seed" || exit 1
    git commit -q --allow-empty -m "chore: initial"
    git push -q origin HEAD:main
    git switch -q -c develop
    git commit -q --allow-empty -m "feat: only on develop"
    git push -q origin develop
  )
  MAIN_SHA="$(git -C "$TMP/origin.git" rev-parse main)"
  DEVELOP_SHA="$(git -C "$TMP/origin.git" rev-parse develop)"

  git clone -q "$TMP/origin.git" "$TMP/repo" 2>/dev/null
  cd "$TMP/repo" || return 1
}

teardown() {
  rm -rf "$TMP"
}

@test "prints usage and fails with fewer than 3 arguments" {
  run bash "$SCRIPT" 300 feat
  [ "$status" -eq 1 ]
  [[ "$output" == *"Usage: scripts/cicd/start-issue.sh"* ]]
}

@test "feat branches start from origin/develop" {
  run bash "$SCRIPT" 300 feat new thing
  [ "$status" -eq 0 ]
  [ -d .worktrees/issue-300 ]
  [ "$(git -C .worktrees/issue-300 branch --show-current)" = "feat/300-new-thing" ]
  [ "$(git -C .worktrees/issue-300 rev-parse HEAD~1)" = "$DEVELOP_SHA" ]
}

@test "the first commit carries the Conventional Commit PR title" {
  run bash "$SCRIPT" 300 feat New Thing
  [ "$status" -eq 0 ]
  [ "$(git -C .worktrees/issue-300 log -1 --format=%s)" = "feat: New Thing (#300)" ]
}

@test "hotfix branches start from origin/main with a fix: title" {
  run bash "$SCRIPT" 302 hotfix prod crash
  [ "$status" -eq 0 ]
  [ "$(git -C .worktrees/issue-302 branch --show-current)" = "hotfix/302-prod-crash" ]
  [ "$(git -C .worktrees/issue-302 rev-parse HEAD~1)" = "$MAIN_SHA" ]
  [ "$(git -C .worktrees/issue-302 log -1 --format=%s)" = "fix: prod crash (#302)" ]
}

@test "the new branch does not track its base branch" {
  run bash "$SCRIPT" 300 feat new thing
  [ "$status" -eq 0 ]
  run git -C .worktrees/issue-300 rev-parse --abbrev-ref --symbolic-full-name '@{u}'
  [ "$status" -ne 0 ]
}

@test "refuses to overwrite an existing worktree" {
  mkdir -p .worktrees/issue-300
  run bash "$SCRIPT" 300 feat new thing
  [ "$status" -eq 1 ]
  [[ "$output" == *"already exists"* ]]
}

@test "rejects unknown branch types" {
  skip "story 5.1.6 / plan 2.4: type validation (feat|fix|chore|docs|hotfix) not implemented yet"
  run bash "$SCRIPT" 300 feature new thing
  [ "$status" -ne 0 ]
  [ ! -d .worktrees/issue-300 ]
}
