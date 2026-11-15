# ADR 0007 (UXD-7): Theme-ready semantic tokens; ship only the sober style

**Version:** 1.0 | **Date:** Nov 5, 2026 | **Status:** Accepted (owner decision)

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.0 | Nov 5, 2026 | Recorded the owner decision UXD-7 for Epic 6.1 (UX v2). |

**References:** #385 (G1.1) · Epic #375 · report `docs/ux-research/2026-11-04-ux-research.md`

## Context

The owner may later want a user-selectable "Classic (colourful)" style next to the sober one. Hard-coding palette values in components would make that a rewrite.

## Decision

- #385 defines **semantic** tokens (`--surface`, `--text-muted`, `--accent`, `--chip-bg`, …) as CSS variables, scoped by `:root[data-style="sober"]` and crossed with the existing light/dark/system mode (the `.dark` class set by the inline script in `app/layout.tsx`).
- Components use **only semantic tokens**, never palette values. A second style is a token file, not a rewrite.
- Only the **sober** style ships now. A "Classic (colourful)" style and a style picker in Settings → Preferences are a later, separate story (follow-up issue), after sign-off.

## Consequences

- Every restyle story must replace palette classes (`gray-*`, `red-*`, …) with semantic utilities.
- A token-parity unit test guards the token file and the Tailwind theme.
