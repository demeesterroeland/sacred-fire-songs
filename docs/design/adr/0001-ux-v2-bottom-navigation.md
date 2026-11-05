# ADR 0001 (UXD-1): Bottom navigation: Home · Search · Library

**Version:** 1.0 | **Date:** Nov 5, 2026 | **Status:** Accepted (owner decision)

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.0 | Nov 5, 2026 | Recorded the owner decision UXD-1 for Epic 6.1 (UX v2). |

**References:** #408 (G5.3), report §7 Q1, Story 1.1.9 · Epic #375 · report `docs/ux-research/2026-11-04-ux-research.md`

## Context

The mobile bottom bar today has four items (Home, Songs, Library, Create) and `/explore` silently redirects to Home (finding N5). Story 1.1.9 describes Home · Search · Your Library. Practice (recordings) needed a prominent entry point (R1).

## Decision

- Bottom bar has **three items: Home · Search · Library**, matching Story 1.1.9.
- **Create** moves into Library as a "+" button.
- The `/explore` redirect is removed.
- **Practice is not in the bottom nav**; it lives on the song page in the sticky action bar (G2.4, #393).

## Consequences

- Fewer, clearer destinations; Search becomes a first-class tab.
- Create is one extra tap away for contributors (via Library).
- E2E specs that click the old Songs/Create tabs must be updated in #408.
