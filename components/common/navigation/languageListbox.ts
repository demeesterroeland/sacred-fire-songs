/**
 * Pure ordering logic for the LanguageSwitcher listbox
 * (WAI-ARIA listbox pattern). Kept DOM-free so it can be unit-tested.
 */

import type { Locale } from '@/lib/i18n';

const collator = new Intl.Collator('en', { sensitivity: 'base' });

/** Sorted by each language's own name; Latin scripts sort before Cyrillic. */
export function orderLocales(locales: readonly Locale[], labels: Record<Locale, string>): Locale[] {
  return [...locales].sort((a, b) => collator.compare(labels[a], labels[b]));
}

// Keyboard logic is shared with WickSelect (components/common/ui/WickSelect.tsx).
export { keyToIndex, typeaheadIndex } from '@/lib/ui/listbox';
