/**
 * One neutral tag style (Story 6.1.35, #485). Tags and author pills look the same whatever their category: chip
 * greys, inverted greys when selected. The selected state also shows a check and `aria-pressed`, so it never
 * depends on colour alone. Replaces the per-category colour map that lived in `lib/uiUtils.ts`.
 */
export interface TagPillStyle {
  /** Selected filter or toggle: inverted greys. */
  selected?: boolean;
  /** The pill is a link or a button: it gets a hover state. */
  interactive?: boolean;
}

export function tagPillClasses({ selected = false, interactive = false }: TagPillStyle = {}): string {
  if (selected) return 'bg-chip-active text-on-chip-active border-transparent';
  return interactive ? 'bg-chip text-on-chip border-line hover:bg-line' : 'bg-chip text-on-chip border-line';
}
