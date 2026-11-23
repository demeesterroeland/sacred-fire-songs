// Story 6.1.20 / G4.7 (#404) — docs/testing/ux-v2-recording-meter.feature
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import {
  LEVEL_BARS,
  SOUND_THRESHOLD,
  isSilentLongEnough,
  nextSilentMs,
  countInSequence,
  formatRemaining,
  isRemainingVisible,
  pushLevel,
  remainingSeconds,
  rmsToLevel,
} from '../../../lib/recorder/recorderMath';
import en from '../../../messages/en';
import nl from '../../../messages/nl';
import es from '../../../messages/es';
import it from '../../../messages/it';
import ru from '../../../messages/ru';
import qu from '../../../messages/qu';
import fr from '../../../messages/fr';
import pt from '../../../messages/pt';

const locales: Record<string, Record<string, string>> = { en, nl, es, it, ru, qu, fr, pt };
const KEYS = ['recorder.meter.label', 'recorder.meter.silent', 'recorder.limit', 'recorder.timeLeft', 'recorder.countIn.label', 'recorder.countIn.status'];

interface World {
  elapsed: number;
  countIn: boolean;
  silentMs: number;
}

Given('a recording at {int}:{int}', function (this: World, m: number, s: number) {
  this.elapsed = m * 60 + s;
});
Then('the timer shows {string}', function (this: World, text: string) {
  assert.ok(isRemainingVisible(this.elapsed));
  assert.equal(en['recorder.timeLeft'].replace('{time}', formatRemaining(remainingSeconds(this.elapsed))), text);
});
Then('no remaining time shows at {int}:{int}', (m: number, s: number) => {
  assert.equal(isRemainingVisible(m * 60 + s), false);
});

Then('the recorder says {string}', (text: string) => assert.equal(en['recorder.limit'], text));

Given('the count-in is on', function (this: World) {
  this.countIn = true;
});
Then('the count-in shows {int}, {int}, {int}', function (this: World, a: number, b: number, c: number) {
  assert.deepEqual(countInSequence(this.countIn), [a, b, c]);
});
When('the count-in is off', function (this: World) {
  this.countIn = false;
});
Then('recording starts without a count-in', function (this: World) {
  assert.deepEqual(countInSequence(this.countIn), []);
});

Given('the recorder is running with a live microphone', () => {});
Then('silence reads level 0', () => assert.equal(rmsToLevel(0), 0));
Then('a louder input reads a higher level than a quieter one', () => {
  assert.ok(rmsToLevel(0.1) > rmsToLevel(0.01));
  assert.ok(rmsToLevel(0.01) > 0);
});
Then('the meter keeps a rolling history of {int} bars', (n: number) => {
  let h: number[] = new Array(LEVEL_BARS).fill(0);
  for (let i = 0; i < 30; i++) h = pushLevel(h, 0.3);
  assert.equal(LEVEL_BARS, n);
  assert.equal(h.length, n);
});

const FRAME_MS = 50;
/** Feed the meter frames of one constant level for `seconds`, the way the hook does. */
function listen(world: World, seconds: number, level: number, counting: boolean) {
  for (let t = 0; t < seconds * 1000; t += FRAME_MS) world.silentMs = nextSilentMs(world.silentMs, level, FRAME_MS, counting);
}

Given('a recording running for {int} seconds', function (this: World, s: number) {
  this.silentMs = 0;
  this.elapsed = s;
});
When('no sound was heard', function (this: World) {
  listen(this, this.elapsed, 0, true);
});
Then('the recorder hints that it hears no sound', function (this: World) {
  assert.equal(isSilentLongEnough(this.silentMs), true);
  assert.match(en['recorder.meter.silent'], /No sound yet/);
});

Given('a recording where the no-sound hint is showing', function (this: World) {
  this.silentMs = 0;
  listen(this, 4, 0, true);
  assert.equal(isSilentLongEnough(this.silentMs), true);
});
When('sound is heard again', function (this: World) {
  listen(this, 0.05, SOUND_THRESHOLD + 0.2, true);
});
Then('the hint goes away', function (this: World) {
  assert.equal(isSilentLongEnough(this.silentMs), false);
});
Then('it needs 3 silent seconds again before it comes back', function (this: World) {
  listen(this, 2.5, 0, true);
  assert.equal(isSilentLongEnough(this.silentMs), false);
  listen(this, 1, 0, true);
  assert.equal(isSilentLongEnough(this.silentMs), true);
});

Given('a count-in of {int} seconds in a quiet room', function (this: World, s: number) {
  this.silentMs = 0;
  listen(this, s, 0, false);
});
Then('no silence is counted towards the hint', function (this: World) {
  assert.equal(this.silentMs, 0);
  listen(this, 2.5, 0, true); // recording starts: a fresh 3 s window
  assert.equal(isSilentLongEnough(this.silentMs), false);
});

Then('each defines the meter, limit, time left and count-in messages', () => {
  for (const [code, dict] of Object.entries(locales)) {
    for (const k of KEYS) assert.ok(dict[k] && dict[k].length > 0, `${code} lacks ${k}`);
    assert.ok(dict['recorder.timeLeft'].includes('{time}'), `${code} timeLeft needs {time}`);
    assert.ok(dict['recorder.countIn.status'].includes('{n}'), `${code} countIn.status needs {n}`);
  }
});
