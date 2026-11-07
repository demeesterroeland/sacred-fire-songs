// Story 6.1.29 / G7.1 (#413) — docs/testing/ux-v2-search-suggestions.feature
import { After, Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { countPaletteClasses } from '../../../lib/design/paletteAudit';
import {
  addRecentSearch,
  clearRecentSearches,
  readRecentSearches,
  removeRecentSearch,
} from '../../../lib/search/history';

const root = path.resolve(__dirname, '..', '..', '..');

// lib/search/history.ts reads window.localStorage: give it an in-memory one for these steps.
type Store = Record<string, string>;
let store: Store = {};
let blocked = false;
const fakeStorage = {
  getItem: (k: string) => {
    if (blocked) throw new Error('blocked');
    return k in store ? store[k] : null;
  },
  setItem: (k: string, v: string) => {
    if (blocked) throw new Error('blocked');
    store[k] = v;
  },
};
const g = globalThis as unknown as { window?: unknown };


function reset() {
  store = {};
  blocked = false;
  g.window = { localStorage: fakeStorage };
}

// Do not leak the fake window into other features.
After({ tags: '@story-6.1.29' }, function () {
  delete g.window;
});

Given('a guest who searched {string}, {string}, {string}, {string}, {string} and {string} in that order', function (a: string, b: string, c: string, d: string, e: string, f: string) {
  reset();
  for (const t of [a, b, c, d, e, f]) addRecentSearch(t);
});

Given('a guest who searched {string} and then {string}', function (a: string, b: string) {
  reset();
  addRecentSearch(a);
  addRecentSearch(b);
});

When('they search {string} again', function (term: string) {
  addRecentSearch(term);
});

When('they remove {string} from the recent searches', function (term: string) {
  removeRecentSearch(term);
});

When('they clear all recent searches', function () {
  clearRecentSearches();
});

Then('the recent searches are {string}, {string}, {string}, {string} and {string}', function (a: string, b: string, c: string, d: string, e: string) {
  assert.deepEqual(readRecentSearches(), [a, b, c, d, e]);
});

Then('the recent searches are {string} and {string}', function (a: string, b: string) {
  assert.deepEqual(readRecentSearches(), [a, b]);
});

Then('the recent searches are {string}', function (a: string) {
  assert.deepEqual(readRecentSearches(), [a]);
});

Then('there are no recent searches', function () {
  assert.deepEqual(readRecentSearches(), []);
});

Given('a browser that refuses to store site data', function () {
  reset();
  blocked = true;
});

Then('reading, adding, removing and clearing recent searches does not fail', function () {
  assert.doesNotThrow(() => {
    readRecentSearches();
    addRecentSearch('agua');
    removeRecentSearch('agua');
    clearRecentSearches();
  });
});

let source = '';
Given('the search suggestion panel', function () {
  source = fs.readFileSync(path.join(root, 'components', 'search', 'SearchSuggestions.tsx'), 'utf8');
});

Then('it uses only design tokens and no palette colours', function () {
  assert.equal(countPaletteClasses(source), 0);
});

// Source-level guard (literal classNames); the rendered check is the RTL test.
Then('every control in it is at least 44 px tall', function () {
  const buttons = source.match(/<button\b[\s\S]*?className=\{?[`"][^`"]*[`"]/g) ?? [];
  assert.ok(buttons.length >= 3, 'clear-all, term and remove buttons found');
  for (const b of buttons) assert.match(b, /min-h-tap|size-tap/, b.slice(0, 60));
  assert.match(source, /<Chip\b/, 'chips use the Chip primitive (min-h-tap)');
});
