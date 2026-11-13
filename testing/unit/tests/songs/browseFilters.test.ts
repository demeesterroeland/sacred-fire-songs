// Story 6.2.19 / G5.2 (#522): filter songs by songbook and by language, with counts, in memory.
import { describe, expect, it } from 'vitest';
import {
  applyBrowseFilters,
  browseOptions,
  matchesLanguage,
  matchesSongbook,
  songLanguages,
  songbooksOfVersions,
} from '@/lib/songs/browseFilters';
import type { Song } from '@/lib/songUtils';

const lang = (name: string, slug: string) => ({ name, slug, parent: 'Languages', parentSlug: 'languages' });
const topic = (name: string, slug: string) => ({ name, slug, parent: 'The Elements', parentSlug: 'the-elements' });
const bookA = { id: 'bk-a', name: 'Songbook A' };
const bookB = { id: 'bk-b', name: 'Songbook B' };

let n = 0;
const song = (over: Partial<Song> = {}): Song =>
  ({ id: `s${++n}`, title: 'T', author: '', songKey: null, color: 'red', createdAt: '2026-01-01T00:00:00Z', categories: [], songbooks: [], ...over }) as Song;

describe('songbooksOfVersions', () => {
  it('lists each book once over every version, named by title, else short name', () => {
    const books = songbooksOfVersions([
      { song_version_sources: [{ songbooks: { id: 'bk-a', title: 'Songbook A', short_name: 'SA' } }] },
      { song_version_sources: [{ songbooks: { id: 'bk-a', title: 'Songbook A' } }, { songbooks: [{ id: 'bk-c', title: ' ', short_name: 'SC' }] }] },
    ]);
    expect(books).toEqual([
      { id: 'bk-a', name: 'Songbook A' },
      { id: 'bk-c', name: 'SC' },
    ]);
  });

  it('skips a source without a readable book and a book without a name', () => {
    expect(
      songbooksOfVersions([{ song_version_sources: [{ songbooks: null }, { songbooks: { id: 'x', title: '', short_name: null } }, { original_title: 'Only a title' }] }, { song_version_sources: null }])
    ).toEqual([]);
    expect(songbooksOfVersions(null)).toEqual([]);
  });
});

describe('songLanguages', () => {
  it('reads the language categories only, by parent name or slug', () => {
    const s = song({ categories: [topic('Fire', 'fire'), lang('Spanish', 'espanol'), { name: 'Dutch', slug: 'dutch', parent: null, parentSlug: 'languages' }] });
    expect(songLanguages(s)).toEqual([
      { slug: 'espanol', name: 'Spanish' },
      { slug: 'dutch', name: 'Dutch' },
    ]);
  });
});

describe('matching', () => {
  it('a songbook matches when any version has a source in that book', () => {
    const s = song({ songbooks: [bookA, bookB] });
    expect(matchesSongbook(s, 'bk-b')).toBe(true);
    expect(matchesSongbook(s, 'bk-z')).toBe(false);
    expect(matchesSongbook(song(), 'bk-a')).toBe(false);
    expect(matchesSongbook(song(), undefined)).toBe(true);
  });

  it('a language matches on its category slug', () => {
    const s = song({ categories: [lang('Spanish', 'espanol')] });
    expect(matchesLanguage(s, 'espanol')).toBe(true);
    expect(matchesLanguage(s, 'english')).toBe(false);
    expect(matchesLanguage(s, '')).toBe(true);
  });

  it('applyBrowseFilters keeps songs matching both filters, and all without any', () => {
    const a = song({ songbooks: [bookA], categories: [lang('Spanish', 'espanol')] });
    const b = song({ songbooks: [bookB], categories: [lang('English', 'english')] });
    const ab = song({ songbooks: [bookA, bookB], categories: [lang('English', 'english')] });
    const all = [a, b, ab];
    expect(applyBrowseFilters(all, {})).toBe(all);
    expect(applyBrowseFilters(all, { songbook: 'bk-b' })).toEqual([b, ab]);
    expect(applyBrowseFilters(all, { language: 'english' })).toEqual([b, ab]);
    expect(applyBrowseFilters(all, { songbook: 'bk-a', language: 'english' })).toEqual([ab]);
  });
});

