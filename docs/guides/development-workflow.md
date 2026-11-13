# Software Development Life Cycle (SDLC) & CI/CD Workflow

**Version:** 2.0
**Status:** Living Document
**Date:** Nov 5, 2026

## Changelog

| Version | Date | Description of Changes |
| ----- | ----- | ----- |
| **2.0** | Nov 5, 2026 | Rewritten for the lightweight Gitflow (Epic 5.1, Story 5.1.13): work branches → `develop` → `main`, `hotfix/*`, automatic back-merge PR, environments table, CI vs CD boundary (this repo builds, tests and publishes images; deploying them is up to each self-hoster). Removed the outdated `:latest` claim. |
| **1.1** | Oct 31, 2026 | Added version header and changelog. Preview script path is now `scripts/cicd/dev2preview.sh` (#274, see `scripts/README.md`). |
| **1.0** | Sep 27, 2026 | Initial version (GitHub Flow, preview and production releases). |

---

This document describes the life cycle of a change in Sacred Fire Songs, from a local branch to a released, versioned container image. The Git details (branch naming, commits, PR rules) are in [git-workflow.md](./git-workflow.md).

**CI vs CD boundary.** This public repository contains **CI** (lint, typecheck, unit, BDD, build, E2E) and **image delivery** (Docker images on GHCR). It contains **no deployment (CD)**: no deploy workflows, SSH keys, GitHub Environments or server details. How and where images are deployed is up to each self-hoster.

## 0. Branches and Environments

| Branch | Purpose | Images published by `docker.yml` | Typical environment (self-hosted) |
| --- | --- | --- | --- |
| `feat/…`, `fix/…`, `chore/…`, `docs/…` | One issue = one short-lived work branch from `origin/develop`, squash-merged into `develop` | on demand via `dev2preview.sh`: `:<branch-slug>` + rolling `:preview` | Local dev, optional preview |
| `develop` | Integration branch (GitHub default branch) | `:develop` + short SHA | Staging |
| `main` | Production line; only promotion PRs, `hotfix/*` and the Release Please PR land here | short SHA; a published release adds `vX.Y.Z` + `X.Y.Z` | Production (explicit `vX.Y.Z`, never `:latest`) |
| `hotfix/<issue>-<desc>` | Urgent production fix from `origin/main`, squash-merged into `main` | — | — |

No image is ever tagged `:latest`.

## 1. Local Development (Work Branches)

**Goal**: Develop in an isolated, safe environment without affecting shared data.

1. **Create an Issue**: Never write code without an issue to track it.
2. **Branch out** with a worktree from `origin/develop`:
   ```bash
   scripts/cicd/start-issue.sh <issue> <feat|fix|chore|docs> <description>
   ```
   (`hotfix` branches from `origin/main` instead, see §6.)
3. **Database Setup**:
   * **Local Supabase**: Run `npx supabase start` to spin up the local database and auth services. Your `.env.local` should point to `http://127.0.0.1:54321`.
   * **Ports**: dev server on `3<issue#>`, production build / Playwright build server on `4<issue#>` (e.g. issue #237 → `3237` / `4237`).
4. **Develop & Commit**: test-first (TDD/BDD), incremental Conventional Commits (`feat: ...`, `fix: ...`).

## 2. Optional Preview (`dev2preview`)

**Goal**: Try a work branch on a real device before it reaches `develop`.

```bash
scripts/cicd/dev2preview.sh            # --dry-run only prints the image names
```

The script pushes the branch and triggers `docker.yml`, which publishes `sacred-fire-songs-app` / `-migrator` tagged with the branch slug and the rolling `:preview` tag. Pointing a preview environment at `:preview` is up to the self-hoster; this repository does not deploy it.

## 3. Pull Request into `develop`

**Goal**: Automated validation and review.

1. **Artifact Sync**: run `/sync-artifacts` and commit the logbook updates on the branch *before* opening the PR.
2. **Open a PR into `develop`** with a Conventional Commit title (it becomes the squash commit and drives Release Please).
3. **Required checks** (`ci.yml`, `pr-lint.yml`, `e2e.yml`): `lint`, `typecheck`, `unit`, `bdd`, `build`, `pipeline`, `isolation`, `pr-policy`, `e2e`.
4. **Merge**: squash-merge into `develop` after review and owner approval. `docker.yml` then publishes `:develop` + short SHA images for staging.

## 4. Promotion `develop` → `main` and Release

**Goal**: Cut a versioned release.

```bash
scripts/cicd/develop2main.sh --dry-run
scripts/cicd/develop2main.sh --notes-file .brain/release-summary.md
```

1. The promotion PR `develop` → `main` is merged with a **merge commit** (never squash, never `--admin`).
2. Release Please opens its release PR on `main`; merging it creates the `vX.Y.Z` tag and GitHub Release.
3. The published release makes `docker.yml` publish `vX.Y.Z` / `X.Y.Z` images.
4. **Deploy** (outside this repo): pin the explicit `vX.Y.Z` tag in your own environment and restart.

## 5. Back-merge `main` → `develop`

After every push to `main` (promotion, release commit, hotfix), `.github/workflows/back-merge.yml` opens or updates the back-merge PR `main` → `develop`. Merge it with a **merge commit** once its checks pass. A PR that does not merge cleanly gets the `back-merge-conflict` label; resolve it on a `chore/…` branch from `develop` that merges `origin/main`.

## 6. Hotfix

```bash
scripts/cicd/start-issue.sh <issue> hotfix <description>   # branch hotfix/<issue>-<desc> from origin/main
```

Open the PR with `--base main` and a `fix:` title, squash-merge it after the checks and owner approval. Release Please then proposes a patch release (§4, steps 2–4), and the back-merge PR (§5) brings the fix into `develop`.
