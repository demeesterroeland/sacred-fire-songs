# Git Workflow & Branching Guidelines: Sacred Fire Songs

**Version:** 1.0
**Status:** Living Document
**Date:** Oct 18, 2026

## Changelog

| Version | Date | Description of Changes |
| ----- | ----- | ----- |
| **1.0** | Oct 18, 2026 | Initial version. Adapted from the generic "Git Workflow Sprint 2 Briefing" to the Sacred Fire Songs GitHub Flow (worktrees, squash merges, Release Please, preview → production scripts). |

---

Sacred Fire Songs uses **GitHub Flow**: `main` is always releasable, every change happens on a short-lived branch, and branches land on `main` only through a verified, squash-merged Pull Request. Versioning and release tags are fully automated by **Release Please**.

This guide covers the **Git side** of the process (branches, commits, PRs, releases). For environments, the preview server and Docker deployment, see [development-workflow.md](./development-workflow.md).

---

## 1. Branch Roles

| Branch | Role & Purpose | Status |
|---|---|---|
| **`main`** | **Production & releases.** Always builds, always deployable. **Nobody commits here directly** (humans or AI agents). Code lands only via squash-merged PRs. Release tags (`v1.6.0`, `v1.7.0`, …) are cut from `main` by Release Please. | 🟢 Stable |
| **`feat/<issue>-<desc>`** | New user-facing functionality (e.g. `feat/257-admin-users`). Triggers a **minor** version bump. | 🔵 Working |
| **`fix/<issue>-<desc>`** | Bug fix (e.g. `fix/242-audio-recording-pop`). Triggers a **patch** version bump. | 🔵 Working |
| **`chore/…`, `docs/…`** | Tooling, scripts, refactors, documentation. Do not trigger a release on their own. | 🔵 Working |
| **`release-please--branches--main`** | Owned by the Release Please bot. Holds the pending `chore(main): release X.Y.Z` PR with the generated `CHANGELOG.md`. **Never commit to it by hand.** | 🤖 Automated |

There is **no `dev` / integration branch**. Its role (integrate and verify before production) is played by the **preview environment**, which runs any feature branch against the staging Supabase project.