describe('browseOptions: unknown values', () => {
  const a = song({ songbooks: [bookA], categories: [lang('Spanish', 'espanol')] });
  const labels = { unknownSongbook: 'Unknown songbook', unknownLanguage: 'Unknown language' };

  it('labels a book or language in the URL that no song has with the translated "Unknown …", not the raw value', () => {
    const { songbooks, languages } = browseOptions([a], [a], { songbook: 'bk-old', language: 'klingon' }, 'en', labels);
    expect(songbooks).toContainEqual({ value: 'bk-old', label: 'Unknown songbook', count: 0 });
    expect(languages).toContainEqual({ value: 'klingon', label: 'Unknown language', count: 0 });
  });

  it('a known book with no songs in view keeps its name', () => {
    const { songbooks } = browseOptions([a], [], { songbook: 'bk-a' }, 'en', labels);
    expect(songbooks).toEqual([{ value: 'bk-a', label: 'Songbook A', count: 0 }]);
  });
});

describe('browseOptions', () => {
  const a = song({ songbooks: [bookA], categories: [lang('Spanish', 'espanol')] });
  const b = song({ songbooks: [bookB], categories: [lang('English', 'english')] });
  const ab = song({ songbooks: [bookA, bookB], categories: [lang('English', 'english')] });
  const bare = song();
  const all = [a, b, ab, bare];

  it('counts the songs of each book and each language, sorted by name', () => {
    const { songbooks, languages } = browseOptions(all, all, {});
    expect(songbooks).toEqual([
      { value: 'bk-a', label: 'Songbook A', count: 2 },
      { value: 'bk-b', label: 'Songbook B', count: 2 },
    ]);
    expect(languages).toEqual([
      { value: 'english', label: 'English', count: 2 },
      { value: 'espanol', label: 'Spanish', count: 1 },
    ]);
  });

  it('a count follows the other filter, not its own: with language English, book A has 1 song', () => {
    const { songbooks } = browseOptions(all, all, { language: 'english' });
    expect(songbooks.map((o) => [o.value, o.count])).toEqual([['bk-a', 1], ['bk-b', 2]]);
    // and with book B chosen, the languages count only book B songs; the language's own choice never narrows its count
    const second = browseOptions(all, all, { songbook: 'bk-b', language: 'english' });
    expect(second.languages.map((o) => [o.value, o.count])).toEqual([['english', 2], ['espanol', 0]]);
  });

  it('counts come from the base list (the other filters applied), options from all songs', () => {
    const base = [a]; // for example after a text search that only found `a`
    const { songbooks, languages } = browseOptions(all, base, {});
    expect(songbooks.map((o) => [o.value, o.count])).toEqual([['bk-a', 1], ['bk-b', 0]]);
    expect(languages.map((o) => [o.value, o.count])).toEqual([['english', 0], ['espanol', 1]]);
  });

  it('a book with the same title as another is told apart by its id, and sorts by name case-insensitively', () => {
    const x = song({ songbooks: [{ id: 'bk-1', name: 'alpha' }] });
    const y = song({ songbooks: [{ id: 'bk-2', name: 'Beta' }] });
    expect(browseOptions([x, y], [x, y], {}, 'en').songbooks.map((o) => o.label)).toEqual(['alpha', 'Beta']);
  });

  it('keeps a chosen value in the list even when no song has it any more', () => {
    const { songbooks } = browseOptions([a], [a], { songbook: 'gone' });
    expect(songbooks.map((o) => [o.value, o.count])).toContainEqual(['gone', 0]);
  });
});
