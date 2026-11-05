# Design Tokens & Component Sheet (UX v2, "sober" style)

**Version:** 1.0 | **Date:** Nov 5, 2026 | **Story:** 6.1.1 / G1.1 (#385) | **Epic:** 6.1 (#375)

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.0 | Nov 5, 2026 | First version: semantic colour tokens (light + dark), type scale, spacing, radius, size and elevation; Tailwind utility map; component sheet; rules from report §5 and ADR 0007. |

## 1. Principles

From the UX research report §5 (`docs/ux-research/2026-11-04-ux-research.md`) and ADR 0007 (UXD-7):

1. **Greys carry all structure.** `--accent` (fire orange) is the only hue: the single primary action on a screen, the now-playing state and chord symbols. `--danger` exists for destructive actions and is always paired with a text label.
2. **Colour never carries meaning alone** (WCAG 1.4.1): status icons get a text label, selected chips are inverted greys plus a check.
3. **No text below 12 px. Text reaches at least 4.5:1** on `--bg` and `--surface` (and `--surface-2` for the grey text tokens).
4. **Touch targets are at least 44 px** (`min-h-tap`, `size-tap`).
5. **Fewer surfaces.** Separate with spacing and `--line`, not shadows or glows. Only floating layers (sheets, dialogs) get `shadow-sheet`.
6. **The ChordPro viewer is the reference style**: same font family, chord colour = accent.
7. **Semantic tokens only.** Components use the utilities in §4, never palette classes (`gray-*`, `red-*`, `amber-*` …). A second style (e.g. "Classic") is a new token file `app/styles/<style>.css` with the same names, scoped by `:root[data-style="<style>"]`.

**Source files:** values in `app/styles/sober.css`; Tailwind mapping in `app/globals.css` (`@theme inline`); JS constants and contrast helpers in `lib/design/tokens.ts`. The unit test `testing/unit/tests/design/designTokens.test.ts` fails when this document and the CSS disagree.

**Mode:** `<html data-style="sober">` always; the `.dark` class switches the mode (set before first paint by the inline script in `app/layout.tsx`; "system" follows `prefers-color-scheme`).

## 2. Colour tokens

Contrast is measured against `--bg` / `--surface` (WCAG 2.2). `—` in Dark means "same as Light".

| Token | Light | Dark | Use |
| :--- | :--- | :--- | :--- |
| `--bg` | `#fbfaf9` | `#0f0e0d` | Page background |
| `--surface` | `#f3f2f0` | `#181716` | Sheets, popovers, inputs, toolbar |
| `--surface-2` | `#e9e7e4` | `#232120` | Hover / pressed, chips, segmented control track |
| `--line` | `#e0ddd9` | `#2c2a28` | Dividers between rows, sheet borders |
| `--line-strong` | `#8a857f` | `#6f6a64` | Input and control borders (≥ 3:1, WCAG 1.4.11) |
| `--text` | `#1a1918` | `#ecebe9` | Titles, body, lyrics (16.8 / 16.2 : 1) |
| `--text-muted` | `#5c5853` | `#a8a39d` | Meta lines, secondary labels (6.8 / 7.7 : 1) |
| `--text-subtle` | `#6b665f` | `#8c8781` | Captions, placeholders, counts (5.5 / 5.4 : 1) |
| `--accent` | `#c23a0c` | `#ff6a2b` | The one hue: primary action, now playing, chords (5.2 / 6.8 : 1) |
| `--accent-ink` | `#ffffff` | `#0f0e0d` | Text on `--accent` (5.4 / 6.8 : 1) |
| `--accent-soft` | `color-mix(in srgb, var(--accent) 12%, transparent)` | — | Selection, now-playing row background |
| `--chord` | `var(--accent)` | — | Chord symbols in the viewer |
| `--danger` | `#b42318` | `#ff6b5e` | Destructive actions, errors; always with a label |
| `--danger-ink` | `#ffffff` | `#0f0e0d` | Text on `--danger` |
| `--focus` | `var(--accent)` | — | Focus outline (2 px, offset 2 px) |
| `--chip-bg` | `var(--surface-2)` | — | Filter chip |
| `--chip-text` | `var(--text)` | — | Filter chip label |
| `--chip-bg-active` | `var(--text)` | — | Selected filter chip (inverted) |
| `--chip-text-active` | `var(--bg)` | — | Selected filter chip label |
| `--scrim` | `rgba(20, 18, 16, 0.42)` | `rgba(0, 0, 0, 0.6)` | Behind sheets and dialogs |
| `--elev-sheet` | `0 -8px 32px rgba(20, 18, 16, 0.16)` | `0 -8px 32px rgba(0, 0, 0, 0.5)` | Shadow of floating layers only |

Accent text is allowed on `--bg` and `--surface`, not on `--surface-2` (4.4 : 1 in light).

## 3. Type, spacing, radius, size

| Token | Value | Tailwind | Use |
| :--- | :--- | :--- | :--- |
| `--fs-caption` | `12px` | `text-caption` | Minimum; captions, counts |
| `--fs-meta` | `13px` | `text-meta` | Meta lines, secondary labels |
| `--fs-body` | `16px` | `text-body` | Body text, inputs |
| `--fs-row` | `16px` | `text-row` | List row title |
| `--fs-title` | `22px` | `text-title` | Page title |
| `--fs-display` | `28px` | `text-display` | Rare: empty states |
| `--lh-tight` | `1.25` | (with the size) | Titles, rows, meta |
| `--lh-body` | `1.5` | (with `text-body`) | Body |
| `--s-1` | `4px` | `p-1`, `gap-1` | Spacing step 1 |
| `--s-2` | `8px` | `p-2`, `gap-2` | Spacing step 2 |
| `--s-3` | `12px` | `p-3`, `gap-3` | Spacing step 3 |
| `--s-4` | `16px` | `p-4`, `gap-4` | Spacing step 4, page gutter |
| `--s-5` | `24px` | `p-6`, `gap-6` | Spacing step 5, section gap |
| `--s-6` | `32px` | `p-8`, `gap-8` | Spacing step 6 |
| `--r-control` | `6px` | `rounded-control` | Buttons, inputs |
| `--r-panel` | `10px` | `rounded-panel` | Segmented control, toolbar, popover |
| `--r-sheet` | `16px` | `rounded-t-sheet` | Bottom sheet top corners |
| `--r-pill` | `999px` | `rounded-pill` | Filter chips only |
| `--tap` | `44px` | `min-h-tap`, `size-tap` | Minimum touch target |
| `--bar-h` | `56px` | `h-bar` | App bar, bottom action bar |

Lyric size (reader-controlled, A− / A+): `LYRIC_STEPS` = 15 · 17 · 19 · 21 · 24 · 28 px in `lib/design/tokens.ts`.

Use only the spacing steps above (Tailwind `1 2 3 4 6 8`) for new layout.

## 4. Tailwind utilities

| Utility | Token |
| :--- | :--- |
| `bg-bg` | `--bg` |
| `bg-surface`, `bg-surface-2` | `--surface`, `--surface-2` |
| `border-line`, `divide-line`, `border-line-strong` | `--line`, `--line-strong` |
| `text-fg`, `text-fg-muted`, `text-fg-subtle` | `--text`, `--text-muted`, `--text-subtle` |
| `bg-accent`, `text-accent`, `text-on-accent`, `bg-accent-soft` | `--accent`, `--accent-ink`, `--accent-soft` |
| `text-chord` | `--chord` |
| `text-danger`, `bg-danger`, `text-on-danger` | `--danger`, `--danger-ink` |
| `bg-chip`, `text-on-chip`, `bg-chip-active`, `text-on-chip-active` | chip tokens |
| `bg-scrim`, `shadow-sheet`, `outline-focus` | `--scrim`, `--elev-sheet`, `--focus` |

shadcn-style names used inside `components/ui` (`bg-primary`, `bg-muted`, `text-muted-foreground`, `border-input`, `ring-ring`, `bg-popover`, …) are aliases of the same tokens. Note: in this project **`accent` means the fire accent**, not shadcn's hover grey; use `bg-surface-2` for hover.

## 5. Component sheet

Primitives in `components/ui/` (React) and the visual sheet `docs/design/screens/v2/screen20_design_system.html` (open in a browser, toggle light/dark). Page mockups: `screen21_song_page.html` … `screen25_playlist_sheet.html`.

| Component | File | Anatomy & rules |
| :--- | :--- | :--- |
| **Button** | `components/ui/button.tsx` | `primary` (accent fill, one per screen) · `secondary` (surface-2 fill) · `outline` · `ghost` · `text` (accent text, no fill) · `destructive`. Height ≥ 44 px on touch (`size="default"`), `icon` is 44 × 44. |
| **ListRow** | `components/ui/list-row.tsx` | One line title (`text-row`, `text-fg`), optional `MetaLine` under it, optional leading icon and trailing slot; divider `border-line`; whole row is the target (≥ 44 px). No card, no border radius, no glow. |
| **MetaLine** | `components/ui/meta-line.tsx` | One grey line (`text-meta`, `text-fg-muted`), items joined by " · ", truncates at the end; optional "show all" expand. Replaces coloured tag chips on cards and the song page. |
| **Chip** | `components/ui/chip.tsx` | Filter-only. `rounded-pill`, `bg-chip`; selected = inverted (`bg-chip-active`) **plus** a check icon and `aria-pressed`. Never decorative. |
| **BottomSheet** | `components/ui/bottom-sheet.tsx` | Radix Dialog at the bottom on mobile (centered dialog ≥ `sm`), `bg-surface`, `rounded-t-sheet`, `shadow-sheet`, `bg-scrim` overlay, grab handle, title, safe-area padding; reserves space for the mini player (`--mini-player-h`). One sheet component for menus, pickers and action sheets. |
| **Toolbar** | `components/ui/toolbar.tsx` | `role="toolbar"`, `bg-surface rounded-panel`, items are 44 px `ToolbarButton`s with text or icon + `aria-label`; toggle buttons use `aria-pressed`. Used for `Chords · A− · A+`. |

## 6. Migration rule for restyle stories

Each restyle story converts the files it touches from palette classes to the utilities in §4. The ratchet test `testing/unit/tests/design/paletteRatchet.test.ts` counts palette classes in `app/` and `components/`; lower its baseline when you remove them, never raise it.
