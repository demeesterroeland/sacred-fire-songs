# ADR 0006 (UXD-6): Delivery via integration branch `feat/ux-v2`

**Version:** 1.0 | **Date:** Nov 5, 2026 | **Status:** Accepted (owner decision)

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.0 | Nov 5, 2026 | Recorded the owner decision UXD-6 for Epic 6.1 (UX v2). |

**References:** Epic 6.1 (#375) · Epic #375 · report `docs/ux-research/2026-11-04-ux-research.md`

## Context

Epic 6.1 changes nearly every screen. Partial restyles on `develop` would leave the app in a mixed look.

## Decision

- All Epic 6.1 stories land in the integration branch **`feat/ux-v2`** (branched from `develop`).
- Story PRs (`feat/<issue>-ux-<slug>`) are squash-merged into `feat/ux-v2` once CI is green and an independent cross-model review passes (standing permission).
- `develop` is merged into `feat/ux-v2` regularly via `chore/ux-v2-sync-<date>` PRs (merge commit).
- `feat/ux-v2` → `develop` is merged **only after the owner's explicit sign-off** on a preview image (`ux-v2-preview`).

## Consequences

- `develop` stays releasable while the rework is in progress.
- `Closes #n` in story PRs takes effect only when `feat/ux-v2` lands in `develop`.
