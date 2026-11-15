// Story 6.1.18 / G4.5 (#402) — docs/testing/ux-v2-share-explain.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { shareDialogStep, type ShareStep } from '../../../lib/songs/shareDialogStep';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../../../lib/i18n';

const en = DICTIONARIES.en as Record<string, string>;
const P = 'recording.sharing.privateSongPrompt.';

interface World {
  song: { isPublic: boolean; canMakeSongPublic: boolean };
  takeName: string;
  shares: string[];
  step: ShareStep;
}

function setup(w: World, isPublic: boolean, canMakeSongPublic: boolean, takeName = 'Morning take') {
  w.song = { isPublic, canMakeSongPublic };
  w.takeName = takeName;
  w.shares = [];
}
const open = (w: World) => shareDialogStep({ songIsPublic: w.song.isPublic, canMakeSongPublic: w.song.canMakeSongPublic });

Given('a member owns a private song with a take {string}', function (this: World, name: string) {
  setup(this, false, true, name);
});
Given('a member owns a public song with a take {string}', function (this: World, name: string) {
  setup(this, true, true, name);
});
Given('a member has a take on a private song they do not own', function (this: World) {
  setup(this, false, false);
});
When('they share the take', function (this: World) {
  this.step = open(this);
});
When('they confirm', function (this: World) {
  assert.equal(this.step, 'confirm-private');
  this.song.isPublic = true; // makeSongPublic succeeds
  this.step = open(this);
});

Then('the Share dialog opens on a confirmation', function (this: World) {
  assert.equal(this.step, 'confirm-private');
});
Then('the confirmation explains that the song lyrics become public', function () {
  assert.match(en[`${P}effectLyrics`], /lyrics become public/);
});
Then('the confirmation explains that the take {string} is shared with the members they pick', function (this: World, name: string) {
  const text = en[`${P}effectTake`].replace('{name}', name);
  assert.ok(text.includes(`"${name}"`));
  assert.match(text, /shared with the members you pick/);
});
Then('nothing changes until they confirm', function (this: World) {
  assert.equal(this.song.isPublic, false);
  assert.deepEqual(this.shares, []);
  assert.match(en[`${P}note`], /Nothing changes until you confirm/);
});
Then('the song is public', function (this: World) {
  assert.equal(this.song.isPublic, true);
});
Then('the Share dialog shows the member search', function (this: World) {
  assert.equal(this.step, 'search');
});
Then('the Share dialog opens on an explanation', function (this: World) {
  assert.equal(this.step, 'not-owner');
});
Then('the explanation says only the song owner can make the lyrics public', function () {
  assert.match(en[`${P}notOwner`], /Only the song owner can make the lyrics public/);
});
Then('no member search is offered', function (this: World) {
  assert.notEqual(this.step, 'search');
});
Then('the helper text reads {string}', function (text: string) {
  assert.equal(en['recording.sharing.helper'], text);
});
Then('an empty search for {string} reads {string}', function (query: string, text: string) {
  assert.equal(en['recording.sharing.noResults'].replace('{query}', query), text);
});
Then('all 8 languages have a translated version of the share explanation', function () {
  assert.equal(SUPPORTED_LOCALES.length, 8);
  const keys = [
    ...['title', 'body', 'effectLyrics', 'effectTake', 'note', 'confirm', 'notOwnerTitle', 'notOwner'].map((k) => P + k),
    'recording.sharing.helper',
    'recording.sharing.noResults',
  ];
  for (const locale of SUPPORTED_LOCALES) {
    const dict = DICTIONARIES[locale] as Record<string, string>;
    for (const key of keys) {
      assert.ok(dict[key], `${locale}: ${key} missing`);
      if (locale !== 'en') assert.notEqual(dict[key], en[key], `${locale}: ${key} is the English copy`);
    }
  }
});
