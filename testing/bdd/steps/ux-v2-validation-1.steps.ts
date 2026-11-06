// UX v2 validation round 1 — docs/testing/ux-v2-validation-1.feature (@unit scenarios)
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { endBelowFold } from '../../../lib/reader/autoScroll';
import { categoryDisplayName } from '../../../lib/taxonomy/categoryName';
import { songFlags, versionHasChords } from '../../../lib/songs/versionFlags';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

interface State {
  viewport: number;
  endBottom: number;
  versions: Array<{ content_chordpro: string }>;
}
const state = new WeakMap<object, State>();
const get = (w: object): State => {
  let s = state.get(w);
  if (!s) {
    s = { viewport: 800, endBottom: 0, versions: [] };
    state.set(w, s);
  }
  return s;
};
const offered = (w: object) => {
  const s = get(w);
  return endBelowFold({ endBottom: s.endBottom, viewportTop: 0, viewportHeight: s.viewport, scrollTop: 0 });
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
