// @vitest-environment jsdom
// G2.5 follow-up (validation 1, fix 1): ▶ only shows when the end of the lyrics is below the fold.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useLyricsBelowFold } from '@/hooks/useAutoScroll';

let roCallbacks: ResizeObserverCallback[] = [];
let observed: Element[] = [];

beforeEach(() => {
  roCallbacks = [];
  observed = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(cb: ResizeObserverCallback) {
        roCallbacks.push(cb);
      }
      observe(el: Element) {
        observed.push(el);
      }
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function lyrics(bottom: number) {
  const parent = document.createElement('div');
  const el = document.createElement('div');
  parent.appendChild(el);
  document.body.appendChild(parent);
  let b = bottom;
  el.getBoundingClientRect = () => ({ bottom: b }) as DOMRect;
  return { el, set: (n: number) => (b = n), done: () => parent.remove() };
}

function fireObservers() {
  act(() => roCallbacks.forEach((cb) => cb([], {} as ResizeObserver)));
}

describe('useLyricsBelowFold', () => {
  it('is true when the lyrics run below the screen', () => {
    const l = lyrics(1500);
    const { result } = renderHook(() => useLyricsBelowFold({ current: l.el }));
    expect(result.current).toBe(true);
    l.done();
  });

  it('is false when the whole song fits', () => {
    const l = lyrics(600);
    const { result } = renderHook(() => useLyricsBelowFold({ current: l.el }));
    expect(result.current).toBe(false);
    l.done();
  });

  it('is false while the lyrics are not on the page yet (content still loading)', () => {
    const { result } = renderHook(() => useLyricsBelowFold({ current: null }));
    expect(result.current).toBe(false);
  });

  it('recalculates when the lyrics change size (A+/A−, chords toggle, version switch, content load)', () => {
    const l = lyrics(600);
    const { result } = renderHook(() => useLyricsBelowFold({ current: l.el }));
    expect(result.current).toBe(false);
    expect(observed).toContain(l.el);
    l.set(1500); // larger text
    fireObservers();
    expect(result.current).toBe(true);
    l.set(700); // smaller again
    fireObservers();
    expect(result.current).toBe(false);
    l.done();
  });

  it('recalculates when the viewport is resized', () => {
    const l = lyrics(1000);
    const { result } = renderHook(() => useLyricsBelowFold({ current: l.el }));
    expect(result.current).toBe(true);
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1200 });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(false);
    l.done();
  });

  it('finds the lyrics when they mount after the first render', () => {
    const l = lyrics(1500);
    const ref: { current: HTMLElement | null } = { current: null };
    const { result, rerender } = renderHook(() => useLyricsBelowFold(ref));
    expect(result.current).toBe(false);
    ref.current = l.el;
    rerender();
    expect(result.current).toBe(true);
    l.done();
  });
});
