// Story 6.1.13 / G3.2 (#397) — docs/testing/ux-v2-calm-player.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import en from '../../../messages/en';
import { availableProviders, playStateKey, PROVIDER_NAMES, type ReferenceUrls } from '../../../lib/player/referenceProviders';

interface World {
  urls: ReferenceUrls;
  buttons: string[];
  playing: boolean;
}
const LINK = {
  youtubeUrl: 'https://www.youtube.com/watch?v=abc',
  soundcloudUrl: 'https://soundcloud.com/a/b',
  spotifyUrl: 'https://open.spotify.com/track/1',
};
const names = (w: World) => availableProviders(w.urls).map((p) => PROVIDER_NAMES[p]);

Given('a song with a YouTube link and no Spotify link', function (this: World) {
  this.urls = { youtubeUrl: LINK.youtubeUrl, spotifyUrl: null, soundcloudUrl: null };
});
Given('a song with a Spotify link, a YouTube link and a SoundCloud link', function (this: World) {
  this.urls = { ...LINK };
});
When('the Listen tab opens', function (this: World) {
  this.buttons = names(this);
});
Then('a {string} button is shown and no {string} button', function (this: World, shown: string, hidden: string) {
  assert.ok(this.buttons.includes(shown));
  assert.ok(!this.buttons.includes(hidden));
});
Then('the provider buttons are {string}, {string}, {string}', function (this: World, a: string, b: string, c: string) {
  assert.deepEqual(this.buttons, [a, b, c]);
});

Given('a reference track is playing', function (this: World) {
  this.playing = true;
});
Then('the player says {string}', function (this: World, word: string) {
  assert.equal(en[playStateKey(this.playing)], word);
});
When('the reference track is paused', function (this: World) {
  this.playing = false;
});
Then('the button that opens the Listen tab from the Record tab reads {string}', function (label: string) {
  assert.equal(en['rehearsal.controlTrack'], label);
});
