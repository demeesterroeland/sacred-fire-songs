// Story 6.1.11 / G2.6 (#395) — docs/testing/ux-v2-variant-slot.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import {
  blocksVersionSwitch,
  linkedVersionChoice,
  resolveVersionIndex,
  versionOptions,
  type VersionChoice,
  type VersionLike,
} from '../../../lib/songs/versionSwitch';
import { songFlags } from '../../../lib/songs/versionFlags';
import { songVersionHref } from '../../../lib/songs/versionOrder';

const state = new WeakMap<object, { versions: VersionLike[]; choice?: VersionChoice }>();
const t = (k: string, vars?: Record<string, string | number>) =>
  k === 'song.version.fallback' ? `Version ${vars?.n}` : k === 'song.version.numbered' ? `${vars?.name} ${vars?.n}` : k;
const make = (names: Array<string | null>): VersionLike[] =>
  names.map((n, i) => ({ id: `v${i + 1}`, version_name: n }));

Given('a song with one version', function (this: object) {
  state.set(this, { versions: make(['Standard']) });
});

Given('a song with no version', function (this: object) {
  state.set(this, { versions: [] });
});

Given('a song with versions {string} and {string}', function (this: object, a: string, b: string) {
  state.set(this, { versions: make([a, b]) });
});

Given(
  'a song with versions {string}, {string} and {string}',
  function (this: object, a: string, b: string, c: string) {
    state.set(this, { versions: make([a, b, c]) });
  }
);

Then('no variant control is rendered', function (this: object) {
  assert.equal(versionOptions(state.get(this)!.versions, t), null);
});

Then(
  'a segmented control with the names {string} is rendered under the title',
  function (this: object, names: string) {
    const opts = versionOptions(state.get(this)!.versions, t);
    assert.ok(opts, 'expected a control');
    assert.equal(opts.map((o) => o.label).join(', '), names);
  }
);

Given('the reader chose the second version on another song', function (this: object) {
  const s = state.get(this)!;
  s.choice = { songId: 'another-song', versionId: s.versions[1].id };
});

Given('the reader chose a version that was removed', function (this: object) {
  state.get(this)!.choice = { songId: 'this-song', versionId: 'removed' };
});

Then('the first version is shown', function (this: object) {
  const s = state.get(this)!;
  assert.equal(resolveVersionIndex(s.versions, s.choice ?? null, 'this-song'), 0);
});

// --- Review round 2 (take in progress, ?version= link, song flags, Save return) ---
const extra = new WeakMap<object, { dirty?: boolean; blocked?: boolean; param?: string; flags?: { original: string; simplified: string } }>();
const bag = (w: object) => {
  if (!extra.has(w)) extra.set(w, {});
  return extra.get(w)!;
};

Given('the recorder holds a take that is not saved', function (this: object) {
  bag(this).dirty = true;
});

Given('the recorder holds no take', function (this: object) {
  bag(this).dirty = false;
});

When('the reader taps the other version', function (this: object) {
  const s = state.get(this)!;
  bag(this).blocked = blocksVersionSwitch(!!bag(this).dirty, s.versions[0].id, s.versions[1].id);
});

Then('the version is not switched', function (this: object) {
  assert.equal(bag(this).blocked, true);
});

Then('the version is switched', function (this: object) {
  assert.equal(bag(this).blocked, false);
});

Given('the address has the second version as its version parameter', function (this: object) {
  bag(this).param = state.get(this)!.versions[1].id;
});

Then('the second version is shown', function (this: object) {
  const s = state.get(this)!;
  assert.equal(resolveVersionIndex(s.versions, linkedVersionChoice('this-song', bag(this).param), 'this-song'), 1);
});

Then('an unknown version parameter shows the first version', function (this: object) {
  const s = state.get(this)!;
  assert.equal(resolveVersionIndex(s.versions, linkedVersionChoice('this-song', 'removed'), 'this-song'), 0);
});

Given(
  'a song whose {string} version has chords and whose {string} version is lyrics only',
  function (this: object, original: string, simplified: string) {
    assert.ok(original && simplified);
    bag(this).flags = { original: '[Am]Hello [G]world', simplified: 'Hello world' };
  }
);

Then('the song has chords', function (this: object) {
  const f = bag(this).flags!;
  assert.equal(songFlags([{ content_chordpro: f.original }, { content_chordpro: f.simplified }]).has_chords, true);
});

Then('the song has chords after only the {string} version is saved', function (this: object, name: string) {
  assert.ok(name);
  const f = bag(this).flags!;
  // The saved version contributes its new text; the other version is read as it is.
  assert.equal(songFlags([{ content_chordpro: f.simplified }, { content_chordpro: f.original }]).has_chords, true);
});

Given('the {string} version of a song was edited', function (this: object, name: string) {
  assert.ok(name);
  bag(this).param = 'v2';
});

Then('the return address is the song with that version', function (this: object) {
  assert.equal(songVersionHref('s1', bag(this).param), '/songs/s1?version=v2');
});
