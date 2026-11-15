# ADR 0002 (UXD-2): Guests may listen to public takes

**Version:** 1.0 | **Date:** Nov 5, 2026 | **Status:** Accepted (owner decision)

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.0 | Nov 5, 2026 | Recorded the owner decision UXD-2 for Epic 6.1 (UX v2). |

**References:** report §7 Q2, #410 (G6.1) · Epic #375 · report `docs/ux-research/2026-11-04-ux-research.md`

## Context

Recordings can be published with singer consent (Epic 4.6). Today the guest Practice drawer only shows reference tracks.

## Decision

- Guests may **listen** to takes that are public **and** published with singer consent, in the song's Practice → Listen tab.
- Recording, sharing, download and "My takes" stay **members-only** behind the unified GuestGate (G6.1, #410).
- Enforced in **RLS / server code**, not only in the UI.

## Consequences

- Guests hear real community takes, which supports learning a song.
- Any guest-facing query must use the public, consented subset; RLS is the source of truth.
