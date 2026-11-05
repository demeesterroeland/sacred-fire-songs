// Story 6.1.27 / G6.2 (#411) — docs/testing/ux-v2-guest-draft.feature
// Source-level checks; the rendered banner is covered by
// testing/unit/tests/songs/guestDraftBanner.test.tsx and the round trip by
// e2e/tests/ux-v2-guest-draft.spec.ts.
import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { countPaletteClasses } from '../../../lib/design/paletteAudit';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

interface World {
  source: string;
}

const root = path.resolve(__dirname, '../../..');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

Given('the guest draft banner on Add Song', function (this: World) {
  this.source = read('components/song/GuestDraftBanner.tsx');
});

Then('it says that saving needs an account in every language', function (this: World) {
  for (const key of ['title', 'body', 'signIn']) {
    assert.match(this.source, new RegExp(`t\\('songForm\\.guestDraft\\.${key}'\\)`));
  }
  for (const locale of SUPPORTED_LOCALES) {
    for (const key of ['title', 'body', 'signIn'] as const) {
      assert.ok(DICTIONARIES[locale][`songForm.guestDraft.${key}`]?.trim(), `${locale}: songForm.guestDraft.${key}`);
    }
  }
  assert.equal(countPaletteClasses(this.source), 0, 'no palette colour classes');
});

Then('its sign-in link is at least 44 px tall and brings the guest back to Add Song', function (this: World) {
  assert.match(this.source, /<Link[\s\S]*?href=\{signInHref\(next\)\}[\s\S]*?className="[^"]*min-h-tap/);
  const form = read('components/song/SongForm.tsx');
  assert.match(form, /<GuestDraftBanner next=\{ADD_SONG_PATH\} \/>/);
  assert.match(form, /const ADD_SONG_PATH = '\/songs\/add'/);
});

Given('the Add Song form', function (this: World) {
  this.source = read('components/song/SongForm.tsx');
});

Then('the draft is read and written through the guarded draft helper', function (this: World) {
  assert.match(this.source, /readSongDraft\(\)/);
  assert.match(this.source, /writeSongDraft\(value\)/);
  assert.match(this.source, /clearSongDraft\(\)/);
  assert.doesNotMatch(this.source, /localStorage\./, 'no raw localStorage access in the form');
});

Then('a guest who saves is sent to sign in with a way back to Add Song', function (this: World) {
  assert.match(this.source, /router\.push\(signInHref\(ADD_SONG_PATH\)\)/);
  assert.doesNotMatch(this.source, /Please log in to save songs/);
});
