// Story 6.2.19 / G5.2 (#522) — docs/testing/ux-v3-browse-filters.feature
import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import type { DataTable } from '@cucumber/cucumber';
import { DICTIONARIES } from '../../../lib/i18n';
import { applyBrowseFilters, browseOptions, type BrowseSelection } from '../../../lib/songs/browseFilters';
import { songListFilterConfig } from '../../../lib/songs/filterConfig';
import { SONGS_SELECT } from '../../../lib/songs/queries';
import type { Song } from '../../../lib/songUtils';

interface BrowseWorld {
  songs: Song[];
  selection: BrowseSelection;
}
const worlds = new WeakMap<object, BrowseWorld>();
const world = (w: object): BrowseWorld => {
  let state = worlds.get(w);
  if (!state) worlds.set(w, (state = { songs: [], selection: {} }));
  return state;
};

const slug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
const list = (text: string) => text.split(',').map((s) => s.trim()).filter(Boolean);
const quoted = (text: string) => [...text.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

Given('these songs:', function (this: object, table: DataTable) {
  world(this).songs = table.hashes().map((row, i) => ({
    id: `s${i}`,
    title: row.title,
    author: '',
    songKey: null,
    color: 'red',
    createdAt: '2026-01-01T00:00:00Z',
    songbooks: list(row.songbooks).map((name) => ({ id: slug(name), name })),
    categories: row.language ? [{ name: row.language, slug: slug(row.language), parent: 'Languages', parentSlug: 'languages' }] : [],
  })) as Song[];
});

When('I filter on {string}', function (this: object, book: string) {
  world(this).selection.songbook = slug(book);
});
When('I filter on the language {string}', function (this: object, language: string) {
  world(this).selection.language = slug(language);
});

/** The list as the song page builds it: the list config (no search, no category) with the songbook and language filters on top. */
Then('only these songs are listed: {}', function (this: object, expected: string) {
  const { songs, selection } = world(this);
  assert.equal(songListFilterConfig.songbook!.isActive('x'), false, 'the engine config leaves both filters to the hook');
  const listed = applyBrowseFilters(songs, selection).map((s) => s.title);
  assert.deepEqual(listed, quoted(expected));
});

Then('the songbook options read {}', function (this: object, expected: string) {
  const { songs, selection } = world(this);
  const { songbooks } = browseOptions(songs, songs, selection, 'en');
  assert.deepEqual(songbooks.map((o) => `${o.label} (${o.count})`), quoted(expected));
});
Then('the language options read {}', function (this: object, expected: string) {
  const { songs, selection } = world(this);
  const { languages } = browseOptions(songs, songs, selection, 'en');
  assert.deepEqual(languages.map((o) => `${o.label} (${o.count})`), quoted(expected));
});

Then('the song list select embeds the sources once and nests the songbook in it', function () {
  assert.equal(SONGS_SELECT.match(/song_version_sources(![\w]+)?\s*\(/g)?.length, 1);
  assert.match(SONGS_SELECT, /song_version_sources\s*\([^()]*songbooks\s*\(\s*id\s*,\s*title\s*,\s*short_name\s*\)\s*\)/);
});

Then('the filter sheet labels exist in {string}', function (locale: string) {
  const dict = DICTIONARIES[locale as keyof typeof DICTIONARIES] as Record<string, string>;
  for (const key of ['search.songbook', 'search.language', 'search.songbook.all', 'search.language.all']) {
    assert.ok(dict[key]?.trim(), `${locale}: ${key}`);
  }
});
