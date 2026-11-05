// Story 6.1.2 / G1.2 (#386) — docs/testing/ux-v2-song-rows.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { joinMeta } from '../../../components/ui/meta-line';
import { songRowMeta } from '../../../lib/songs/songMeta';

type Cat = { name: string; parent: string | null };
const state = new WeakMap<object, { author: string | null; cats: Cat[]; line?: string }>();
const t = (k: string) => (k === 'song.traditional' ? 'Traditional' : k);

Given(
  'a song by {string} tagged {string} \\(Languages), {string} \\(The Elements) and {string} \\(Artists)',
  function (this: object, author: string, lang: string, element: string, artist: string) {
    state.set(this, {
      author,
      cats: [
        { name: lang, parent: 'Languages' },
        { name: element, parent: 'The Elements' },
        { name: artist, parent: 'Artists' },
      ],
    });
  }
);

Given('a song without author or tags', function (this: object) {
  state.set(this, { author: null, cats: [] });
});

When('the song row meta line is built', function (this: object) {
  const s = state.get(this)!;
  s.line = joinMeta(songRowMeta(s.author, s.cats, t));
});

Then('the meta line reads {string}', function (this: object, expected: string) {
  assert.equal(state.get(this)!.line, expected);
});
