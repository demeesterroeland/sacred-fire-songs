// UX v2 validation round 1 — docs/testing/ux-v2-validation-1.feature (@unit scenarios)
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { endBelowFold } from '../../../lib/reader/autoScroll';
import { categoryDisplayName } from '../../../lib/taxonomy/categoryName';
import { songFlags, versionHasChords } from '../../../lib/songs/versionFlags';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';
import { actionErrorMessage } from '../../../lib/errors/actionError';
import { hasChords } from '../../../lib/chordProParsing';

interface State {
  viewport: number;
  endBottom: number;
  versions: Array<{ content_chordpro: string }>;
  reserved: number;
}
const state = new WeakMap<object, State>();
const get = (w: object): State => {
  let s = state.get(w);
  if (!s) {
    s = { viewport: 800, endBottom: 0, versions: [], reserved: 0 };
    state.set(w, s);
  }
  return s;
};
const offered = (w: object) => {
  const s = get(w);
  return endBelowFold({ endBottom: s.endBottom, viewportTop: 0, viewportHeight: s.viewport, scrollTop: 0, reservedBottom: s.reserved });
};

Given('a screen {int} px high', function (this: object, h: number) {
  get(this).viewport = h;
});
When('the end of the lyrics is {int} px from the top of the page', function (this: object, y: number) {
  get(this).endBottom = y;
});
Then('auto-scroll is not offered', function (this: object) {
  assert.equal(offered(this), false);
});
Then('auto-scroll is offered', function (this: object) {
  assert.equal(offered(this), true);
});

Given('the category {string} named {string}', function (this: object, slug: string, name: string) {
  const tree = [{ id: 't1', name, slug, emoji: null, icon_name: null, children: [] }];
  assert.equal(categoryDisplayName(slug, tree, []), name);
});
Then('its chip reads {string}', function (this: object, name: string) {
  assert.equal(categoryDisplayName('spiritual-concepts', [{ id: 't1', name, slug: 'spiritual-concepts', emoji: null, icon_name: null, children: [] }], []), name);
});
Then('a category that is not known yet reads {string} for {string}', function (this: object, readable: string, slug: string) {
  assert.equal(categoryDisplayName(slug, [], []), readable);
});

Then('every language has the keys for the favourite toasts, the delete error, the rename toast and the settings intro', function () {
  const keys = ['favorites.toast.added', 'favorites.toast.removed', 'favorites.toast.view', 'song.delete.failed', 'playlists.rename.success', 'settings.pageIntro'];
  for (const locale of SUPPORTED_LOCALES) {
    const dict = DICTIONARIES[locale] as Record<string, string>;
    for (const k of keys) assert.ok(dict[k], `${locale}: ${k}`);
  }
});

Given('a song whose Original has chords and whose Simplified is lyrics only', function (this: object) {
  get(this).versions = [{ content_chordpro: '[E]Fire in the [A]night' }, { content_chordpro: 'Fire in the night' }];
});
Then('the song is flagged as having chords', function (this: object) {
  assert.equal(songFlags(get(this).versions).has_chords, true);
});
Then('the Original offers the Chords switch and transpose', function (this: object) {
  assert.equal(versionHasChords(get(this).versions[0]), true);
});
Then('the Simplified offers neither', function (this: object) {
  assert.equal(versionHasChords(get(this).versions[1]), false);
});

// Review round -------------------------------------------------------------------------------------------
Given('a screen {int} px high with {int} px of fixed bars', function (this: object, h: number, bars: number) {
  get(this).viewport = h;
  get(this).reserved = bars;
});

Given('a server answer {string} and a raw database message', function (answer: string) {
  assert.equal(answer, 'Playlist not found'); // both answers are checked in the Then step
});
Then('the first is shown as its translated message and the second as the generic message', function () {
  const t = (k: string) => `T:${k}`;
  assert.equal(actionErrorMessage('Playlist not found', t), 'T:errors.playlistNotFound');
  assert.equal(actionErrorMessage('duplicate key value violates unique constraint "setlists_pkey"', t), 'T:errors.generic');
});

Given('the versions {string} with lyrics, {string} with lyrics and {string} with lyrics', function (this: object, a: string, b: string, c: string) {
  get(this).versions = [a, b, c].map((tag) => ({ content_chordpro: `${tag}la la` }));
});
Then('only the version with {string} has chords', function (this: object, tag: string) {
  const has = get(this).versions.map((v) => hasChords(v.content_chordpro));
  assert.deepEqual(
    get(this).versions.map((v) => v.content_chordpro.startsWith(tag)),
    has,
  );
});

Then('in every language but Runasimi the favourite toasts name the favourites like the user menu does', function () {
  const stem: Record<string, string> = { en: 'favorites', nl: 'favorieten', es: 'favoritas', it: 'preferiti', ru: 'избран', fr: 'favoris', pt: 'favoritas' };
  for (const [locale, word] of Object.entries(stem)) {
    const dict = DICTIONARIES[locale as keyof typeof DICTIONARIES] as Record<string, string>;
    for (const k of ['userMenu.favorites', 'favorites.toast.added', 'favorites.toast.removed', 'favorites.toast.view']) {
      assert.ok(dict[k].toLowerCase().includes(word), `${locale}: ${k}`);
    }
  }
});
