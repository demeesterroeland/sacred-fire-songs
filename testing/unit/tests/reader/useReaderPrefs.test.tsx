// @vitest-environment jsdom
// Story 6.1.6 / G2.1 (#390): useReaderPrefs updates, persists and survives blocked storage.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useReaderPrefs } from '@/lib/reader/useReaderPrefs';
import { DEFAULT_READER_PREFS, READER_PREFS_KEY } from '@/lib/reader/readerPrefs';

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useReaderPrefs', () => {
  it('starts at the defaults and persists a change to localStorage', () => {
    const { result } = renderHook(() => useReaderPrefs());
    expect(result.current[0]).toEqual(DEFAULT_READER_PREFS);
    act(() => result.current[1]({ step: 3, chords: false }));
    expect(result.current[0]).toEqual({ step: 3, chords: false });
    expect(JSON.parse(localStorage.getItem(READER_PREFS_KEY)!)).toEqual({ step: 3, chords: false });
  });

  it('reads a stored value and clamps an out-of-range step', () => {
    localStorage.setItem(READER_PREFS_KEY, JSON.stringify({ step: 99, chords: true }));
    const { result } = renderHook(() => useReaderPrefs());
    expect(result.current[0].step).toBeLessThan(99);
    expect(result.current[0].chords).toBe(true);
  });

  it('keeps the choice in memory when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => useReaderPrefs());
    act(() => result.current[1]({ step: 4, chords: true }));
    expect(result.current[0]).toEqual({ step: 4, chords: true });
  });
});
