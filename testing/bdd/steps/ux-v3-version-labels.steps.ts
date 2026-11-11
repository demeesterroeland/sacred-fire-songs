// Story 6.2.6 (#509) — docs/testing/ux-v3-version-labels.feature (@unit scenarios)
import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { DICTIONARIES, type Locale } from '../../../lib/i18n';
import { sortVersions } from '../../../lib/songs/versionOrder';
import { versionOptions, type VersionLike } from '../../../lib/songs/versionSwitch';

const t = (k: string, vars?: Record<string, string | number>) => {
  const text = (DICTIONARIES.en as Record<string, string>)[k] ?? k;
  return vars ? text.replace(/\{(\w+)\}/g, (_m, name) => String(vars[name])) : text;
};

interface State {
  versions: VersionLike[];
  locale: Locale;
}
const states = new WeakMap<object, State>();
const get = (w: object) => states.get(w)!;
const book = (short: string) => [{ is_primary: true, songbooks: { short_name: short, title: `${short}, full title` } }];
const labels = (w: object) => versionOptions(get(w).versions, t, get(w).locale)!.map((o) => o.label);

Given('a song with versions from {string} and {string}', function (this: object, a: string, b: string) {
  states.set(this, {
    locale: 'en',
    versions: [
      { id: 'a', version_name: 'Standard', version_kind: 'original', song_version_sources: book(a) },
      { id: 'b', version_name: 'Standard', version_kind: 'variant', song_version_sources: book(b) },
    ],
  });
});
Then('the switch shows both book names', function (this: object) {
  assert.deepEqual(labels(this), ['Songbook A', 'Songbook B']);
});

Given('a song with an original from {string} and a translation named {string}', function (this: object, bookName: string, language: string) {
  states.set(this, {
    locale: 'en',
    versions: [
      { id: 'a', version_name: 'Standard', version_kind: 'original', song_version_sources: book(bookName) },
      { id: 'b', version_name: language, version_kind: 'translation' },
    ],
  });
});
When('the app language is Dutch', function (this: object) {
  get(this).locale = 'nl';
});
Then('the switch shows {string} and {string}', function (this: object, first: string, second: string) {
  assert.deepEqual(labels(this), [first, second]);
});

Given('a song with versions named {string} and {string} and no songbook', function (this: object, a: string, b: string) {
  states.set(this, {
    locale: 'en',
    versions: [
      { id: 'a', version_name: a },
      { id: 'b', version_name: b },
    ],
  });
});
Given('a song with a translation, a variant and an original, created in that order', function (this: object) {
  states.set(this, {
    locale: 'en',
    versions: [
      { id: 't', version_kind: 'translation', created_at: '2026-01-01T00:00:00Z' },
      { id: 'v', version_kind: 'variant', created_at: '2026-01-02T00:00:00Z' },
      { id: 'o', version_kind: 'original', created_at: '2026-01-03T00:00:00Z' },
    ] as VersionLike[],
  });
});
Then('the versions are ordered original, variant, translation', function (this: object) {
  assert.deepEqual(sortVersions(get(this).versions as (VersionLike & { created_at?: string })[]).map((v) => v.version_kind), ['original', 'variant', 'translation']);
});
