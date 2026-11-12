// Story 6.2.12 / G2.3 (#515) — docs/testing/ux-v3-all-authors.feature (@unit scenarios)
import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import {
  authorFilterHref,
  joinAuthors,
  songAuthorLabels,
  songAuthors,
  songAuthorNames,
} from '../../../lib/songs/authors';
import { songFilterConfig } from '../../../lib/songs/filterConfig';
import { DICTIONARIES } from '../../../lib/i18n';
import type { Song } from '../../../lib/songUtils';

const en = DICTIONARIES.en as Record<string, string>;
const t = (key: string) => (key === 'song.traditional' ? en['song.traditional'] : (en[key] ?? key));

type World = {
  authors: string[] | null;
  originalAuthor: string | null;
  locale: string;
};
const worlds = new WeakMap<object, World>();
const world = (w: object): World => {
  let state = worlds.get(w);
  if (!state) {
    state = { authors: null, originalAuthor: null, locale: 'en' };
    worlds.set(w, state);
  }
  return state;
};
const songOf = (w: object) => {
  const s = world(w);
  return { authors: s.authors, originalAuthor: s.originalAuthor, author: s.originalAuthor ?? '' } as unknown as Song;
};
const shown = (w: object) => songAuthors({ authors: world(w).authors, originalAuthor: world(w).originalAuthor }, t);

Given('a song with authors {string} and {string}', function (this: object, a: string, b: string) {
  world(this).authors = [a, b];
  world(this).originalAuthor = `${a}, ${b}`;
});
Given('a song with authors {string}, {string} and {string}', function (this: object, a: string, b: string, c: string) {
  world(this).authors = [a, b, c];
  world(this).originalAuthor = `${a}, ${b}, ${c}`;
});
Given(
  'a song whose authors are {string}, {string}, {string} and {string}',
  function (this: object, a: string, b: string, c: string, d: string) {
    world(this).authors = [a, b, c, d];
    world(this).originalAuthor = 'Anna Lee, Ben Cruz';
  }
);
Given('a song with no authors and original author {string}', function (this: object, author: string) {
  world(this).authors = [];
  world(this).originalAuthor = author;
});
Given('a song with no authors and no original author', function (this: object) {
  world(this).authors = [];
  world(this).originalAuthor = null;
});
Given('the UI language is {string}', function (this: object, locale: string) {
  world(this).locale = locale;
});

// The real link: the href the meta line builds, read back from the URL the way the songs page reads `?artist=`.
const artistFromHref = (name: string) => new URL(authorFilterHref(name), 'http://x').searchParams.get('artist') ?? '';

Then('both names are shown and each opens its author filter', function (this: object) {
  const names = shown(this);
  assert.deepEqual(names, world(this).authors);
  for (const name of names) {
    assert.equal(songFilterConfig.artist!.match(songOf(this), artistFromHref(name)), true, `filter for ${name}`);
  }
});
Then('each author link carries the exact name and opens the author filter', function (this: object) {
  const labels = songAuthorLabels({ authors: world(this).authors, originalAuthor: world(this).originalAuthor }, t);
  assert.deepEqual(
    labels.map((a) => a.name),
    world(this).authors
  );
  for (const { name } of labels) {
    const artist = artistFromHref(name);
    assert.equal(artist, name, `href round-trips ${name}`);
    assert.equal(songFilterConfig.artist!.match(songOf(this), artist), true, `filter for ${name}`);
  }
});
Then('the song shows no author link', function (this: object) {
  assert.deepEqual(songAuthorLabels({ authors: world(this).authors, originalAuthor: world(this).originalAuthor }, t), []);
});
Then('the search for {string} finds the song', function (this: object, query: string) {
  assert.equal(songFilterConfig.search!.match({ ...songOf(this), title: 'Untitled' } as Song, query), true);
});
Then('the author filter for {string} finds the song', function (this: object, name: string) {
  assert.equal(songFilterConfig.artist!.match(songOf(this), name), true);
});
Then('the song shows the authors {string} and {string}', function (this: object, a: string, b: string) {
  assert.deepEqual(shown(this), [a, b]);
});
Then('the song shows the authors {string}', function (this: object, a: string) {
  assert.deepEqual(shown(this), [a]);
});
Then('the song shows the author {string}', function (this: object, name: string) {
  assert.deepEqual(shown(this), [name]);
});
Then('the authors are joined as {string}', function (this: object, text: string) {
  assert.equal(joinAuthors(shown(this), world(this).locale), text);
});
Then('the share text names {string}', function (this: object, text: string) {
  // The share text uses every author name (no Traditional placeholder), joined in the UI language.
  const names = songAuthorNames({ authors: world(this).authors, originalAuthor: world(this).originalAuthor });
  assert.equal(joinAuthors(names, world(this).locale), text);
});
