// Story 6.2.12 / G2.3 (#515): every author of a song is shown and linked; fallbacks and joiner.
import { describe, expect, it } from 'vitest';
import {
  authorFieldsForSave,
  authorInputText,
  authorSeparators,
  cleanAuthors,
  joinAuthors,
  songAuthorNames,
  songAuthors,
  songAuthorsText,
  songAuthorLabels,
  authorFilterHref,
} from '@/lib/songs/authors';
import { parseArtists } from '@/lib/songs/artistUtils';
import { SUPPORTED_LOCALES } from '@/lib/i18n';
import { songFilterConfig } from '@/lib/songs/filterConfig';
import type { Song } from '@/lib/songUtils';

const t = (key: string) => (key === 'song.traditional' ? 'Traditional' : key === 'song.noArtist' ? 'No artist' : key);

describe('cleanAuthors', () => {
  it('trims, drops blank entries and removes duplicates case-insensitively', () => {
    expect(cleanAuthors(['  Anna Lee ', '', '   ', 'anna  lee', 'Ben Cruz'])).toEqual(['Anna Lee', 'Ben Cruz']);
  });

  it('also treats accent variants as duplicates, like the filter and the index', () => {
    expect(cleanAuthors(['José', 'Jose', 'JOSÉ'])).toEqual(['José']);
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

  it('falls back to No artist when both are empty', () => {
    expect(songAuthors({ authors: [], originalAuthor: '' }, t)).toEqual(['No artist']);
    expect(songAuthors({ authors: ['  '], originalAuthor: null }, t)).toEqual(['No artist']);
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

  // Quechua (`qu`) has no conjunction data in this ICU: Intl.ListFormat falls back to a plain comma list. It must
  // still give a joiner for every gap, in every UI language.
  it.each(SUPPORTED_LOCALES)('gives a joiner for every gap and a joined phrase in %s', (locale) => {
    const names = ['Anna', 'Ben', 'Cari'];
    const joiners = authorSeparators(names, locale);
    expect(joiners).toHaveLength(2);
    expect(joiners.every((j) => j.length > 0)).toBe(true);
    expect(joinAuthors(names, locale)).toBe(`Anna${joiners[0]}Ben${joiners[1]}Cari`);
  });

  it('qu falls back to a plain list (the ICU build has no conjunction data for it)', () => {
    expect(joinAuthors(['A', 'B'], 'qu')).toMatch(/^A.+B$/);
    expect(authorSeparators(['A', 'B'], 'qu')).toHaveLength(1);
  });

  it('has no separator for a single name', () => {
    expect(authorSeparators(['A'], 'en')).toEqual([]);
    expect(joinAuthors(['A'], 'en')).toBe('A');
  });
});

// Story 6.2.12 (#515): the Add/Edit form keeps authors[] and original_author together.
describe('authorInputText (prefill of the author input)', () => {
  it('uses authors[], joined the way parseArtists splits it', () => {
    const text = authorInputText({ authors: ['Anna Lee', 'Ben Cruz', 'Cari El'], originalAuthor: 'Anna Lee' });
    expect(text).toBe('Anna Lee, Ben Cruz, Cari El');
    expect(parseArtists(text)).toEqual(['Anna Lee', 'Ben Cruz', 'Cari El']);
  });

  it('falls back to original_author when authors is empty', () => {
    expect(authorInputText({ authors: [], originalAuthor: 'Anna Lee, Ben Cruz' })).toBe('Anna Lee, Ben Cruz');
    expect(authorInputText({ authors: null, originalAuthor: 'Anna Lee' })).toBe('Anna Lee');
  });

  it('is empty when there is no author at all', () => {
    expect(authorInputText({ authors: [], originalAuthor: null })).toBe('');
  });
});

describe('authorFieldsForSave', () => {
  it('writes original_author as typed and authors[] from parseArtists', () => {
    expect(authorFieldsForSave('Anna Lee, Ben Cruz / Cari El')).toEqual({
      original_author: 'Anna Lee, Ben Cruz / Cari El',
      authors: ['Anna Lee', 'Ben Cruz', 'Cari El'],
    });
  });

  it('writes an empty list for a blank input', () => {
    expect(authorFieldsForSave('')).toEqual({ original_author: '', authors: [] });
    expect(authorFieldsForSave('   ')).toEqual({ original_author: '   ', authors: [] });
  });

  it('splits a single credit such as "A & B" typed into the input (documented limit)', () => {
    // A single authors[] entry like "A & B" (a catalog credit) is one author in the data, but the form's input
    // is free text split by parseArtists, so saving the form turns it into two authors. Documented in the design doc.
    expect(authorFieldsForSave('A & B').authors).toEqual(['A', 'B']);
  });
});

describe('songAuthorsText (⋮ sheet "by" line and rehearsal drawer)', () => {
  it('names every author, joined in the UI language', () => {
    expect(songAuthorsText({ authors: ['Anna', 'Ben', 'Cari'], originalAuthor: 'Anna' }, t, 'es')).toBe('Anna, Ben y Cari');
  });

  it('falls back to No artist without any author', () => {
    expect(songAuthorsText({ authors: [], originalAuthor: '' }, t, 'en')).toBe('No artist');
  });
});

describe('songAuthorLabels and authorFilterHref', () => {
  it('is empty without an author (Traditional is a placeholder, not an author)', () => {
    expect(songAuthorLabels({ authors: [], originalAuthor: null }, t)).toEqual([]);
  });

  it('keeps the raw name for the URL when the label is translated', () => {
    const tNl = (key: string) => (key === 'song.traditional' ? 'Traditioneel' : key);
    expect(songAuthorLabels({ originalAuthor: 'traditional' }, tNl)).toEqual([{ name: 'traditional', label: 'Traditioneel' }]);
  });

  it('encodes the name as one query value', () => {
    expect(authorFilterHref('José & María, Jr.')).toBe('/songs?artist=Jos%C3%A9%20%26%20Mar%C3%ADa%2C%20Jr.');
    expect(new URL(authorFilterHref('A+B #1'), 'http://x').searchParams.get('artist')).toBe('A+B #1');
  });

  it.each(['José & María, Jr.', 'Ana + Bo', 'C# Group #1'])('the link for "%s" round-trips and finds the song', (name) => {
    const href = authorFilterHref(name);
    expect(new URL(href, 'http://x').searchParams.get('artist')).toBe(name);
    const song = { author: 'display text', authors: [name] } as Song;
    expect(songFilterConfig.artist.match(song, name)).toBe(true);
  });
});
