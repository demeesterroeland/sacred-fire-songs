// Story 6.2.6 / G1.1 (#509): version labels (songbook short name or language name) and kind order.
import { describe, expect, it } from 'vitest';
import {
  primarySongbookName,
  translationLanguageTag,
  versionBaseLabel,
  type LabelledVersion,
} from '@/lib/songs/versionLabels';
import { sortVersions } from '@/lib/songs/versionOrder';
import { versionOptions } from '@/lib/songs/versionSwitch';
import { DICTIONARIES } from '@/lib/i18n';

const t = (k: string, vars?: Record<string, string | number>) => {
  const text = (DICTIONARIES.en as Record<string, string>)[k] ?? k;
  return vars ? text.replace(/\{(\w+)\}/g, (_m, name) => String(vars[name])) : text;
};

const src = (short: string | null, title = 'Full title', is_primary = true) => ({
  is_primary,
  songbooks: { short_name: short, title },
});

describe('primarySongbookName', () => {
  it('uses the primary source short name', () => {
    expect(primarySongbookName([src('Book B', 'x', false), src('Book A')])).toBe('Book A');
  });
  it('falls back to the songbook title, then to null', () => {
    expect(primarySongbookName([src(null, 'Songbook A, 2nd edition')])).toBe('Songbook A, 2nd edition');
    expect(primarySongbookName([src(' ', ' ')])).toBeNull();
    expect(primarySongbookName([])).toBeNull();
    expect(primarySongbookName(null)).toBeNull();
  });
  it('takes the first source when none is marked primary', () => {
    expect(primarySongbookName([src('Book A', 'x', false), src('Book B', 'x', false)])).toBe('Book A');
  });
  it('accepts an embedded songbook returned as a one-element array', () => {
    expect(primarySongbookName([{ is_primary: true, songbooks: [{ short_name: 'Book A' }] }])).toBe('Book A');
  });
});

describe('translationLanguageTag', () => {
  it('reads a language name in any app language, or a tag', () => {
    expect(translationLanguageTag('English')).toBe('en');
    expect(translationLanguageTag('  engels ')).toBe('en');
    expect(translationLanguageTag('Español')).toBe('es');
    expect(translationLanguageTag('Nederlands')).toBe('nl');
    expect(translationLanguageTag('nl')).toBe('nl');
    expect(translationLanguageTag('Português')).toBe('pt');
  });
  it('is null for anything else', () => {
    expect(translationLanguageTag('Simplified')).toBeNull();
    expect(translationLanguageTag('')).toBeNull();
    expect(translationLanguageTag(null)).toBeNull();
  });
});

describe('versionBaseLabel', () => {
  it('names an original or variant after its songbook', () => {
    const v: LabelledVersion = { id: 'a', version_name: 'Standard', version_kind: 'variant', song_version_sources: [src('Book B')] };
    expect(versionBaseLabel(v, 'en')).toBe('Book B');
    expect(versionBaseLabel({ ...v, version_kind: 'original' }, 'en')).toBe('Book B');
  });
  it('names a translation after its language, in the app language', () => {
    const v: LabelledVersion = { id: 'a', version_name: 'English', version_kind: 'translation' };
    expect(versionBaseLabel(v, 'en')).toBe('English');
    expect(versionBaseLabel(v, 'nl')).toBe('Engels');
    expect(versionBaseLabel(v, 'es')).toBe('Inglés');
    expect(versionBaseLabel({ ...v, version_name: 'Engels' }, 'fr')).toBe('Anglais');
  });
  it('falls back to the version name (translation without a known language, version without a book)', () => {
    expect(versionBaseLabel({ id: 'a', version_name: 'Singable', version_kind: 'translation' }, 'en')).toBe('Singable');
    expect(versionBaseLabel({ id: 'a', version_name: 'Simplified', version_kind: 'variant' }, 'en')).toBe('Simplified');
    expect(versionBaseLabel({ id: 'a', version_name: 'Standard' }, 'en')).toBe('Standard');
  });
  it('returns null when there is nothing to show (caller numbers it)', () => {
    expect(versionBaseLabel({ id: 'a', version_name: ' ' }, 'en')).toBeNull();
  });
});

describe('order: original, variants, translations', () => {
  const at = (n: number) => `2026-01-0${n}T00:00:00Z`;
  it('ranks by kind first, then oldest first', () => {
    const sorted = sortVersions([
      { id: 't', version_kind: 'translation', created_at: at(1) },
      { id: 'v2', version_kind: 'variant', created_at: at(3) },
      { id: 'o', version_kind: 'original', created_at: at(4) },
      { id: 'v1', version_kind: 'variant', created_at: at(2) },
    ] as const);
    expect(sorted.map((v) => v.id)).toEqual(['o', 'v1', 'v2', 't']);
  });
  it('treats a missing kind as original (app-made versions keep their order)', () => {
    const sorted = sortVersions([{ id: 'b', created_at: at(2) }, { id: 'a', created_at: at(1) }]);
    expect(sorted.map((v) => v.id)).toEqual(['a', 'b']);
  });
});

describe('versionOptions with songbooks and languages', () => {
  it('shows both book names', () => {
    const opts = versionOptions(
      [
        { id: 'a', version_name: 'Standard', version_kind: 'original', song_version_sources: [src('Songbook A')] },
        { id: 'b', version_name: 'Standard', version_kind: 'variant', song_version_sources: [src('Songbook B')] },
      ],
      t
    );
    expect(opts!.map((o) => o.label)).toEqual(['Songbook A', 'Songbook B']);
  });
  it('localizes the language of a translation', () => {
    const opts = versionOptions(
      [
        { id: 'a', version_name: 'Standard', version_kind: 'original', song_version_sources: [src('Songbook A')] },
        { id: 'b', version_name: 'English', version_kind: 'translation' },
      ],
      t,
      'nl'
    );
    expect(opts!.map((o) => o.label)).toEqual(['Songbook A', 'Engels']);
  });
  it('numbers two versions of the same book instead of repeating the label', () => {
    const opts = versionOptions(
      [
        { id: 'a', version_kind: 'original', song_version_sources: [src('Songbook A')] },
        { id: 'b', version_kind: 'variant', song_version_sources: [src('Songbook A')] },
      ],
      t
    );
    expect(opts!.map((o) => o.label)).toEqual(['Songbook A 1', 'Songbook A 2']);
  });
});
