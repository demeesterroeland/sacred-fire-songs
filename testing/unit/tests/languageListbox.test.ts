import { describe, it, expect } from 'vitest';
import { LOCALE_LABELS, SUPPORTED_LOCALES } from '@/lib/i18n';
import { keyToIndex, orderLocales, typeaheadIndex } from '@/components/common/navigation/languageListbox';

describe('orderLocales()', () => {
  it('sorts languages by their own name, Latin scripts before Cyrillic', () => {
    expect(orderLocales(SUPPORTED_LOCALES, LOCALE_LABELS)).toEqual(['en', 'es', 'fr', 'it', 'nl', 'pt', 'qu', 'ru']);
  });
});

describe('keyToIndex()', () => {
  it.each([
    ['ArrowDown', 2, 3],
    ['ArrowDown', 7, 7], // clamps at the end
    ['ArrowUp', 2, 1],
    ['ArrowUp', 0, 0], // clamps at the start
    ['Home', 5, 0],
    ['End', 1, 7],
  ])('%s from %i → %i (8 options)', (key, from, to) => {
    expect(keyToIndex(key, from, 8)).toBe(to);
  });

  it('returns null for keys it does not handle', () => {
    expect(keyToIndex('Enter', 3, 8)).toBeNull();
    expect(keyToIndex('a', 3, 8)).toBeNull();
  });
});

describe('typeaheadIndex()', () => {
  const labels = ['English', 'Español', 'Français', 'Italiano', 'Nederlands', 'Português', 'Runasimi', 'Русский'];

  it('jumps to the next option starting with the typed letter', () => {
    expect(typeaheadIndex(labels, 0, 'n')).toBe(4);
    expect(typeaheadIndex(labels, 0, 'P')).toBe(5);
  });

  it('cycles through options that share a first letter', () => {
    expect(typeaheadIndex(labels, 0, 'e')).toBe(1); // English → Español
    expect(typeaheadIndex(labels, 1, 'e')).toBe(0); // Español → English (wraps)
  });

  it('matches non-Latin first letters', () => {
    expect(typeaheadIndex(labels, 0, 'р')).toBe(7);
  });

  it('returns null when nothing matches', () => {
    expect(typeaheadIndex(labels, 0, 'z')).toBeNull();
    expect(typeaheadIndex(labels, 0, 'Shift')).toBeNull();
  });
});
