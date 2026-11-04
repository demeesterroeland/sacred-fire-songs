# UX Research

**Version:** 1.2 | **Date:** Nov 4, 2026

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.2 | Nov 4, 2026 | Capture scripts moved to `scripts/dev/ux/` (scripts layout contract). |
| 1.1 | Nov 4, 2026 | Screenshots stored as WebP (quality 80) to keep the repo small; added `references/`. |
| 1.0 | Nov 4, 2026 | Folder created: research report, screenshot set and capture scripts. |

## Contents

| Path | What |
| :--- | :--- |
| [2026-11-04-ux-research.md](2026-11-04-ux-research.md) | Report: method, screen inventory, user flows, findings, improvement plan. |
| `screenshots/mobile/<role>/` | 390 × 844 screenshots (primary). Roles: `guest`, `member`, `admin`, `gatekeeper` (recipient of shared recordings). |
| `screenshots/desktop/<role>/` | 1440 × 900 screenshots of the routes (secondary). |
| `references/` | Reference images for the design direction (e.g. the `Chords · A− · A+` viewer control). |

File names: `01–32` are routes, `40–80` are interactive states (menus, sheets, drawer, recorder, sharing modals). The report's section 2 maps every number.

## Re-capturing

Requires the app on `http://localhost:3000` against the seeded local Supabase (`npx supabase start`, `npx supabase db reset`) and Playwright installed.

```bash
# routes (all roles); UX_ROLES=guest,member limits roles
node scripts/dev/ux/capture-routes.mjs mobile
node scripts/dev/ux/capture-routes.mjs desktop
# interactive states: drawer, recorder (fake microphone), share / publish / attribution modals
node scripts/dev/ux/capture-flows.mjs mobile
```

If this checkout has no `node_modules`, point at one that does: `PLAYWRIGHT_FROM=/path/to/checkout/ node …`.
Other variables: `UX_BASE_URL`, `UX_OUT`, `NEXT_PUBLIC_DEV_TEST_PASSWORD`.

Song IDs in `scripts/dev/ux/lib.mjs` come from the seed and change when it is regenerated; update them if songs show "Song Not Found".

The scripts write PNG; convert before committing (full-page captures taller than 16 383 px must be cropped first):

```bash
find docs/ux-research/screenshots -name '*.png' -exec sh -c 'cwebp -quiet -q 80 "$1" -o "${1%.png}.webp" && rm "$1"' _ {} \;
```
