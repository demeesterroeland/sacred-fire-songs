/**
 * Pure keyboard logic for WAI-ARIA listbox pickers (components/common/ui/WickSelect.tsx).
 * Same behaviour as the language picker on the i18n branch; DOM-free so it can be unit-tested.
 */

/** Arrow / Home / End navigation, clamped (no wrap). Null for other keys. */
export function keyToIndex(key: string, index: number, count: number): number | null {
  switch (key) {
    case 'ArrowDown':
      return Math.min(index + 1, count - 1);
    case 'ArrowUp':
      return Math.max(index - 1, 0);
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/** Next option after `index` whose label starts with `char` (wraps). */
export function typeaheadIndex(labels: readonly string[], index: number, char: string): number | null {
  if (char.length !== 1) return null;
  const needle = char.toLocaleLowerCase();
  for (let step = 1; step <= labels.length; step++) {
    const i = (index + step) % labels.length;
    if (labels[i].toLocaleLowerCase().startsWith(needle)) return i;
  }
  return null;
}
