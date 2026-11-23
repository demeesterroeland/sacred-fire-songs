// Story 6.1.12 / G3.1 (#396) — docs/testing/ux-v2-mini-player.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import {
  MINI_PLAYER_CSS_VAR,
  applyMiniPlayerHeight,
  isMiniPlayerVisible,
  mediaSessionReducer,
  type MediaSessionEvent,
} from '../../../lib/player/miniPlayer';

interface World {
  started: boolean;
  activePlaybackId: string | null;
  props: Map<string, string>;
}
const SONG_TAKES = ['take-1', 'take-2'];
const root = (w: World) => ({
  style: {
    setProperty: (k: string, v: string) => void w.props.set(k, v),
    removeProperty: (k: string) => void w.props.delete(k),
  },
});
const sync = (w: World) =>
  applyMiniPlayerHeight(isMiniPlayerVisible({ mediaSessionStarted: w.started, activePlaybackId: w.activePlaybackId, songRecordingIds: SONG_TAKES }), root(w));
const send = (w: World, e: MediaSessionEvent) => {
  w.started = mediaSessionReducer(w.started, e);
  sync(w);
};

Given('any song page just loaded', function (this: World) {
  this.started = false;
  this.activePlaybackId = null;
  this.props = new Map();
  sync(this);
});

When('the user presses play on a reference track', function (this: World) {
  send(this, 'playing');
});

Given('a take of another song is still the active playback', function (this: World) {
  this.activePlaybackId = 'take-of-another-song';
  sync(this);
});

When('the user pauses the track', function (this: World) {
  // Pause is not an event: the session stays started and the bar stays.
  sync(this);
});

When('the user stops the player', function (this: World) {
  send(this, 'stopped');
});

Then('the mini player is not rendered', function (this: World) {
  assert.equal(isMiniPlayerVisible({ mediaSessionStarted: this.started, activePlaybackId: this.activePlaybackId, songRecordingIds: SONG_TAKES }), false);
});

Then('the mini player is rendered', function (this: World) {
  assert.equal(isMiniPlayerVisible({ mediaSessionStarted: this.started, activePlaybackId: this.activePlaybackId, songRecordingIds: SONG_TAKES }), true);
});

Then('the reserved bottom space equals the bar height plus the bottom nav', function (this: World) {
  const v = this.props.get(MINI_PLAYER_CSS_VAR)!;
  assert.match(v, /3\.5rem/);
  assert.match(v, /--bottom-nav-height/);
});

Then('nothing is reserved at the bottom', function (this: World) {
  assert.equal(this.props.has(MINI_PLAYER_CSS_VAR), false);
});
