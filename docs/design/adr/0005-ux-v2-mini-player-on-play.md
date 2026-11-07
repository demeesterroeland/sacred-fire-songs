# ADR 0005 (UXD-5): Mini player appears only after play

**Version:** 1.0 | **Date:** Nov 5, 2026 | **Status:** Accepted (owner decision)

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.0 | Nov 5, 2026 | Recorded the owner decision UXD-5 for Epic 6.1 (UX v2). |

**References:** report §7 Q5, #396 (G3.1) · Epic #375 · report `docs/ux-research/2026-11-04-ux-research.md`

## Context

The mini player auto-loads the reference track of every opened song and covers lyrics, sheets and the drawer (N1, R3).

## Decision

- The mini player appears **only after the user presses play**. It is not a "now playing" bar for every song.
- When it is visible, sheets and the drawer reserve bottom space for it.

## Consequences

- Lyrics are never covered on first open.
- Playback continuity across pages stays for tracks the user started.
