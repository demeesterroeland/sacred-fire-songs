// Story 6.1.24 / G5.3 (#408) — docs/testing/ux-v2-bottom-bar.feature
import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BOTTOM_NAV_ITEMS, isBottomNavActive } from '../../../lib/navigation';
import { tWithLocale } from '../../../lib/i18n';

const root = path.resolve(__dirname, '..', '..', '..');

Given('the bottom bar definition', function () {
  assert.ok(BOTTOM_NAV_ITEMS.length > 0);
});

Then('it shows exactly {string}, {string} and {string} in that order', function (a: string, b: string, c: string) {
  assert.deepEqual(
    BOTTOM_NAV_ITEMS.map((i) => tWithLocale('en', i.labelKey)),
    [a, b, c],
  );
});

Then('{string} opens the song list with the search field focused', function (label: string) {
  const search = BOTTOM_NAV_ITEMS.find((i) => tWithLocale('en', i.labelKey) === label)!;
  assert.equal(search.href, '/songs');
  assert.equal(search.focusSearch, true);
});

Then('on every page at most one item is marked active', function () {
  for (const p of ['/', '/songs', '/songs/x', '/songs/add', '/library/playlists', '/library/artists', '/account']) {
    assert.ok(BOTTOM_NAV_ITEMS.filter((i) => isBottomNavActive(p, i)).length <= 1, p);
  }
});

Then('the {string} route and the {string} message no longer exist', function (route: string, key: string) {
  assert.equal(fs.existsSync(path.join(root, 'app', route.replace(/^\//, ''))), false);
  assert.notEqual(tWithLocale('en', key as never), 'Explore');
});
