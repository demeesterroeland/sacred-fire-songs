# Gitflow CI/CD acceptance specification — Epic 5.1
# Plan: docs/plans/2026-10-30-gitflow-cicd-migration.md
#
# Tags:
#   @story-5.1.x   maps the scenario to its user story
#   @ci-contract   automatable by parsing .github/workflows/*.yml or scripts (Cucumber profile "ci")
#   @script        automatable with bats-core against scripts/*.sh
#   @manual        verified on a sandbox branch / real GitHub run; record run URL in master-walkthrough.md
#
# Status: written test-first (Phase 0). Every scenario is expected to FAIL until its story is implemented.

Feature: Gitflow branching and CI/CD pipeline
  As the maintainer of Sacred Fire Songs
  I want main, develop and short-lived work branches with automated quality gates
  So that only verified changes reach staging and production

  # ── Story 5.1.1: PR quality gate ──────────────────────────────────────────
  @story-5.1.1 @ci-contract
  Scenario: CI runs the fast test layers on every pull request
    Given the workflow "ci.yml"
    Then it triggers on "pull_request" for branches "develop" and "main"
    And it triggers on "push" for all branches
    And it defines the jobs "lint", "typecheck", "unit", "bdd" and "build"

  @story-5.1.1 @ci-contract
  Scenario: PR smoke E2E runs against the staging Supabase
    Given the workflow "e2e.yml"
    Then it triggers on "pull_request" for branches "develop" and "main"
    And it runs Playwright with "--grep @smoke"
    And it reads the Supabase URL from the staging secrets

  @story-5.1.1 @manual
  Scenario: A failing unit test blocks the merge
    Given a pull request to "develop" that breaks a unit test
    When CI finishes
    Then the "unit" check is red
    And GitHub does not allow merging the pull request

  # ── Story 5.1.2: no false greens ──────────────────────────────────────────
  @story-5.1.2 @ci-contract
  Scenario: Missing staging secrets fail the staging E2E job
    Given the workflow "e2e.yml"
    When the required staging secrets are absent
    Then the job fails with a clear "missing secrets" error instead of being skipped

  @story-5.1.2 @ci-contract
  Scenario: Docker build waits for CI by dependency, not by polling
    Given the workflow "docker.yml"
    Then it does not contain "sleep" followed by "gh run watch"
    And it only runs after the "ci.yml" checks succeeded for the same commit

  # ── Story 5.1.3: one test tree, strict BDD ────────────────────────────────
  @story-5.1.3 @ci-contract
  Scenario: Unit tests live in exactly one directory
    Given the repository
    Then no "*.test.ts" file exists in "lib/unit-tests"
    And "npm test" runs "testing/unit/tests"

  @story-5.1.3 @ci-contract
  Scenario: All feature files are wired into Cucumber
    Given the file "cucumber.json"
    Then the default profile includes "docs/testing/song.feature"
    And it includes "docs/testing/setlist-pdf-export.feature"
    And it includes "docs/testing/gitflow-cicd.feature"

  # ── Story 5.1.4: protected long-lived branches ────────────────────────────
  @story-5.1.4 @manual
  Scenario Outline: Long-lived branches are protected
    Given the branch "<branch>"
    Then force pushes are blocked
    And deletion is blocked
    And the rules apply to administrators
    And the required checks are "lint, typecheck, unit, bdd, build, e2e"

    Examples:
      | branch  |
      | main    |
      | develop |

  @story-5.1.4 @manual
  Scenario: develop is the default branch
    Given the GitHub repository settings
    Then the default branch is "develop"

  # ── Story 5.1.5: branch & PR policy ───────────────────────────────────────
  @story-5.1.5 @ci-contract
  Scenario Outline: Pull request base/head policy
    Given a pull request from "<head>" into "<base>"
    When the "pr-lint" workflow runs
    Then the policy check is "<result>"

    Examples:
      | head                              | base    | result |
      | feat/300-new-thing                | develop | pass   |
      | fix/301-bug                       | develop | pass   |
      | chore/tooling                     | develop | pass   |
      | docs/guide                        | develop | pass   |
      | feat/300-new-thing                | main    | fail   |
      | develop                           | main    | pass   |
      | hotfix/302-prod-crash             | main    | pass   |
      | release-please--branches--main    | main    | pass   |
      | random-branch                     | develop | fail   |

  @story-5.1.5 @ci-contract
  Scenario: PR titles must be Conventional Commits
    Given a pull request titled "added stuff"
    When the "pr-lint" workflow runs
    Then the title check fails

  # ── Story 5.1.6: scripts follow Gitflow ───────────────────────────────────
  @story-5.1.6 @script
  Scenario: start-issue branches work from develop
    When I run "scripts/start-issue.sh 300 feat new thing"
    Then the branch "feat/300-new-thing" is created from "origin/develop"

  @story-5.1.6 @script
  Scenario: start-issue branches hotfixes from main
    When I run "scripts/start-issue.sh 302 hotfix prod crash"
    Then the branch "hotfix/302-prod-crash" is created from "origin/main"

  @story-5.1.6 @script
  Scenario: Preview script prints the image names CI actually pushes
    When I run "scripts/dev2preview.sh --dry-run" on branch "feat/300-new-thing"
    Then it prints "ghcr.io/demeesterroeland/sacred-fire-songs-app:feat-300-new-thing"

  @story-5.1.6 @script
  Scenario: No script bypasses branch protection
    Given all files in "scripts/"
    Then none contains "gh pr merge" with "--admin"

  # ── Story 5.1.7: staging CD ───────────────────────────────────────────────
  @story-5.1.7 @ci-contract
  Scenario: Pushing develop builds and deploys staging
    Given the workflows "docker.yml" and "deploy-staging.yml"
    Then a push to "develop" builds images tagged "develop" and the short SHA
    And no image is tagged "latest"
    And "deploy-staging.yml" uses the environment "Staging"
    And it runs "supabase db push" before deploying the app

  @story-5.1.7 @manual
  Scenario: Staging reflects develop after a merge
    Given a feature PR is squash-merged into "develop"
    When the staging pipeline finishes
    Then the staging health endpoint reports the new commit SHA

  # ── Story 5.1.8: production promotion ─────────────────────────────────────
  @story-5.1.8 @ci-contract
  Scenario: Production deploy is gated by an approval
    Given the workflow "deploy-production.yml"
    Then it triggers on "release" type "published"
    And it uses the environment "Production"
    And it deploys the explicit release tag, never "latest"

  @story-5.1.8 @manual
  Scenario: Promotion from develop to main keeps history
    Given "develop" contains squashed commits "feat: a" and "fix: b"
    When the release PR from "develop" into "main" is merged
    Then it is merged with a merge commit
    And Release Please proposes a minor version with both entries in the changelog

  @story-5.1.8 @ci-contract
  Scenario: Promotion PR requires the slow test layers
    Given a pull request from "develop" into "main"
    Then the required checks include the full E2E suite against staging
    And the required checks include the k6 performance thresholds

  # ── Story 5.1.9: back-merge ───────────────────────────────────────────────
  @story-5.1.9 @ci-contract
  Scenario: main is merged back into develop after every push to main
    Given the workflow "back-merge.yml"
    Then it triggers on "push" to "main"
    And it opens a pull request from "main" into "develop"

  @story-5.1.9 @manual
  Scenario: Release version bump reaches develop
    Given Release Please released "v1.8.0" on "main"
    When the back-merge pull request is merged
    Then "package.json" on "develop" has version "1.8.0"

  # ── Story 5.1.10: hotfix ──────────────────────────────────────────────────
  @story-5.1.10 @manual
  Scenario: Hotfix goes straight to production and back to develop
    Given a production bug tracked in issue 302
    When I start "hotfix/302-prod-crash" from "main" and merge its PR into "main"
    Then Release Please releases a patch version
    And the fix is back-merged into "develop"

  # ── Story 5.1.11: test pyramid schedule ───────────────────────────────────
  @story-5.1.11 @ci-contract
  Scenario: Nightly full suite runs against staging
    Given the workflows "e2e.yml" and "performance.yml"
    Then both have a "schedule" trigger
    And both target the staging URL

  @story-5.1.11 @manual
  Scenario: A nightly failure is visible
    Given the nightly E2E run fails
    Then a GitHub issue labelled "ci-nightly" is opened or updated

  # ── Story 5.1.12: supply chain ────────────────────────────────────────────
  @story-5.1.12 @ci-contract
  Scenario: Third-party actions are pinned
    Given every workflow in ".github/workflows"
    Then every "uses:" reference to a third-party action is pinned to a 40-character commit SHA
    And every workflow declares top-level "permissions"

  @story-5.1.12 @ci-contract
  Scenario: Dependabot updates actions and npm
    Given the file ".github/dependabot.yml"
    Then it has update entries for "github-actions" and "npm" targeting "develop"

  # ── Story 5.1.13: documentation ───────────────────────────────────────────
  @story-5.1.13 @manual
  Scenario: Guides describe Gitflow
    Given "docs/guides/git-workflow.md" and "docs/guides/development-workflow.md"
    Then both describe main, develop, work branches and hotfix branches
    And neither says there is no develop branch
    And both have a version header and changelog entry

  # ── Story 5.1.14: cut-over ────────────────────────────────────────────────
  @story-5.1.14 @manual
  Scenario: Dress rehearsal passes end to end
    Given a trivial "docs:" change on a work branch
    When it goes through develop, staging, the release PR, production approval and back-merge
    Then every stage succeeds
    And the run URLs are recorded in "docs/logbook/master-walkthrough.md"
