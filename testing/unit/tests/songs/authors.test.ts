// Story 6.2.12 / G2.3 (#515): every author of a song is shown and linked; fallbacks and joiner.
import { describe, expect, it } from 'vitest';
import { authorSeparators, cleanAuthors, joinAuthors, songAuthorNames, songAuthors } from '@/lib/songs/authors';

const t = (key: string) => (key === 'song.traditional' ? 'Traditional' : key);

describe('cleanAuthors', () => {
  it('trims, drops blank entries and removes duplicates case-insensitively', () => {
    expect(cleanAuthors(['  Anna Lee ', '', '   ', 'anna  lee', 'Ben Cruz'])).toEqual(['Anna Lee', 'Ben Cruz']);
  });

  it('returns an empty list for null, undefined or no entries', () => {
    expect(cleanAuthors(null)).toEqual([]);
    expect(cleanAuthors(undefined)).toEqual([]);
    expect(cleanAuthors([])).toEqual([]);
  });
});

describe('songAuthorNames', () => {
  it('uses every entry of authors', () => {
    expect(songAuthorNames({ authors: ['A', 'B'], originalAuthor: 'A, B' })).toEqual(['A', 'B']);
  });

  it('falls back to original_author when authors is empty', () => {
    expect(songAuthorNames({ authors: [], originalAuthor: 'Herbert Quinteros, Cari El' })).toEqual([
      'Herbert Quinteros',
      'Cari El',
    ]);
    expect(songAuthorNames({ authors: null, originalAuthor: 'Anna Lee' })).toEqual(['Anna Lee']);
  });

  it('treats a blank authors list as empty', () => {
    expect(songAuthorNames({ authors: ['  '], originalAuthor: 'Anna Lee' })).toEqual(['Anna Lee']);
  });

  it('returns nothing when both are empty', () => {
    expect(songAuthorNames({ authors: [], originalAuthor: '  ' })).toEqual([]);
    expect(songAuthorNames({})).toEqual([]);
  });
});

describe('songAuthors (display)', () => {
  it('lists every author', () => {
    expect(songAuthors({ authors: ['A', 'B'] }, t)).toEqual(['A', 'B']);
  });

  it('falls back to Traditional when both are empty', () => {
    expect(songAuthors({ authors: [], originalAuthor: '' }, t)).toEqual(['Traditional']);
    expect(songAuthors({ authors: ['  '], originalAuthor: null }, t)).toEqual(['Traditional']);
  });

  it('translates a Traditional author', () => {
    expect(songAuthors({ originalAuthor: 'traditional' }, t)).toEqual(['Traditional']);
  });
});

describe('authorSeparators and joinAuthors', () => {
  it('joins two names with the English conjunction', () => {
    expect(authorSeparators(['A', 'B'], 'en')).toEqual([' and ']);
    expect(joinAuthors(['A', 'B'], 'en')).toBe('A and B');
  });

  it('gives one separator between each pair of names', () => {
    expect(authorSeparators(['A', 'B', 'C'], 'en')).toEqual([', ', ', and ']);
  });

  it('follows the UI locale', () => {
    expect(joinAuthors(['A', 'B', 'C'], 'es')).toBe('A, B y C');
  });

  it('has no separator for a single name', () => {
    expect(authorSeparators(['A'], 'en')).toEqual([]);
    expect(joinAuthors(['A'], 'en')).toBe('A');
  });
});
