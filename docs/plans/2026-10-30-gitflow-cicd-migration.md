# Gitflow CI/CD Migration — Plan & Orchestration

**Version:** 1.0
**Status:** Draft (planning only — no implementation yet)
**Date:** Oct 30, 2026
**Branch:** `docs/gitflow-migration-plan`
**Tracking:** Epic 5.1 in `docs/logbook/epic&user stories.md` · BDD spec `docs/testing/gitflow-cicd.feature`

## Changelog

| Version | Date | Description of Changes |
| ----- | ----- | ----- |
| **1.0** | Oct 30, 2026 | Initial plan. Online research on Gitflow CI/CD, gap analysis against the current GitHub Flow setup (workflows, scripts, docs, branch protection), target design (`main` / `develop` / `feat|fix|chore|docs/*` / `hotfix/*`), Epic 5.1 with 6 phases, test-pyramid / TDD / BDD strategy for the pipeline itself, and open decisions. |

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` (or `superpowers:subagent-driven-development`) to implement this plan phase by phase. One story = one issue = one branch = one PR into `develop` (after Phase 1 exists; before that, into `main`).

**Goal:** Move Sacred Fire Songs from GitHub Flow (`main` + short-lived branches) to a lightweight Gitflow (`main` = production, `develop` = integration/staging, `feat|fix|chore|docs/*` = work, `hotfix/*` = urgent prod fixes), with a CI/CD pipeline whose quality gates follow the test pyramid and that is itself developed test-first.

**Tech Stack:** GitHub Actions, GitHub rulesets/environments, Release Please v4, GHCR Docker images, Supabase CLI (migrations), Vitest, Cucumber-js, Playwright, k6, bash (+ bats-core, shellcheck, actionlint).

---

## 1. Research Summary

| Topic | Finding | Consequence for us |
|---|---|---|
| Origin & caveat | Vincent Driessen's original model has `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`. His 2020 reflection note advises a simpler flow for teams doing continuous delivery of a single deployed version. | Adopt a **lightweight Gitflow**: keep `develop` as integration + staging, **skip `release/*` branches** (Release Please on `main` already does release prep). Keep `hotfix/*`. |
| Environment mapping | Common mapping: feature → ephemeral/preview, `develop` → staging (auto-deploy), `main` / tags → production (gated). GitHub Environments give per-env secrets + required reviewers. | `develop` → staging (auto), `main` → production behind the existing `Production` environment with required reviewer. |
| Merge strategy | Squash into the integration branch keeps it tidy; promotion `develop` → `main` must be a **merge commit** (not squash), otherwise the branches diverge and every release causes conflicts. | Feature → `develop`: **squash**. `develop` → `main`: **merge commit**. `hotfix/*` → `main`: squash, then back-merge. |
| Release Please | v4 action supports `target-branch`; multi-branch = one workflow per branch. Manifest config supports `prerelease`, `prerelease-type`, `draft`, `force-tag-creation`. It parses all conventional commits since the last release, so a merge commit `develop` → `main` keeps the individual squashed `feat:`/`fix:` messages in the changelog. | Release Please stays on **`main` only**. Optional later: `-rc.N` prereleases from `develop`. Release PR's version bump (package.json, CHANGELOG, manifest) must be **back-merged** `main` → `develop`. |
| Protection | Required status checks, no force-push, enforce for admins, linear history only where squash is used. Pin third-party actions to SHAs. | Today `main` has **no required checks**, `allow_force_pushes: true`, `enforce_admins: false`. Must fix on both long-lived branches (rulesets). |
| Test placement | Fast tests on every push/PR, E2E before production on a staging-like env. | See §5 pipeline matrix. |

Sources: [nvie.com — A successful Git branching model (+2020 note)](https://nvie.com/posts/a-successful-git-branching-model/), [release-please-action README](https://github.com/googleapis/release-please-action), [release-please manifest docs](https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md), [release-please #510 (per-branch prerelease)](https://github.com/googleapis/release-please/issues/510), [DeployHQ — CI/CD pipeline guide](https://deployhq.com/blog/ci-cd-pipelines-complete-guide), [DeployHQ — branching strategies](https://www.deployhq.com/blog/5-effective-git-branching-strategies-for-streamlined-development.md), [Ataiva — GitHub Actions CI/CD](https://ataiva.com/building-cicd-pipelines-with-github-actions), [GitHub Actions best practices](https://awesome-copilot.github.com/instruction/github-actions-ci-cd-best-practices/).

---

## 2. Current State (verified Oct 30, 2026)

### 2.1 Workflows

| Workflow | Trigger | What it does | Problem |
|---|---|---|---|
| `docker.yml` | push `main`, tags `v*`, release, dispatch | Builds `…-app` + `…-migrator` images to GHCR; on `main` polls `e2e.yml` with `sleep 5` + `gh run watch` | Race-prone polling instead of `needs`/`workflow_run`; "no E2E run found → proceed" fails open. |
| `e2e.yml` | push/PR `main`, dispatch | `@smoke` Playwright vs staging Supabase | 🔴 **False green**: secrets `SUPABASE_PROJECT_ID_STAGING` and `SUPABASE_DB_PASSWORD_STAGING` are not set, so the job **skips and reports success** (confirmed in run 41120358783). |
| `performance.yml` | dispatch, PR `labeled` (`perf-test`) | k6 against beta URL | Docs claim it runs on every PR — it does not. |
| `release-please.yml` | push `main` | Release PR, tag, GitHub Release | OK; unpinned action. |
| `deploy-db.yml` | — | **Deleted** in `2eac72a` | Still referenced in `e2e.yml` header, `e2e-test-overview.md` and `master-tasks.md`. Staging/prod migrations are now manual. |
| **(missing)** `ci.yml` | — | — | 🔴 **No lint, typecheck, unit, BDD or build check runs on any PR.** No `lint`/`typecheck` npm scripts. |

### 2.2 Repo settings

- `main` protection: required checks `[]`, `allow_force_pushes: true`, `enforce_admins: false`, 0 reviews, conversation resolution on.
- Environments `Preview` and `Production` exist but no workflow uses `environment:`.
- Repo secrets: only `E2E_TEST_PASSWORD`, `RELEASE_PLEASE_TOKEN`, `SUPABASE_PUBLISHABLE_KEY_STAGING`.
- No `develop` branch. Default branch `main`.

### 2.3 Scripts

| Script | Problem |
|---|---|
| `start-issue.sh` | Branches from local `main` (not `origin/…`); hard-coded base. |
| `dev2preview.sh` | Header says `deploy-to-preview.sh`; prints image `ghcr.io/…/sacred-fire-songs:<tag>` but CI pushes `…/sacred-fire-songs-app` → wrong pull instructions. |
| `preview2prod.sh` | Header says `promote-to-production.sh`; merges with **`--admin`** (bypasses protection, conflicts with global rule "never `--admin`"); squash-merges straight to `main`; merges Release PR; latest-run lookup for Docker can grab the wrong run. |

### 2.4 Tests (pyramid today)

| Layer | Assets | In CI? |
|---|---|---|
| Unit (Vitest) | `lib/unit-tests/*.test.ts` **and** `testing/unit/tests/*.test.ts` — duplicated, already diverged (`artistUtils` only in `lib/`, `pdfExport` only in `testing/`) | ❌ |
| BDD (Cucumber) | `docs/testing/song.feature`, 1 step file, `strict: false`; `setlist-pdf-export.feature` not wired | ❌ |
| Integration (seeded DB) | `@seed` BDD profile, `setup-test-db.mjs` | ❌ |
| E2E (Playwright) | 9 specs, `@smoke` subset | ⚠️ skipped (false green) |
| Performance (k6) | 3 scripts | label-only |

### 2.5 Documentation

- `docs/guides/git-workflow.md` v1.0 — explicitly "no `dev` branch"; whole guide is GitHub Flow.
- `docs/guides/development-workflow.md` — GitHub Flow; **missing version header/changelog** (violates doc rule); claims PR E2E runs on "isolated staging container".
- `CLAUDE.md` (project) — branch rules mention only `main`.
- Global `~/.claude/CLAUDE.md` ship triggers ("merge", "release", "klaar") assume PR → `main`.
- `.github/pull_request_template.md` — no target-branch guidance, no BDD/E2E checkbox.
- `docs/design/application-analysis&design.md` — no CI/CD / branching section.
- Skills `/start-story`, `/create-issue`, `/sync-artifacts` — assume base `main`.

---

## 3. Gap Analysis — what is still needed

| # | Area | Gap | Story |
|---|---|---|---|
| G1 | Quality gate | No PR CI (lint, typecheck, unit, BDD, build) | 5.1.1 |
| G2 | Quality gate | E2E false green; fails open in `docker.yml` | 5.1.2 |
| G3 | Tests | Duplicate unit test dirs; BDD not strict; second feature not wired | 5.1.3 |
| G4 | Branching | No `develop`; no protection/rulesets on either long-lived branch | 5.1.4 |
| G5 | Branching | No branch-name / PR-title / target-branch enforcement | 5.1.5 |
| G6 | Scripts | `start-issue.sh` base, wrong image names, `--admin` merge, misnamed headers | 5.1.6 |
| G7 | Staging CD | No auto build/deploy of `develop`; no migration pipeline (deploy-db deleted) | 5.1.7 |
| G8 | Prod CD | No `environment: Production` gate; promotion is a local script with admin bypass | 5.1.8 |
| G9 | Release | Release PR bump never reaches `develop` (back-merge missing) | 5.1.9 |
| G10 | Hotfix | No hotfix path | 5.1.10 |
| G11 | Test pyramid | No tiered test schedule (per push / per PR / nightly / pre-release) | 5.1.11 |
| G12 | Supply chain | Unpinned actions, no Dependabot for actions, no `permissions:` minimum everywhere | 5.1.12 |
| G13 | Docs | git-workflow, development-workflow, CLAUDE.md (project + global ship triggers), PR template, design doc, e2e overview, skills | 5.1.13 |
| G14 | Cut-over | Open PRs (#220 merged; `feat/246`, `feat/userstory-3.6` open) must be retargeted | 5.1.14 |

---

## 4. Target Design

### 4.1 Branch model

```text
main      ──●────────────────────────●─────────────●──── v1.8.0 ── v1.8.1
            │ (branch develop once)  ▲ merge commit▲ squash      │
            ▼                        │ (release PR)│ hotfix/301  │ back-merge
develop   ──●──●──────●──────●───────┘─────────────┼─────────────●──── (staging)
               ▲      ▲      ▲                     │
               │sq    │sq    │sq            hotfix/301-… (from main)
feat/257-…  ●──┘      │      │
fix/262-…        ●────┘      │
chore/…                ●─────┘
```

| Branch | Base | Merges into | Merge type | Deploys to |
|---|---|---|---|---|
| `feat/<n>-…`, `fix/<n>-…`, `chore/…`, `docs/…` | `origin/develop` | `develop` | squash (PR title = Conventional Commit) | optional on-demand preview image |
| `develop` | — | `main` (via "Release PR: develop → main") | **merge commit** | **staging** (auto) |
| `main` | — | — | — | **production** (tag + approval) |
| `hotfix/<n>-…` | `origin/main` | `main`, then auto back-merge to `develop` | squash | production |
| `release-please--branches--main` | bot | `main` | merge | — |

Decision recommended: **no `release/*` branches** (single deployed version, Release Please handles release prep). Revisit only if a release freeze on `develop` becomes painful.

### 4.2 Pipeline matrix (test pyramid → when it runs)

| Stage / event | Lint + typecheck | Unit (Vitest) | BDD `@unit` | Build | Integration `@seed` + E2E `@smoke` (local Supabase in runner) | Full E2E | k6 perf | Deploy |
|---|---|---|---|---|---|---|---|---|
| Push to work branch | ✅ | ✅ | ✅ | — | — | — | — | — |
| PR → `develop` | ✅ | ✅ | ✅ | ✅ | ✅ (required) | — | label | — |
| Push `develop` | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | image `:develop` + `:sha` → staging migrations → staging |
| Nightly on `develop` | | | | | | ✅ vs staging | ✅ vs staging | — |
| PR `develop` → `main` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ vs staging (required) | ✅ (required, thresholds) | — |
| Push `main` | | | | | | | | Release Please PR |
| Release published / tag `v*` | | | | ✅ | | | | image `:vX.Y.Z` → `environment: Production` (approval) → prod migrations → deploy |
| PR `hotfix/*` → `main` | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — |

Pyramid ratio target: many fast unit/BDD-unit tests (seconds) → fewer integration (`@seed`, local Supabase) → few E2E smoke per PR → full E2E + perf only at promotion. E2E per PR runs against a **disposable local Supabase** (`supabase start` in the runner) so it no longer depends on staging secrets or shared state.

### 4.3 Workflow files (target)

| File | Purpose |
|---|---|
| `ci.yml` (new) | Reusable + PR/push quality gate: lint, typecheck, unit, BDD `@unit`, build, integration/E2E smoke on local Supabase. Job names are the required checks. |
| `e2e.yml` | Becomes full-suite vs staging (nightly + PR to `main`); **fails** when secrets are missing on protected targets. |
| `docker.yml` | Build on `develop` (`:develop`, `:sha`), tags/releases (`:vX.Y.Z`), dispatch (preview); `needs:` CI instead of polling; drop `:latest`. |
| `deploy-staging.yml` (new) | On successful `develop` image: Supabase migrations to staging → deploy hook/SSH to staging server. `environment: Preview` (rename to `Staging`). |
| `deploy-production.yml` (new) | On release published: `environment: Production` (required reviewer) → prod migrations → deploy explicit tag. |
| `release-please.yml` | `main` only; pinned; outputs feed back-merge. |
| `back-merge.yml` (new) | After push to `main` (release or hotfix): open/auto-merge PR `main` → `develop`. |
| `pr-lint.yml` (new) | PR title = Conventional Commit; head/base policy (work → `develop`, `hotfix/*`/`develop`/bot → `main`). |
| `performance.yml` | Add PR-to-`main` + nightly triggers; fail on threshold breach. |
| `workflow-lint.yml` (new) | actionlint + shellcheck + bats + workflow-contract tests on `.github/**` and `scripts/**` changes. |

---

## 5. How the pipeline itself is built: Test Pyramid + TDD + BDD

The migration is infrastructure, but it is **specified and tested like product code**.

| Pyramid layer | What we test | Tooling | Written when |
|---|---|---|---|
| **Unit** | Script logic (branch naming, base branch, image tag slug, PR target rules); workflow **contracts** (triggers, required job names, `permissions`, `needs`, pinned SHAs) by parsing YAML | `bats-core` for bash; Vitest `testing/unit/tests/ci/*.test.ts` with `yaml` parser | **Before** each change (TDD red → green → refactor) |
| **Static** | Workflow syntax/expressions, shell bugs | `actionlint`, `shellcheck` | Every PR touching `.github/` or `scripts/` |
| **Integration** | Workflow runs end-to-end on a sandbox branch (`sandbox/gitflow-*`) or locally via `act` where feasible | `gh workflow run`, `act` | Per story, before PR |
| **Acceptance (BDD)** | Gherkin scenarios in `docs/testing/gitflow-cicd.feature`, one `@story-5.1.x` tag per story; the YAML-contract scenarios are automated with Cucumber (`@ci-contract`), the live-GitHub ones are `@manual` checklists executed on the sandbox | Cucumber-js (`test:bdd` profile `ci`) | Written in **Phase 0**, before any workflow change |
| **E2E (pipeline)** | Dress rehearsal: feature → `develop` → staging → release PR → `main` → prerelease/draft release → prod approval (dry-run deploy) → back-merge | Real GitHub, `draft: true` release | Phase 5, before cut-over |

**TDD rule per task:** (1) add/extend failing contract or bats test, (2) run it red, (3) change workflow/script, (4) green, (5) actionlint/shellcheck, (6) tick the matching Gherkin scenario.

**BDD rule per story:** the story's Gherkin in `epic&user stories.md` is the acceptance definition; `gitflow-cicd.feature` mirrors it executable-first. A story is Done only when all its scenarios pass (automated) or are signed off (manual, with run URL recorded in `master-walkthrough.md`).

---

## 6. Phases, Stories & Tasks

Each phase ends with a green gate before the next starts. Story IDs map to `docs/logbook/epic&user stories.md` Epic 5.1.

### Phase 0 — Specification & test harness (no behaviour change)
**Exit:** BDD feature + contract test harness exist and run (red where expected), GitHub issues created.

- [ ] 0.1 Create GitHub issues for Epic 5.1 + stories 5.1.1–5.1.14 via `/create-issue` (Gherkin from epic doc).
- [ ] 0.2 Add `docs/testing/gitflow-cicd.feature` to `cucumber.json` as profile `ci` (`@ci-contract`).
- [ ] 0.3 Add `yaml` devDependency; scaffold `testing/unit/tests/ci/workflowContract.test.ts` with helper `loadWorkflow(name)`.
- [ ] 0.4 Add `bats-core` (devDependency `bats`) + `testing/scripts/*.bats` scaffold; `npm run test:scripts`.
- [ ] 0.5 Add `npm run lint` (`eslint .`) and `npm run typecheck` (`tsc --noEmit`); record current error baseline (fix or allowlist).

### Phase 1 — Quality gate on today's flow (value even without Gitflow)
**Exit:** every PR to `main` runs required CI; no false greens. *Stories 5.1.1, 5.1.2, 5.1.3, 5.1.12.*

- [ ] 1.1 TDD: contract test "ci.yml runs on pull_request to main+develop and push to all branches; has jobs `lint`, `typecheck`, `unit`, `bdd`, `build`". → create `ci.yml`.
- [ ] 1.2 TDD: contract "e2e job fails (not skips) when secrets missing and base is protected" → fix `e2e.yml`; set missing staging secrets or switch smoke to local Supabase (decision D4).
- [ ] 1.3 Add `integration` job: `supabase start` + `setup-test-db.mjs` + `test:bdd:seed` + Playwright `@smoke` against local stack.
- [ ] 1.4 Dedupe unit tests into one dir (recommend `testing/unit/tests/`, move `artistUtils`, delete `lib/unit-tests/*.test.ts` copies after diff); point `npm test` at it; update CLAUDE.md testing section.
- [ ] 1.5 Wire `setlist-pdf-export.feature`; flip BDD `strict: true` for implemented tags.
- [ ] 1.6 Replace `docker.yml` E2E polling with `needs`/`workflow_run` on CI success; fail closed.
- [ ] 1.7 Pin actions to SHAs, add `.github/dependabot.yml` (github-actions + npm), least-privilege `permissions:`.
- [ ] 1.8 `workflow-lint.yml` (actionlint, shellcheck, bats, contract tests).
- [ ] 1.9 Ruleset on `main`: required checks from 1.1/1.3, block force-push, block deletion, include admins.

### Phase 2 — Introduce `develop` + branch policy
**Exit:** `develop` exists, protected; new work targets it. *Stories 5.1.4, 5.1.5, 5.1.6.*

- [ ] 2.1 Create `develop` from `main` (`gh api` / UI); ruleset: required CI checks, squash-only, block force-push, include admins.
- [ ] 2.2 `main` ruleset: allow merge commits (for `develop` → `main`) + squash (hotfix), disallow rebase; require PR from `develop`, `hotfix/*` or Release Please (enforced by `pr-lint.yml`).
- [ ] 2.3 Set default branch → `develop` (decision D1) so `gh pr create` and GitHub UI target it by default.
- [ ] 2.4 TDD (bats): `start-issue.sh` bases on `origin/develop`, `hotfix` type bases on `origin/main`, validates type ∈ {feat,fix,chore,docs,hotfix}.
- [ ] 2.5 `pr-lint.yml`: Conventional-Commit title (e.g. `amannn/action-semantic-pull-request`, pinned) + head/base matrix check.
- [ ] 2.6 TDD (bats): fix image names in `dev2preview.sh` (`-app`), rename headers; make preview build optional (staging replaces most preview needs).

### Phase 3 — Staging CD from `develop`
**Exit:** merge to `develop` → staging updated with migrations, automatically. *Story 5.1.7.*

- [ ] 3.1 TDD contract: `docker.yml` on push `develop` tags `:develop` + `:sha-<short>`; never `:latest`.
- [ ] 3.2 Rename environment `Preview` → `Staging`; move staging secrets to environment scope (`SUPABASE_PROJECT_ID`, `SUPABASE_DB_PASSWORD`, `SUPABASE_ACCESS_TOKEN`, deploy key/hook).
- [ ] 3.3 `deploy-staging.yml`: `supabase db push --include-all` (resurrect from `git show 2eac72a^:.github/workflows/deploy-db.yml`) → deploy (decision D3: SSH `docker compose pull && up -d` vs Coolify/Watchtower webhook) → health check URL.
- [ ] 3.4 Nightly `e2e.yml` full suite + `performance.yml` vs staging; failure opens/updates a GitHub issue.

### Phase 4 — Release, production & hotfix
**Exit:** `develop` → `main` → tag → approved prod deploy → back-merge, all in CI. *Stories 5.1.8, 5.1.9, 5.1.10.*

- [ ] 4.1 New script `scripts/develop2main.sh` (replaces `preview2prod.sh` promotion part): opens PR `develop` → `main` titled `chore(release): promote develop to main`, body = list of squashed commits since last tag; waits checks; **merge commit**, no `--admin`.
- [ ] 4.2 PR-to-`main` required checks: full E2E vs staging + k6 thresholds.
- [ ] 4.3 `release-please.yml`: pinned, `target-branch: main`; decide `draft`/`force-tag-creation` (D5).
- [ ] 4.4 `deploy-production.yml` on `release: published`: `environment: Production` (required reviewer = owner), prod migrations, deploy explicit `vX.Y.Z`, smoke check, inject release summary (moved from `preview2prod.sh`).
- [ ] 4.5 `back-merge.yml`: on push `main` → PR `main` → `develop` (auto-merge when no conflict; on conflict, label + notify).
- [ ] 4.6 Hotfix: `start-issue.sh <n> hotfix …` → PR to `main` → release → back-merge. bats + contract tests.
- [ ] 4.7 Retire `preview2prod.sh` (or reduce to wrapper calling 4.1) — remove `--admin`.

### Phase 5 — Documentation, agent tooling & cut-over
**Exit:** docs 100% aligned; dress rehearsal passed; open branches retargeted. *Stories 5.1.13, 5.1.14.*

- [ ] 5.1 Rewrite `docs/guides/git-workflow.md` → v2.0 Gitflow (branch table, diagram, merge types, hotfix, golden rules, checklist).
- [ ] 5.2 `docs/guides/development-workflow.md` → add version header, environments table (local / preview / staging / prod), remove false claims.
- [ ] 5.3 Project `CLAUDE.md`: branch protection on `main` **and** `develop`; PRs target `develop`; testing pyramid commands.
- [ ] 5.4 Global `~/.claude/CLAUDE.md` ship triggers: "merge" = PR → `develop`; "release" = `develop2main.sh` + approval; "klaar" = both. (User-level file — confirm before editing.)
- [ ] 5.5 PR template: target-branch note, test-pyramid checklist (unit/BDD/integration/E2E), Gherkin scenario IDs.
- [ ] 5.6 `application-analysis&design.md`: new "Delivery Pipeline & Branching" section; bump version.
- [ ] 5.7 `e2e-test-overview.md`: remove `deploy-db.yml` claim; document local-Supabase smoke vs staging full suite.
- [ ] 5.8 Skills `/start-story`, `/create-issue`, `/sync-artifacts`: base `develop`.
- [ ] 5.9 Dress rehearsal (pipeline E2E) with a trivial `docs:` change through the full flow using a draft/prerelease; record run URLs.
- [ ] 5.10 Cut-over: retarget open PRs/branches (`feat/246-…`, `feat/userstory-3.6`) to `develop`; announce in README.

---

## 7. Orchestration

| Phase | Parallelisable? | Suggested executor (per routing policy) | Review |
|---|---|---|---|
| 0 | 0.1 ∥ (0.2–0.5) | Claude Sonnet, one branch `chore/5.1-ci-harness` | Gemini Argon (cross-provider) |
| 1 | 1.4/1.5 ∥ 1.1–1.3 ∥ 1.7/1.8 (separate worktrees) | Sonnet ×2–3, `isolation: worktree` | Argon |
| 2 | sequential (repo settings) | owner + Claude (settings need admin) | owner |
| 3 | 3.1 ∥ 3.2, then 3.3 → 3.4 | Sonnet | Argon |
| 4 | 4.1 ∥ 4.4 ∥ 4.5, then 4.6 → 4.7 | Sonnet / Opus for 4.4 (prod safety) | Argon + owner |
| 5 | 5.1–5.8 parallel docs, then 5.9 → 5.10 | Haiku/Flash for doc sweeps, Sonnet for guide rewrite | owner sign-off |

Progress tracking: story status flags (`[Planned]` → `[In Progress]` → `[Implemented]`) in `epic&user stories.md`, GitHub issues per story (sub-issues of the epic), checkboxes in this plan, session entries in `docs/logbook/master-tasks.md`.

---

## 8. Open Decisions (owner)

| ID | Decision | Recommendation |
|---|---|---|
| D1 | Default branch `develop`? | **Yes** — PRs and agents target it by default; Release Please keeps `target-branch: main`. |
| D2 | `release/*` branches? | **No** for now (single deployed version). |
| D3 | Staging deploy mechanism | Reuse current preview server as staging; GitHub Action SSH `docker compose pull && up -d` with `IMAGE_TAG=develop` (or Watchtower polling `:develop`). |
| D4 | PR E2E smoke target | **Local Supabase in runner** (isolated, no secrets); staging only for nightly/full + PR to `main`. |
| D5 | Prereleases from `develop` (`vX.Y.Z-rc.N`) | Defer; start with plain releases on `main`. |
| D6 | Keep Vercel previews? | Only if still used — environments `Preview`/`Production` suggest Vercel; decide whether Docker/self-host is the sole prod target. |
| D7 | Required reviewers | Solo maintainer: 0 approvals on `develop`, `Production` environment approval by owner as the human gate. |

---

## 9. Risks

- **Back-merge conflicts** after Release PR (CHANGELOG/package.json) → automate 4.5 early, keep Release PR the only writer of those files.
- **Squash `develop` → `main` by mistake** → ruleset/`pr-lint` rejects squash for head `develop`; script uses `--merge`.
- **Shared staging DB** flakiness → per-PR E2E on local Supabase (D4); nightly concurrency group.
- **Agent habits** (global CLAUDE.md, skills) still targeting `main` → Phase 5 must land before cut-over announcement; `pr-lint` blocks wrong base meanwhile.
- **Migrations run twice** (staging + prod) must be idempotent → `supabase db push` tracks applied versions; keep `--include-all`.
