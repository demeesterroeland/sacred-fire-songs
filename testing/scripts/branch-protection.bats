#!/usr/bin/env bats
# No script may bypass branch protection (Epic 5.1, Story 5.1.6 / plan task 4.7).
# Run with: npm run test:scripts

setup() {
  ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
}

@test "no script merges pull requests with --admin" {
  skip "plan task 4.7: removing --admin from scripts/cicd/preview2prod.sh needs owner approval (Phase 4)"
  run grep -rnE 'gh pr merge[^#]*--admin' "$ROOT/scripts"
  echo "$output"
  [ "$status" -eq 1 ]
}
