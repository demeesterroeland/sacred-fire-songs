// Story 6.1.6 / G2.1 (#390) — docs/testing/ux-v2-reader-toolbar.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { DEFAULT_LYRIC_STEP, LYRIC_STEPS, MIN_FONT_PX } from '../../../lib/design/tokens';
import { DEFAULT_SCROLL_SPEED } from '../../../lib/reader/autoScroll';
import {
  DEFAULT_READER_PREFS,
  READER_PREFS_KEY,
  chordPx,
  loadReaderPrefs,
  saveReaderPrefs,
  stepBy,
  type ReaderPrefs,
} from '../../../lib/reader/readerPrefs';

type MemStorage = Pick<Storage, 'getItem' | 'setItem'>;
const memStorage = (): MemStorage => {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
};

const state = new WeakMap<object, { prefs: ReaderPrefs; storage: MemStorage }>();
const get = (w: object) => state.get(w)!;
const press = (w: object, delta: 1 | -1, times: number) => {
  const s = get(w);
  for (let i = 0; i < times; i++) s.prefs = { ...s.prefs, step: stepBy(s.prefs.step, delta) };
};

Given('the reader preferences at the default size', function (this: object) {
  state.set(this, { prefs: { ...DEFAULT_READER_PREFS }, storage: memStorage() });
  assert.equal(get(this).prefs.step, DEFAULT_LYRIC_STEP);
});

When('I press A+ ten times', function (this: object) {
  press(this, 1, 10);
});

When('I press A− ten times', function (this: object) {
  press(this, -1, 10);
});

Then('the size is the largest lyric step', function (this: object) {
  assert.equal(get(this).prefs.step, LYRIC_STEPS.length - 1);
});

Then('the size is the smallest lyric step', function (this: object) {
  assert.equal(get(this).prefs.step, 0);
});

Then('the chord size is never below 12 px at any step', function () {
  LYRIC_STEPS.forEach((_, i) => assert.ok(chordPx(i) >= MIN_FONT_PX, `step ${i}`));
});

When('I press A+ twice and switch chords off', function (this: object) {
  press(this, 1, 2);
  const s = get(this);
  s.prefs = { ...s.prefs, chords: false };
  saveReaderPrefs(s.prefs, s.storage);
});

When('the preferences are read back from the same storage', function (this: object) {
  const s = get(this);
  s.prefs = loadReaderPrefs(s.storage);
});

Then('the size is two steps above the default and chords are off', function (this: object) {
  assert.deepEqual(get(this).prefs, { step: DEFAULT_LYRIC_STEP + 2, chords: false, speed: DEFAULT_SCROLL_SPEED });
});

Then('unreadable stored preferences give the defaults', function () {
  const broken = memStorage();
  broken.setItem(READER_PREFS_KEY, '{not json');
  assert.deepEqual(loadReaderPrefs(broken), DEFAULT_READER_PREFS);
});
