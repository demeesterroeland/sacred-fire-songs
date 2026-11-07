# ADR 0004 (UXD-4): Albums: keep on roadmap, hidden for now

**Version:** 1.0 | **Date:** Nov 5, 2026 | **Status:** Accepted (owner decision)

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.0 | Nov 5, 2026 | Recorded the owner decision UXD-4 for Epic 6.1 (UX v2). |

**References:** report §7 Q4, #389 (G1.5), #407 (G5.2) · Epic #375 · report `docs/ux-research/2026-11-04-ux-research.md`

## Context

The Albums tab only shows "Coming soon" and overflows the Library tab row at 390 px (N4).

## Decision

- Keep Albums **on the roadmap, hidden** in the UI.
- Remove every Albums tab, placeholder and "coming soon" text.
- Keep the route and the data model; mark the Albums story **deferred**.

## Consequences

- No dead tab; Library tab row fits 390 px.
- Re-enabling Albums later is a UI change only.
