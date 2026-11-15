# ADR 0001 (UXD-1): Bottom navigation: Home · Search · Library

**Version:** 1.1 | **Date:** Nov 5, 2026 | **Status:** Accepted (owner decision)

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.1 | Nov 5, 2026 | Implemented in #408: Search target, "+" placement, `/explore` becomes a 404 (UXA-020). |
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
- E2E specs that click the old Songs/Create tabs must be updated in #408 (none did; `e2e/tests/ux-v2-bottom-bar.spec.ts` is new).

## Implementation (#408)

- **Search** is the song list `/songs`; tapping it also focuses the header search field. No new page.
- **"+"** sits in the Library header on phones, signed-in users only, and opens a sheet with Add Song and New Playlist.
- **`/explore`** has no route; it is an unknown URL and shows the real 404 page (#406).
- Details and consequences: `docs/ux-research/ux-v2-decisions.md` UXA-020.
