// Story 6.1.9 / G2.4 (#393) — docs/testing/ux-v2-song-action-bar.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import {
  ACTION_BAR_BOTTOM,
  ACTION_BAR_CSS_VAR,
  applyActionBarHeight,
  bottomNavHeight,
  initialBarScroll,
  nextBarScroll,
  practiceTab,
  type BarScroll,
  type PracticeTab,
} from '../../../lib/song/actionBar';

interface World {
  hasMedia: boolean;
  tab: PracticeTab | null;
  autoHide: boolean;
  scroll: BarScroll;
  y: number;
  props: Map<string, string>;
}

Given('a song with a reference track', function (this: World) {
  this.hasMedia = true;
});
Given('a song without reference media', function (this: World) {
  this.hasMedia = false;
});
When('the user taps Practice in the action bar', function (this: World) {
  this.tab = practiceTab(this.hasMedia);
});
Then('the Practice drawer opens on the {string} tab', function (this: World, label: string) {
  assert.equal(this.tab, label === 'Listen' ? 'media' : 'recorder');
});

Given('a song page with the auto-hide preference on', function (this: World) {
  this.autoHide = true;
  this.y = 300;
  this.scroll = initialBarScroll(this.y);
});
Given('a song page with the auto-hide preference off', function (this: World) {
  this.autoHide = false;
  this.y = 300;
  this.scroll = initialBarScroll(this.y);
});
When('the reader scrolls down {int} px', function (this: World, px: number) {
  this.y += px;
  this.scroll = nextBarScroll(this.scroll, this.y, this.autoHide);
});
When('the reader scrolls up {int} px', function (this: World, px: number) {
  this.y -= px;
  this.scroll = nextBarScroll(this.scroll, this.y, this.autoHide);
});
Then('the action bar is hidden', function (this: World) {
  assert.equal(this.scroll.visible, false);
});
Then('the action bar is visible', function (this: World) {
  assert.equal(this.scroll.visible, true);
});

Then('the action bar is placed above the bottom nav, the mini player and the safe area', function () {
  assert.match(ACTION_BAR_BOTTOM, /--bottom-nav-height/);
  assert.match(ACTION_BAR_BOTTOM, /--mini-player-h/);
  assert.match(ACTION_BAR_BOTTOM, /env\(safe-area-inset-bottom/);
});
Then('the page reserves the height of the action bar', function (this: World) {
  const props = new Map<string, string>();
  applyActionBarHeight(true, {
    style: { setProperty: (k: string, v: string) => void props.set(k, v), removeProperty: (k: string) => void props.delete(k) },
  });
  assert.equal(props.get(ACTION_BAR_CSS_VAR), '3.5rem');
});
Then('the bottom nav height is {string}', function (this: World, expected: string) {
  assert.equal(bottomNavHeight(true), expected);
});