> [!TIP]
> Background reading: [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow), [Conventional Commits](https://www.conventionalcommits.org/) and [Release Please](https://github.com/googleapis/release-please).

---

## 2. Visual Overview

```text
==========================================================================================
One feature from issue to production release
==========================================================================================

main     ──●───────────────────────────────●───────────────────────────●──── [TAG: v1.7.0]
           │                               ▲ squash merge (PR #259)    ▲ merge
           │ start-issue.sh                │ "feat(admin): …"          │ Release PR
           ▼                               │                           │
feat/257-admin-users                       │                           │
           ●────●────●────●────●───────────┘                           │
        (empty  (commits, pushed with                                  │
        title    dev2preview.sh → preview)                             │
        commit)                                                        │
                                                                       │
release-please--branches--main        ●────────────────────────────────┘
                              (bot opens/updates "chore(main): release 1.7.0")
```

1. A branch is created from `main` in its own **worktree** (`.worktrees/issue-<n>`).
2. Work is committed in small Conventional Commits and verified on **preview**.
3. The PR is **squash-merged**: the whole branch becomes **one** commit on `main`, using the **PR title** as its message.
4. Release Please reads that message, opens/updates the release PR, and merging it creates the `vX.Y.Z` tag, the GitHub Release and the versioned Docker images.

---

## 3. Why Commit Messages & PR Titles Matter

1. **The PR title *is* the release note.** Because we squash-merge, the PR title becomes the commit on `main`. Release Please parses it to decide the version bump and the changelog section (`feat` → ✨ New features, `fix` → 🐛 Bug fixes, `perf` → ⚡ Performance, `docs` → 📖 Documentation; `chore`/`refactor`/`test`/`build`/`ci` are hidden). A badly formatted title means a missing or wrong release.
2. **Small commits on the branch keep reviews readable.** Commit each logical step (query, component, migration, docs) separately. It makes code review, `git bisect` and the AI logbook (`docs/logbook/`) far easier to follow.

Good commit messages (from this repo's history):

* `feat(admin): implement user overview, details and contributions`
* `fix(scripts): gracefully handle detached HEAD during gh pr merge`
* `chore(scripts): automatically kill local dev servers on successful merge`
* `docs: add Epic 3.6 and Story 3.6.1 for administrative management`

Use `!` or a `BREAKING CHANGE:` footer for breaking changes (e.g. a migration that requires manual action by self-hosters).

---

## 4. Step-by-Step Workflow

### Step 1: Start From an Issue

Never write code without a GitHub Issue. Create one with `/create-issue`, or use `/start-story` to go from user story → branch → plan in one go.

### Step 2: Create the Branch & Worktree

The recommended way is the helper script, run from the **repository root**:

```bash
# scripts/start-issue.sh <issue-number> <type> <description...>
scripts/start-issue.sh 261 feat admin song moderation
cd .worktrees/issue-261
```

This:
* creates branch `feat/261-admin-song-moderation` from `main` in worktree `.worktrees/issue-261`,
* symlinks the root `.env.local` into the worktree,
* creates an **empty commit** titled `feat: admin song moderation (#261)`, which serves as the PR title later.

<details>
<summary>Manual equivalent</summary>

```bash
git fetch origin
git worktree add -b feat/261-admin-song-moderation .worktrees/issue-261 origin/main
ln -s ../../.env.local .worktrees/issue-261/.env.local
```
</details>

> [!NOTE]
> Worktrees let several issues (and several AI agent sessions) run side by side without switching branches. The git **stash is shared** between all worktrees, so don't use a bare `git stash`/`git stash pop`; prefer a temporary WIP commit.

### Step 3: Work With Granular, Focused Commits

```bash
git add lib/admin/serverQueries.ts lib/unit-tests/adminQueries.test.ts
git commit -m "feat(admin): add server queries for user contributions"
```

Before each meaningful commit:
* Run the unit tests: `npx vitest run` (or a single file: `npx vitest run lib/unit-tests/adminQueries.test.ts`).
* Keep docs in sync (see `CLAUDE.md`):
  * new `supabase/migrations/*.sql` → update `docs/design/db-schema.sql` (`/update-schema`),
  * changed `docs/**` files → bump version, date and changelog (`/update-doc-changelog`),
  * code changes → reflect them in `docs/design/application-analysis&design.md`.

Run a local server per issue on its own port: `3<issue#>` for `next dev`, `4<issue#>` for a production build (e.g. `4261`).

**Keeping the branch up to date:** if `main` moved on while you were working, merge it in (no force-push needed, and the squash merge hides the merge commit anyway):

```bash
git fetch origin
git merge origin/main
```

### Step 4: Verify on Preview

```bash
scripts/dev2preview.sh
```

Pushes the branch, triggers the `docker.yml` build (tagged with the branch name **and** the rolling `:preview` tag) and waits for it. Then update the preview server and test the feature there. See [development-workflow.md §2–3](./development-workflow.md#2-the-preview-environment-dev2preview).

### Step 5: Sync Artifacts & Open the Pull Request

1. Run `/sync-artifacts` and **commit the logbook updates** (`docs/logbook/`) on the branch. The promotion script refuses to run with uncommitted logbook changes.
2. Open the PR to `main`:

   ```bash
   gh pr create --base main --fill-first
   ```

   `--fill-first` takes the title from the first commit (the one created by `start-issue.sh`). Double-check that the title is a valid Conventional Commit and that the body contains `Closes #<issue>`.
3. Opening the PR triggers the **Playwright `@smoke` E2E tests** (`e2e.yml`) against staging and the **k6 performance tests** (`performance.yml`). Both must be green.

### Step 6: Promote to Production

Only after the feature has been verified on preview **and** the project owner has explicitly confirmed it:

```bash
scripts/preview2prod.sh --verified --notes-file .brain/release-summary.md
```

The script:
1. enforces the preview verification gate and checks for uncommitted (logbook) changes,
2. creates or finds the PR and waits for all CI checks,
3. **squash-merges** the PR and deletes the remote branch (safely detaching HEAD in the worktree first),
4. stops the local dev servers on ports `3<issue#>` / `4<issue#>`,
5. waits for and merges the **Release Please PR**, which creates the `vX.Y.Z` tag and GitHub Release,
6. prepends the human-readable release summary to the GitHub Release notes,
7. tracks the versioned Docker build and prints the production deployment steps.

Never create version tags or edit `CHANGELOG.md` by hand; Release Please owns both.

### Step 7: Deploy & Clean Up

1. Deploy the **explicit version tag** on production (never `:latest`), as printed by the script.
2. Remove the finished worktree and local branch, from the repository root:

   ```bash
   git worktree remove .worktrees/issue-261
   git branch -D feat/261-admin-song-moderation   # -D: squash merges aren't seen as "merged" by git
   git fetch --prune
   git pull --ff-only origin main
   ```

---

## 5. Golden Rules

* 🚫 **Never commit directly to `main`**, not even a typo fix. Always branch first.
* 🚫 **Never commit to the Release Please branch** or create release tags manually.
* 🚫 **Never merge without preview verification** and explicit confirmation by the project owner. AI agents do not merge PRs or close issues on their own.
* ✅ **One issue = one branch = one PR = one squash commit on `main`.**
* ✅ **PR titles follow Conventional Commits**, because they drive versioning and the changelog.

---

## 6. Pre-Merge Checklist

- [ ] **Tests green locally**: `npx vitest run` passes; `npm run build` succeeds.
- [ ] **Database**: every new migration is mirrored in `docs/design/db-schema.sql`.
- [ ] **Docs in sync**: acceptance criteria in `docs/logbook/epic&user stories.md` verified; `application-analysis&design.md` updated; touched docs have a bumped version + changelog entry.
- [ ] **Logbook committed**: `/sync-artifacts` ran and `docs/logbook/` changes are committed on the branch.
- [ ] **Verified on preview** against the staging Supabase project.
- [ ] **PR ready**: Conventional Commit title, `Closes #<issue>` in the body, E2E smoke and performance checks green.
- [ ] **After release**: the `vX.Y.Z` tag and GitHub Release exist, and production runs that explicit version.
