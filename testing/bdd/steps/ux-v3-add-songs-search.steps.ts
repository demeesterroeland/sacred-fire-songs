// Story 6.2.22 / G5.5 (#542) — docs/testing/ux-v3-add-songs-search.feature
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Given, Then, When } from '@cucumber/cucumber';
import { DICTIONARIES, SUPPORTED_LOCALES, interpolate } from '../../../lib/i18n';
import { addSongsResults } from '../../../lib/playlists/addSongsSearch';
import { songMatchHintText } from '../../../lib/songs/search';
import type { Song } from '../../../lib/songUtils';

const en = DICTIONARIES.en as Record<string, string>;
const t = (key: string, params?: Record<string, string | number>) => interpolate(en[key] ?? key, params);

interface SheetWorld {
  songs: Song[];
  query: string;
  offered: Song[];
}
const worlds = new WeakMap<object, SheetWorld>();
const world = (w: object): SheetWorld => {
  let state = worlds.get(w);
  if (!state) worlds.set(w, (state = { songs: [], query: '', offered: [] }));
  return state;
};

let counter = 0;
const song = (over: Partial<Song>): Song =>
  ({
    id: `add${++counter}`,
    title: 'Untitled',
    author: '',
    authors: [],
    aliases: [],
    sourceTitles: [],
    songKey: null,
    color: 'red',
    createdAt: '2026-01-01T00:00:00Z',
    categories: [],
    ...over,
  }) as Song;

const offered = (w: object, title: string): Song => {
  const found = world(w).offered.find((s) => s.title === title);
  assert.ok(found, `"${world(w).query}" should offer "${title}", got [${world(w).offered.map((s) => s.title).join(', ')}]`);
  return found;
};

Given('a catalog song {string} with the alias {string}', function (this: object, title: string, alias: string) {
  world(this).songs.push(song({ title, aliases: [alias] }));
});
Given(
  'a catalog song {string} by {string} with authors {string} and {string}',
  function (this: object, title: string, display: string, a: string, b: string) {
    world(this).songs.push(song({ title, author: display, authors: [a, b] }));
  }
);
Given('a catalog song {string} printed as {string} in a songbook', function (this: object, title: string, original: string) {
  world(this).songs.push(song({ title, sourceTitles: [original] }));
});

When('I search {string} in the "+ Add Songs" sheet of a playlist', function (this: object, query: string) {
  const w = world(this);
  w.query = query;
  w.offered = addSongsResults(w.songs, query);
});

Then('{string} is offered', function (this: object, title: string) {
  offered(this, title);
});
Then('{string} is offered with the hint {string}', function (this: object, title: string, hint: string) {
  const found = offered(this, title);
  assert.equal(songMatchHintText(found, world(this).query, t as never), hint);
});
Then('{string} is offered without a hint', function (this: object, title: string) {
  assert.equal(songMatchHintText(offered(this, title), world(this).query, t as never), null);
});
Then('{string} is offered before {string}', function (this: object, first: string, second: string) {
  const titles = world(this).offered.map((s) => s.title);
  assert.ok(titles.indexOf(first) >= 0 && titles.indexOf(first) < titles.indexOf(second), titles.join(', '));
});
Then('no song is offered', function (this: object) {
  assert.deepEqual(world(this).offered, []);
});
Then('the "+ Add Songs" sheet loads its songs with the song list fetch and has no select of its own', function () {
  const source = readFileSync('components/playlists/AddSongsSheet.tsx', 'utf8');
  assert.match(source, /fetchAllSongs/);
  assert.equal(/\.from\(\s*['"]compositions['"]/.test(source), false);
  assert.equal(/song_version_sources|song_translations/.test(source), false);
});
Then('every language has the "+ Add Songs" load error', function () {
  for (const locale of SUPPORTED_LOCALES) {
    const dict = DICTIONARIES[locale] as Record<string, string>;
    assert.ok(dict['playlists.addSongs.loadError']?.trim(), locale);
  }
});
