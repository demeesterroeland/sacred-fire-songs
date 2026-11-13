// Story 6.1.32 / G8.3 (#416) — docs/testing/ux-v2-new-playlist-visibility.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import {
  NEW_PLAYLIST_IS_PUBLIC,
  VISIBILITY_LOCALE_KEYS,
  canCreatePlaylist,
  toIsPublic,
  visibilityExplainKey,
} from '../../../lib/playlists/visibility';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

const en = DICTIONARIES.en as Record<string, string>;

interface World {
  isPublic: boolean;
  title: string;
}

Given('a member on New Playlist', function (this: World) {
  this.isPublic = NEW_PLAYLIST_IS_PUBLIC;
  this.title = '';
});

Then('the page states that the playlist is private unless made public', function (this: World) {
  const text = en[visibilityExplainKey(this.isPublic)];
  assert.match(text, /^Private: only you can see this playlist unless you make it public\.$/);
});

Then('the visibility switch is off', function (this: World) {
  assert.equal(this.isPublic, false);
});

Then('the Create button is disabled', function (this: World) {
  assert.equal(canCreatePlaylist(this.title, false), false);
});

When('they type the name {string}', function (this: World, name: string) {
  this.title = name;
});

Then('the Create button is enabled', function (this: World) {
  assert.equal(canCreatePlaylist(this.title, false), true);
});

When('they switch the playlist to public', function (this: World) {
  this.isPublic = true;
});

Then(
  'the page states that anyone can find and open the playlist, with or without an account',
  function (this: World) {
    const text = en[visibilityExplainKey(this.isPublic)];
    assert.match(text, /^Public: anyone can find and open this playlist, with or without an account\.$/);
  },
);

Then('the playlist would be created private', function (this: World) {
  assert.equal(toIsPublic(this.isPublic), false);
});

Then('the playlist would be created public', function (this: World) {
  assert.equal(toIsPublic(this.isPublic), true);
});

Given('a member in the Add to playlist sheet', function (this: World) {
  this.isPublic = false; // the sheet has no switch: it always creates private
});

Then('a new playlist is private like on New Playlist', function () {
  assert.match(en['playlists.picker.newPrivateHint'], /private/i);
  assert.equal(toIsPublic(undefined), false);
});

Then('every locale has the New Playlist visibility copy', function () {
  for (const locale of SUPPORTED_LOCALES) {
    for (const key of VISIBILITY_LOCALE_KEYS) {
      const value = (DICTIONARIES[locale] as Record<string, string>)[key];
      assert.ok(value && value.trim(), `${locale} is missing ${key}`);
    }
  }
});
