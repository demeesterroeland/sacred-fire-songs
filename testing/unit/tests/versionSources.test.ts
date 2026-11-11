// Story 6.2.10 / G2.1 (#513): the source line under the lyrics — book · p. 38 · compiled by … (L2, pure).
import { describe, expect, it } from 'vitest';
import { DICTIONARIES, translateFrom } from '@/lib/i18n';
import { formatSourceLine, formatSourceLines, sortSources, type VersionSourceRow } from '@/lib/songs/versionSources';

const t = (key: string, params?: Record<string, string | number>) =>
  translateFrom(DICTIONARIES.en, DICTIONARIES.en, key, params);

const book = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  title: `Songbook ${id}`,
  short_name: null,
  compiler: null,
  ...over,
});

const source = (over: Partial<VersionSourceRow> = {}): VersionSourceRow => ({
  id: 's1',
  is_primary: false,
  original_title: null,
  page: null,
  songbooks: book('A'),
  ...over,
});

describe('formatSourceLine', () => {
  it('credits the book, page and compiler', () => {
    const line = formatSourceLine(source({ page: '38', songbooks: book('A', { compiler: 'Compiler A' }) }), 'Rise Up', t);
    expect(line).toBe('Songbook A · p. 38 · compiled by Compiler A');
  });

  it('uses "pp." for a page range or list', () => {
    expect(formatSourceLine(source({ page: '12-13' }), 'Rise Up', t)).toBe('Songbook A · pp. 12-13');
    expect(formatSourceLine(source({ page: '4, 9' }), 'Rise Up', t)).toBe('Songbook A · pp. 4, 9');
  });

  it('drops the page and the compiler when they are unknown', () => {
    expect(formatSourceLine(source({ page: '  ' }), 'Rise Up', t)).toBe('Songbook A');
  });

  it('shows the original title only when it differs from the song title', () => {
    expect(formatSourceLine(source({ original_title: 'Subir' }), 'Rise Up', t)).toBe('Songbook A · Original title: Subir');
    expect(formatSourceLine(source({ original_title: ' rise up ' }), 'Rise Up', t)).toBe('Songbook A');
  });

  it('falls back to the short name when the book has no title', () => {
    expect(formatSourceLine(source({ songbooks: book('A', { title: '', short_name: 'SBA' }) }), 'Rise Up', t)).toBe('SBA');
  });

  it('reads a songbook that PostgREST returned as a one-item array', () => {
    expect(formatSourceLine(source({ songbooks: [book('A')] as never }), 'Rise Up', t)).toBe('Songbook A');
  });

  it('returns null for a source whose book is unreadable (no line to show)', () => {
    expect(formatSourceLine(source({ songbooks: null }), 'Rise Up', t)).toBeNull();
  });
});

describe('sortSources / formatSourceLines', () => {
  it('lists the primary source first, then the others by book title', () => {
    const rows = [
      source({ id: 'c', songbooks: book('C') }),
      source({ id: 'b', songbooks: book('B'), is_primary: true }),
      source({ id: 'a', songbooks: book('A') }),
    ];
    expect(sortSources(rows).map((r) => r.id)).toEqual(['b', 'a', 'c']);
    expect(formatSourceLines(rows, 'Rise Up', t).map((l) => l.text)).toEqual(['Songbook B', 'Songbook A', 'Songbook C']);
  });

  it('shows nothing for a version without sources, or with undefined (older cached data)', () => {
    expect(formatSourceLines([], 'Rise Up', t)).toEqual([]);
    expect(formatSourceLines(undefined, 'Rise Up', t)).toEqual([]);
    expect(formatSourceLines(null, 'Rise Up', t)).toEqual([]);
  });

  it('does not change the order of the input array', () => {
    const rows = [source({ id: 'b', songbooks: book('B') }), source({ id: 'a', songbooks: book('A'), is_primary: true })];
    sortSources(rows);
    expect(rows.map((r) => r.id)).toEqual(['b', 'a']);
  });
});

describe('source copy in every locale', () => {
  it('has all keys with their placeholders', () => {
    const keys: Record<string, string> = {
      'song.source.label': '',
      'song.source.page': '{page}',
      'song.source.pages': '{page}',
      'song.source.compiledBy': '{compiler}',
      'song.source.originalTitle': '{title}',
    };
    for (const [locale, dict] of Object.entries(DICTIONARIES)) {
      for (const [key, placeholder] of Object.entries(keys)) {
        const value = (dict as Record<string, string>)[key];
        expect(value, `${locale} ${key}`).toBeTruthy();
        if (placeholder) expect(value, `${locale} ${key}`).toContain(placeholder);
      }
    }
  });
});
