// Story 6.1.34 / G9.2 (#418) — docs/testing/ux-v2-a11y-audit.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { nextTabIndex, wrapFocusIndex } from '../../../lib/a11y/focusTrap';

interface State {
  controls: number;
  focus: number; // index of the focused control, -1 = outside
  tabs: number;
  selected: number;
}
const states = new WeakMap<object, State>();
const st = (w: object): State => {
  let s = states.get(w);
  if (!s) {
    s = { controls: 0, focus: -1, tabs: 0, selected: 0 };
    states.set(w, s);
  }
  return s;
};

Given('a modal with {int} tabbable controls', function (this: object, n: number) {
  st(this).controls = n;
});

When('focus is on the last control and the user presses Tab', function (this: object) {
  const s = st(this);
  s.focus = s.controls - 1;
  s.focus = wrapFocusIndex(s.controls, s.focus, false) ?? s.focus + 1;
});

Then('focus moves to the first control', function (this: object) {
  assert.equal(st(this).focus, 0);
});

When('focus is on the first control and the user presses Shift+Tab', function (this: object) {
  const s = st(this);
  s.focus = 0;
  s.focus = wrapFocusIndex(s.controls, s.focus, true) ?? s.focus - 1;
});

Then('focus moves to the last control', function (this: object) {
  const s = st(this);
  assert.equal(s.focus, s.controls - 1);
});

When('focus is outside the modal and the user presses Tab', function (this: object) {
  const s = st(this);
  s.focus = wrapFocusIndex(s.controls, -1, false) ?? -1;
});

Given('a tab list with {int} tabs', function (this: object, n: number) {
  const s = st(this);
  s.tabs = n;
  s.selected = 0;
});

When('the user presses {string} on the first tab', function (this: object, key: string) {
  const s = st(this);
  s.selected = nextTabIndex(key, 0, s.tabs) ?? 0;
});

When('the user presses {string} on the second tab', function (this: object, key: string) {
  const s = st(this);
  s.selected = nextTabIndex(key, 1, s.tabs) ?? 1;
});

Then('the second tab is selected', function (this: object) {
  assert.equal(st(this).selected, 1);
});

Then('the first tab is selected', function (this: object) {
  assert.equal(st(this).selected, 0);
});
