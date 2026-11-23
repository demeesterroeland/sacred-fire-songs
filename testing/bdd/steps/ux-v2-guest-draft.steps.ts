// Story 6.1.27 / G6.2 (#411) — docs/testing/ux-v2-guest-draft.feature
// Source-level checks; the rendered banner is covered by
// testing/unit/tests/songs/guestDraftBanner.test.tsx and the round trip by
// e2e/tests/ux-v2-guest-draft.spec.ts.
import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { countPaletteClasses } from '../../../lib/design/paletteAudit';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';
import { SONG_DRAFT_KEY, clearSongDraft, readSongDraft, writeSongDraft } from '../../../lib/songs/songDraft';

interface World {
  source: string;
  storage: Storage;
  restored: Record<string, unknown> | null;
}

const DRAFT = { title: 'Unsaved words', content: '[G]Mother' };

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => { m.delete(k); },
    setItem: (k, v) => { m.set(k, String(v)); },
  };
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
  // The shared SignInLink (the accent Button, at least 44 px tall) carries the sign-in link.
  assert.match(this.source, /<SignInLink[\s\S]*?href=\{signInHref\(next\)\}/);
  assert.match(read('components/ui/button.tsx'), /min-h-tap/);
  const form = read('components/song/SongForm.tsx');
  assert.match(form, /<GuestDraftBanner next=\{ADD_SONG_PATH\} \/>/);
  assert.match(form, /const ADD_SONG_PATH = '\/songs\/add'/);
});

Given('the Add Song form', function (this: World) {
  this.source = read('components/song/SongForm.tsx');
});

Then('the draft is read and written through the guarded draft helper', function (this: World) {
  assert.match(this.source, /readSongDraft\(draftOwner\)/);
  assert.match(this.source, /writeSongDraft\(value, draftOwner\)/);
  assert.match(this.source, /clearSongDraft\(\)/);
  assert.doesNotMatch(this.source, /localStorage\./, 'no raw localStorage access in the form');
});

Then('a guest who saves is sent to sign in with a way back to Add Song', function (this: World) {
  assert.match(this.source, /router\.push\(signInHref\(ADD_SONG_PATH\)\)/);
  assert.doesNotMatch(this.source, /Please log in to save songs/);
});

// #607: shared devices. The draft helper runs for real against an in-memory
// Storage, and the sign-out step checks that useAuth calls it. The rendered
// behaviour is covered by testing/unit/tests/auth/useAuthDraftCleanup.test.tsx
// (logout, SIGNED_OUT) and testing/unit/tests/songs/songFormDraftOwner.test.tsx
// (form emptied at sign-out, guest draft adopted, typing during load kept).
Given('I am signed in as {string} and have an unsaved draft on Add Song', function (this: World, member: string) {
  this.storage = memoryStorage();
  writeSongDraft(DRAFT, member, this.storage);
});

Given('I am a guest with a draft on Add Song', function (this: World) {
  this.storage = memoryStorage();
  writeSongDraft(DRAFT, null, this.storage);
});

When('I sign out', function (this: World) {
  const auth = read('hooks/useAuth.tsx');
  const logout = auth.slice(auth.indexOf('const logout'));
  assert.match(logout, /clearSongDraft\(\)/, 'logout does not clear the draft');
  const signedOut = auth.slice(auth.indexOf("event === 'SIGNED_OUT'"), auth.indexOf('setUser(null)', auth.indexOf("event === 'SIGNED_OUT'")));
  assert.match(signedOut, /clearSongDraft\(\)/, 'the SIGNED_OUT event does not clear the draft');
  clearSongDraft(this.storage); // the helper useAuth calls, on this device's storage
});

When('{string} opens Add Song on the same device', function (this: World, member: string) {
  this.restored = readSongDraft(member, this.storage);
});

When('I sign in as {string} from the draft banner', function (this: World, member: string) {
  this.restored = readSongDraft(member, this.storage);
});

Then('the stored draft is removed', function (this: World) {
  assert.equal(this.storage.getItem(SONG_DRAFT_KEY), null);
});

Then('the form starts empty', function (this: World) {
  assert.equal(this.restored, null);
});

Then('my draft is still there', function (this: World) {
  assert.deepEqual(this.restored, DRAFT);
});
