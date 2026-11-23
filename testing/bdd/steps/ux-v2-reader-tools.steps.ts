// Story 6.1.10 / G2.5 (#394) — docs/testing/ux-v2-reader-tools.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import {
  DEFAULT_SCROLL_SPEED,
  SCROLL_SPEEDS,
  speedBy,
  stepScroll,
} from '../../../lib/reader/autoScroll';
import {
  DEFAULT_READER_PREFS,
  READER_PREFS_KEY,
  loadReaderPrefs,
  saveReaderPrefs,
  type ReaderPrefs,
} from '../../../lib/reader/readerPrefs';
import {
  canTranspose,
  formatSemitones,
  shiftSemitones,
  transposeChordPro,
  transposeKey,
} from '../../../lib/reader/transpose';

type MemStorage = Pick<Storage, 'getItem' | 'setItem'>;
const memStorage = (): MemStorage => {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
};

interface State {
  content: string;
  key: string;
  semitones: number;
  speed: number;
  prefs: ReaderPrefs;
  storage: MemStorage;
}
const state = new WeakMap<object, State>();
const get = (w: object): State => {
  let s = state.get(w);
  if (!s) {
    s = { content: '', key: '', semitones: 0, speed: DEFAULT_SCROLL_SPEED, prefs: { ...DEFAULT_READER_PREFS }, storage: memStorage() };
    state.set(w, s);
  }
  return s;
};

const chordsOf = (content: string) => [...content.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);

Given('a song in key E with the chords E, A and B', function (this: object) {
  const s = get(this);
  s.key = 'E';
  s.semitones = 0;
  s.content = '[E]Danza del [A]cielo\n[B]Baila con el [E]viento';
});

When('I tap transpose {string} twice', function (this: object, sign: string) {
  const s = get(this);
  for (let i = 0; i < 2; i++) s.semitones = shiftSemitones(s.semitones, sign === '+' ? 1 : -1);
});

When('I tap transpose {string} twelve times', function (this: object, sign: string) {
  const s = get(this);
  for (let i = 0; i < 12; i++) s.semitones = shiftSemitones(s.semitones, sign === '+' ? 1 : -1);
});

When('I tap {string}', function (this: object, label: string) {
  assert.equal(label, 'Original key');
  get(this).semitones = 0;
});

Then('every chord is shown two semitones higher: F#, B and C#', function (this: object) {
  const s = get(this);
  assert.deepEqual(chordsOf(transposeChordPro(s.content, s.semitones)), ['F#', 'B', 'C#', 'F#']);
});

Then('the key reads {string}', function (this: object, key: string) {
  const s = get(this);
  assert.equal(transposeKey(s.key, s.semitones), key);
});

Then('the shift is shown as {string}', function (this: object, text: string) {
  assert.equal(formatSemitones(get(this).semitones), text);
});

Then('the shift is {string}', function (this: object, text: string) {
  assert.equal(formatSemitones(get(this).semitones), text);
});

Then('the shift is {string} and the chords and key are as written', function (this: object, text: string) {
  const s = get(this);
  assert.equal(formatSemitones(s.semitones), text);
  assert.equal(transposeChordPro(s.content, s.semitones), s.content);
  assert.equal(transposeKey(s.key, s.semitones), s.key);
});

Then('musicians, experts and admins can transpose', function () {
  for (const r of ['musician', 'expert', 'admin']) assert.equal(canTranspose(r), true, r);
});

Then('members, gatekeepers and guests cannot', function () {
  for (const r of ['member', 'gatekeeper', 'guest', undefined]) assert.equal(canTranspose(r), false, String(r));
});

Given('auto-scroll at the default speed', function (this: object) {
  get(this).speed = DEFAULT_SCROLL_SPEED;
});

When('I press {string} ten times', function (this: object, label: string) {
  const s = get(this);
  for (let i = 0; i < 10; i++) s.speed = speedBy(s.speed, label === 'Faster' ? 1 : -1);
});

Then('the speed is level {int}', function (this: object, level: number) {
  assert.equal(get(this).speed, level);
});

Then('the slowest speed still moves the page by whole pixels over time', function () {
  let carry = 0;
  let total = 0;
  for (let i = 0; i < 125; i++) {
    const step = stepScroll(carry, 16, 1);
    carry = step.carry;
    total += step.px;
    assert.ok(Number.isInteger(step.px));
  }
  assert.equal(total, Math.floor(SCROLL_SPEEDS[0] * 2));
});

When('I choose speed level 2 and the preferences are read back from the same storage', function (this: object) {
  const s = get(this);
  s.prefs = { ...s.prefs, speed: 2 };
  saveReaderPrefs(s.prefs, s.storage);
  s.prefs = loadReaderPrefs(s.storage);
});

Then('older stored preferences without a speed get the default level', function () {
  const old = memStorage();
  old.setItem(READER_PREFS_KEY, JSON.stringify({ step: 2, chords: false }));
  assert.equal(loadReaderPrefs(old).speed, DEFAULT_SCROLL_SPEED);
});

Then('the stored speed is level {int}', function (this: object, level: number) {
  assert.equal(get(this).prefs.speed, level);
});
