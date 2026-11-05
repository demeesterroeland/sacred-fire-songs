# UX v2: Agent Decisions (ADR-lite)

**Version:** 1.1 | **Date:** Nov 5, 2026 | **Epic:** 6.1 (#375)

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.1 | Nov 5, 2026 | UXA-003 refined (grey bridge); added UXA-004 (Claude-only cross-review) and UXA-005 (`accent` = fire accent). |
| 1.0 | Nov 5, 2026 | Created the decision log for the UX v2 build (UXA-001 to UXA-003). |

Choices the build agent made on its own during UX v2. Owner decisions (UXD-1 to UXD-7) are ADRs in [`docs/design/adr/`](../design/adr/README.md). Entries marked `Confirm: yes` change behaviour, copy tone, data or permissions beyond the story text; they are listed in the GitHub issue "UX v2: decisions to confirm".

| ID | Date | Story | Decision | Confirm |
| :--- | :--- | :--- | :--- | :--- |
| UXA-001 | Nov 5, 2026 | all | Capture scripts live in `scripts/dev/ux/`, not `scripts/ux/` | no |
| UXA-002 | Nov 5, 2026 | #385 | Start from the owner's draft tokens and v2 mockups | no |
| UXA-003 | Nov 5, 2026 | #385 | Semantic tokens via Tailwind `@theme`, grey palettes remapped as a bridge | no |
| UXA-004 | Nov 5, 2026 | all | Cross-review by a different Claude model (owner: Claude models only) | no |
| UXA-005 | Nov 5, 2026 | #385 | `accent` means the fire accent; shadcn hover uses `surface-2` | no |

---

### UXA-001 · Capture scripts path

- **Date / story:** Nov 5, 2026 · all stories
- **Context:** the build prompt names `scripts/ux/capture-*.mjs`; the scripts moved to `scripts/dev/ux/` (scripts layout contract, `docs/ux-research/README.md` v1.2).
- **Options:** (a) move them back; (b) use `scripts/dev/ux/`.
- **Choice:** (b). Screenshots for UX v2 go to `docs/ux-research/screenshots/ux-v2/<issue>/` via `UX_OUT`.
- **Consequences:** none for the app.
- **Confirm:** no

### UXA-002 · Draft tokens and mockups as the starting point

- **Date / story:** Nov 5, 2026 · #385 (G1.1)
- **Context:** an unpublished draft from Nov 4 (`docs/design/screens/v2/`: `tokens.css`, design-system sheet, song page, song list, practice drawer, home, playlist sheet) already turns report §5 into values: warm greys, accent `#c23a0c` / `#ff6a2b` (dark), type 12–28 px, spacing 4–32, radius, one sheet shadow, measured contrast.
- **Options:** (a) design new values; (b) adopt the draft and make it theme-ready (UXD-7).
- **Choice:** (b). Values are kept; names become semantic and are scoped by `data-style="sober"`.
- **Consequences:** the mockups are the visual reference for every restyle story.
- **Confirm:** no

### UXA-003 · Semantic tokens in Tailwind, palette remap as a bridge

- **Date / story:** Nov 5, 2026 · #385 (G1.1)
- **Context:** about 90 components use Tailwind palette classes (`gray-*`, `red-*`, `amber-*`, `indigo-*`). UXD-7 requires components to use semantic tokens only, but each restyle story owns its own screens.
- **Options:** (a) rewrite all components in #385; (b) expose semantic utilities (`bg-surface`, `text-muted`, `text-accent`, …) and leave palette classes to the restyle stories; (c) (b) plus map the Tailwind `gray` scale to the sober warm greys so untouched screens already look calmer.
- **Choice:** (b) + (c) for the grey palettes only: `gray/slate/zinc/neutral/stone-*` render as warm sober greys with the same lightness as Tailwind's (contrast unchanged). Hue palettes (`red`, `amber`, `indigo`, …) are not remapped, because some of them still carry meaning; each restyle story converts its own files. The ratchet test `paletteRatchet.test.ts` (baseline 3081 at #385) only lets the count go down.
- **Consequences:** untouched screens already read calmer; colourful accents remain until their story lands.
- **Confirm:** no

### UXA-004 · Cross-review with Claude models only

- **Date / story:** Nov 5, 2026 · all stories
- **Context:** the build prompt asks for a reviewer from a different model family (Gemini for Claude-authored work). The owner then said to use only Claude models.
- **Options:** (a) Gemini review; (b) a different Claude model than the author.
- **Choice:** (b). Opus-authored work is reviewed by Sonnet; Sonnet- or Haiku-authored work by Opus. The reviewer gets the diff, the Gherkin and the quality bar, not the author's conclusions.
- **Consequences:** less model diversity; mitigated by the blind brief.
- **Confirm:** no

### UXA-005 · `accent` means the fire accent

- **Date / story:** Nov 5, 2026 · #385 (G1.1)
- **Context:** shadcn-style primitives use `bg-accent` for a hover grey; UXD-7 names the fire orange `--accent`.
- **Options:** (a) rename the fire token; (b) keep `--accent` = fire and move shadcn hovers to `bg-surface-2`.
- **Choice:** (b), done in `components/ui/dialog.tsx` and `dropdown-menu.tsx`.
- **Consequences:** new code must not use `bg-accent` for hover states (documented in `design-tokens.md` §4).
- **Confirm:** no
