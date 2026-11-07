// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
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
