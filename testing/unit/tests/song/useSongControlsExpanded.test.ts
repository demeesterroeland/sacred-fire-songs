// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { SONG_CONTROLS_EXPANDED_KEY, useSongControlsExpanded } from '@/hooks/useSongControlsExpanded';

describe('useSongControlsExpanded', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults to false (closed by default)', () => {
    const { result } = renderHook(() => useSongControlsExpanded());
    expect(result.current[0]).toBe(false);
  });

  it('persists changes to localStorage and updates state', () => {
    const { result } = renderHook(() => useSongControlsExpanded());
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(window.localStorage.getItem(SONG_CONTROLS_EXPANDED_KEY)).toBe('true');

    act(() => {
      result.current[1]((prev) => !prev);
    });

    expect(result.current[0]).toBe(false);
    expect(window.localStorage.getItem(SONG_CONTROLS_EXPANDED_KEY)).toBe('false');
  });

  it('initializes from persisted value in localStorage', () => {
    window.localStorage.setItem(SONG_CONTROLS_EXPANDED_KEY, 'true');
    const { result } = renderHook(() => useSongControlsExpanded());
    expect(result.current[0]).toBe(true);
  });
});

describe('useSongControlsExpanded without storage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('still opens and closes when the browser refuses storage', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const { result } = renderHook(() => useSongControlsExpanded());
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
    act(() => result.current[1](false));
    expect(result.current[0]).toBe(false);
    vi.restoreAllMocks();
    act(() => result.current[1](false)); // a write that works hands over to storage again
  });

  it('still opens when storage is full but readable', () => {
    window.localStorage.clear();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    const { result } = renderHook(() => useSongControlsExpanded());
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
    vi.restoreAllMocks();
    act(() => result.current[1](false));
  });
});
