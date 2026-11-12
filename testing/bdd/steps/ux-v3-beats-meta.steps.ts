// Story 6.2.7 / G1.2 (#510) — docs/testing/ux-v3-beats-meta.feature (@unit scenarios)
import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { technicalItems, type VersionTechnical } from '../../../lib/songs/songMeta';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

type Translate = Parameters<typeof technicalItems>[1];
const en = DICTIONARIES.en as Record<string, string>;
const t = ((key: string, vars?: Record<string, string | number>) =>
  (en[key] ?? key).replace(/\{(\w+)\}/g, (_, name: string) => String(vars?.[name] ?? `{${name}}`))) as unknown as Translate;

type World = { versions: VersionTechnical[]; selected: number };
const worlds = new WeakMap<object, World>();
const world = (w: object): World => {
  let state = worlds.get(w);
  if (!state) {
    state = { versions: [], selected: 0 };
    worlds.set(w, state);
  }
  return state;
};
const shownValues = (w: object) => technicalItems(world(w).versions[world(w).selected], t);

Given('a song whose versions have capo 5 with beats {string} and capo 0 without beats', function (this: object, beats: string) {
  const state = world(this);
  state.versions = [
    { key: 'E', capo: 5, tuning: null, beats },
    { key: 'E', capo: 0, tuning: null, beats: null },
  ];
  state.selected = 0;
});
When('I switch versions', function (this: object) {
  const state = world(this);
  state.selected = (state.selected + 1) % state.versions.length;
});
Then('the meta line shows the values of the selected version', function (this: object) {
  const state = world(this);
  // After one switch the second version is selected: capo 0 and no beats, so neither is shown.
  assert.equal(state.selected, 1);
  assert.deepEqual(shownValues(this), ['Key E', 'Standard']);
});

Given('a version with no key, capo or tuning and beats {string}', function (this: object, beats: string) {
  world(this).versions = [{ key: null, capo: null, tuning: null, beats }];
  world(this).selected = 0;
});
Then('the meta line shows {string} alone', function (this: object, text: string) {
  assert.deepEqual(shownValues(this), [text]);
});
Then('the meta line shows no technical values', function (this: object) {
  assert.deepEqual(shownValues(this), []);
});

Then('all languages have a beats label with the value placeholder', function () {
  for (const l of SUPPORTED_LOCALES) {
    const d = DICTIONARIES[l as keyof typeof DICTIONARIES] as Record<string, string>;
    assert.ok(d['song.meta.beats'], `${l} song.meta.beats`);
    assert.ok(d['song.meta.beats'].includes('{beats}'), `${l} keeps {beats}`);
  }
});
