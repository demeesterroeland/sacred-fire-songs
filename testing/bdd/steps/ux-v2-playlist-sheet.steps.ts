// Story 6.1.30 / G8.1 (#414) — docs/testing/ux-v2-playlist-sheet.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { buildPickerRows, toggleMembership, type PickerRow } from '../../../lib/playlists/pickerModel';
import { SUPPORTED_LOCALES, DICTIONARIES } from '../../../lib/i18n';

interface World {
  playlists: { id: string; title: string }[];
  containing: Set<string>;
  rows: PickerRow[];
}

const PLAYLISTS = [
  { id: 'p-water', title: 'Water Ceremony' },
  { id: 'p-fire', title: 'Fire Circle' },
];
const idOf = (title: string) => {
  const p = PLAYLISTS.find((x) => x.title === title);
  assert.ok(p, `unknown playlist ${title}`);
  return p.id;
};
const checkOf = (w: World, title: string) => {
  const row = w.rows.find((r) => r.kind === 'playlist' && r.title === title);
  assert.ok(row && row.kind === 'playlist', `no row for ${title}`);
  return row.checked;
};

Given('the song is in the playlist {string} but not in {string}', function (this: World, inList: string, _other: string) {
  this.playlists = PLAYLISTS;
  this.containing = new Set([idOf(inList)]);
});

When('the Add to playlist sheet lists my playlists', function (this: World) {
  this.rows = buildPickerRows(this.playlists, this.containing);
});

When('I tap {string} in the sheet', function (this: World, title: string) {
  this.containing = toggleMembership(this.containing, idOf(title));
  this.rows = buildPickerRows(this.playlists, this.containing);
});

Then('"New playlist" is the first row', function (this: World) {
  assert.equal(this.rows[0].kind, 'new');
});

Then('{string} shows a check', function (this: World, title: string) {
  assert.equal(checkOf(this, title), true);
});

Then('{string} shows no check', function (this: World, title: string) {
  assert.equal(checkOf(this, title), false);
});

Then('every locale has the Add to playlist sheet copy', function () {
  const keys = [
    'playlists.picker.addToPlaylist',
    'playlists.picker.newPlaylist',
    'playlists.picker.newPlaylistName',
    'playlists.picker.create',
    'playlists.picker.done',
  ];
  for (const locale of SUPPORTED_LOCALES) {
    for (const key of keys) {
      const value = (DICTIONARIES[locale] as Record<string, string>)[key];
      assert.ok(value && value.trim(), `${locale} is missing ${key}`);
    }
  }
});
