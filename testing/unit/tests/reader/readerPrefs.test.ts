// Story 6.1.6 / G2.1 (#390): reader toolbar size steps and chords toggle, stored per device.
import { describe, expect, it } from 'vitest';
import { LYRIC_STEPS, DEFAULT_LYRIC_STEP } from '@/lib/design/tokens';
import {
  READER_PREFS_KEY,
  DEFAULT_READER_PREFS,
  stepBy,
  lyricPx,
  chordPx,
  parseReaderPrefs,
  loadReaderPrefs,
  saveReaderPrefs,
} from '@/lib/reader/readerPrefs';

function memoryStorage(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    raw: m,
  };
}

describe('lyric size steps', () => {
  it('defaults to the token default step with chords on', () => {
    expect(DEFAULT_READER_PREFS).toEqual({ step: DEFAULT_LYRIC_STEP, chords: true });
  });

  it('moves one step at a time and stops at both ends', () => {
    expect(stepBy(1, 1)).toBe(2);
    expect(stepBy(0, -1)).toBe(0);
    expect(stepBy(LYRIC_STEPS.length - 1, 1)).toBe(LYRIC_STEPS.length - 1);
  });

  it('maps steps to pixel sizes; chords are never below 12 px', () => {
    expect(lyricPx(0)).toBe(LYRIC_STEPS[0]);
    expect(lyricPx(99)).toBe(LYRIC_STEPS[LYRIC_STEPS.length - 1]);
    for (let i = 0; i < LYRIC_STEPS.length; i++) expect(chordPx(i)).toBeGreaterThanOrEqual(12);
  });
});

describe('persistence', () => {
  it('ignores missing or broken data', () => {
    expect(parseReaderPrefs(null)).toEqual(DEFAULT_READER_PREFS);
    expect(parseReaderPrefs('{oops')).toEqual(DEFAULT_READER_PREFS);
    expect(parseReaderPrefs('{"step": 42, "chords": "x"}')).toEqual({ step: LYRIC_STEPS.length - 1, chords: true });
  });

  it('round-trips through storage', () => {
    const s = memoryStorage();
    saveReaderPrefs({ step: 3, chords: false }, s);
    expect(JSON.parse(s.raw.get(READER_PREFS_KEY)!)).toEqual({ step: 3, chords: false });
    expect(loadReaderPrefs(s)).toEqual({ step: 3, chords: false });
  });

  it('survives a storage that throws', () => {
    const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(loadReaderPrefs(broken)).toEqual(DEFAULT_READER_PREFS);
    expect(() => saveReaderPrefs({ step: 2, chords: true }, broken)).not.toThrow();
  });
});
