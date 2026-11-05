// Story 6.1.20 / G4.7 (#404): pure helpers behind the recorder level meter, count-in and remaining time (L2).
import { describe, expect, it } from 'vitest';
import {
  COUNT_IN_SECONDS,
  MAX_RECORDING_SECONDS,
  LEVEL_BARS,
  countInSequence,
  formatClock,
  formatRemaining,
  isRemainingVisible,
  pushLevel,
  remainingSeconds,
  rmsFromBytes,
  rmsToLevel,
  nextSilentMs,
  isSilentLongEnough,
  MAX_FRAME_GAP_MS,
  SOUND_THRESHOLD,
} from '@/lib/recorder/recorderMath';

describe('remaining time', () => {
  it('the limit is 3 minutes', () => {
    expect(MAX_RECORDING_SECONDS).toBe(180);
  });

  it('counts down from the limit and never goes below zero', () => {
    expect(remainingSeconds(0)).toBe(180);
    expect(remainingSeconds(120)).toBe(60);
    expect(remainingSeconds(179)).toBe(1);
    expect(remainingSeconds(180)).toBe(0);
    expect(remainingSeconds(500)).toBe(0);
  });

  it('formats m:ss without a leading zero on the minutes', () => {
    expect(formatRemaining(60)).toBe('1:00');
    expect(formatRemaining(161)).toBe('2:41');
    expect(formatRemaining(9)).toBe('0:09');
    expect(formatRemaining(0)).toBe('0:00');
  });

  it('shows the remaining time from the last minute on (at 2:00 → 1:00 left)', () => {
    expect(isRemainingVisible(0)).toBe(false);
    expect(isRemainingVisible(119)).toBe(false);
    expect(isRemainingVisible(120)).toBe(true);
    expect(formatRemaining(remainingSeconds(120))).toBe('1:00');
    expect(isRemainingVisible(180)).toBe(true);
  });

  it('keeps the elapsed clock as mm:ss', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(125)).toBe('02:05');
    expect(formatClock(180)).toBe('03:00');
  });
});

describe('count-in', () => {
  it('is 3-2-1 when on and empty when off', () => {
    expect(COUNT_IN_SECONDS).toBe(3);
    expect(countInSequence(true)).toEqual([3, 2, 1]);
    expect(countInSequence(false)).toEqual([]);
  });
});

describe('input level', () => {
  it('RMS of silence (128) is 0 and a full-scale square wave is 1', () => {
    expect(rmsFromBytes(new Uint8Array(64).fill(128))).toBe(0);
    const square = new Uint8Array(64).map((_, i) => (i % 2 ? 255 : 0));
    expect(rmsFromBytes(square)).toBeGreaterThan(0.99);
    expect(rmsFromBytes(new Uint8Array(0))).toBe(0);
  });

  it('maps RMS to 0..1 on a dB scale', () => {
    expect(rmsToLevel(0)).toBe(0);
    expect(rmsToLevel(1)).toBe(1);
    expect(rmsToLevel(0.001)).toBe(0); // -60 dB and below is silence
    const quiet = rmsToLevel(0.01); // -40 dB
    const loud = rmsToLevel(0.1); // -20 dB
    expect(quiet).toBeGreaterThan(0);
    expect(loud).toBeGreaterThan(quiet);
    expect(loud).toBeLessThan(1);
    expect(rmsToLevel(5)).toBe(1);
    expect(rmsToLevel(Number.NaN)).toBe(0);
  });

  it('keeps a rolling history of the last LEVEL_BARS levels', () => {
    expect(LEVEL_BARS).toBe(8);
    let h: number[] = new Array(LEVEL_BARS).fill(0);
    h = pushLevel(h, 0.5);
    expect(h).toHaveLength(LEVEL_BARS);
    expect(h[LEVEL_BARS - 1]).toBe(0.5);
    for (let i = 0; i < 20; i++) h = pushLevel(h, 0.1 * (i % 3));
    expect(h).toHaveLength(LEVEL_BARS);
  });
});

describe('silent hint (rolling window)', () => {
  it('counts silence only while recording, in time slices', () => {
    expect(nextSilentMs(0, 0, 50, true)).toBe(50);
    expect(nextSilentMs(1000, 0.05, 50, true)).toBe(1050);
    expect(nextSilentMs(1000, 0, 50, false)).toBe(0); // count-in / paused do not count
  });
  it('sound resets the window, so the hint can come back later', () => {
    expect(nextSilentMs(2900, SOUND_THRESHOLD + 0.01, 50, true)).toBe(0);
    expect(nextSilentMs(2900, SOUND_THRESHOLD, 50, true)).toBe(2950); // at the threshold is still silence
  });
  it('a long gap (background tab) is capped, not counted in full', () => {
    expect(nextSilentMs(0, 0, 60_000, true)).toBe(MAX_FRAME_GAP_MS);
    expect(nextSilentMs(0, 0, -5, true)).toBe(0);
  });
  it('is silent from 3 s of silence on', () => {
    expect(isSilentLongEnough(2999)).toBe(false);
    expect(isSilentLongEnough(3000)).toBe(true);
  });
});
