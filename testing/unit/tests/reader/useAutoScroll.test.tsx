// @vitest-environment jsdom
// Story 6.1.10 / G2.5 (#394): useAutoScroll scrolls by frames, and stops on touch, wheel, keys and the bottom.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { findScrollParent, useAutoScroll } from '@/hooks/useAutoScroll';

let now = 0;
let frames: FrameRequestCallback[] = [];
let scrollY = 0;
const scrollBy = vi.fn((_x: number, y: number) => {
  scrollY += y;
});

function runFrame(ms: number) {
  now += ms;
  const queued = frames;
  frames = [];
  act(() => queued.forEach((cb) => cb(now)));
}

beforeEach(() => {
  now = 0;
  scrollY = 0;
  frames = [];
  scrollBy.mockClear();
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
  vi.stubGlobal('cancelAnimationFrame', () => {
    frames = [];
  });
  Object.defineProperty(window, 'scrollBy', { configurable: true, value: scrollBy });
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollY });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, get: () => 5000 });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useAutoScroll', () => {
  it('starts paused and does not scroll', () => {
    const { result } = renderHook(() => useAutoScroll(3));
    expect(result.current.playing).toBe(false);
    expect(frames).toHaveLength(0);
  });

  it('scrolls down while playing, at the speed of the level', () => {
    const { result, rerender } = renderHook(({ s }) => useAutoScroll(s), { initialProps: { s: 3 } });
    act(() => result.current.toggle());
    expect(result.current.playing).toBe(true);
    runFrame(0); // first frame only sets the clock
    runFrame(100);
    runFrame(100);
    const slow = scrollY;
    expect(slow).toBeGreaterThan(0);
    rerender({ s: 5 });
    scrollY = 0;
    runFrame(100);
    runFrame(100);
    expect(scrollY).toBeGreaterThan(slow / 2); // the new speed is picked up without restarting
  });

  it('toggle pauses again', () => {
    const { result } = renderHook(() => useAutoScroll(3));
    act(() => result.current.toggle());
    act(() => result.current.toggle());
    expect(result.current.playing).toBe(false);
  });

  it.each(['touchstart', 'wheel', 'mousedown'])('a %s on the page pauses it', (type) => {
    const { result } = renderHook(() => useAutoScroll(3));
    act(() => result.current.toggle());
    act(() => {
      document.body.dispatchEvent(new Event(type, { bubbles: true }));
    });
    expect(result.current.playing).toBe(false);
  });

  it('keys that move the page pause it; other keys do not', () => {
    const { result } = renderHook(() => useAutoScroll(3));
    act(() => result.current.toggle());
    act(() => {
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    });
    expect(result.current.playing).toBe(true);
    act(() => {
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    expect(result.current.playing).toBe(false);
  });

  it('touches inside the reading tools do not pause it', () => {
    const keep = document.createElement('div');
    keep.setAttribute('data-autoscroll-keep', '');
    const btn = document.createElement('button');
    keep.appendChild(btn);
    document.body.appendChild(keep);
    const { result } = renderHook(() => useAutoScroll(3));
    act(() => result.current.toggle());
    act(() => {
      btn.dispatchEvent(new Event('touchstart', { bubbles: true }));
    });
    expect(result.current.playing).toBe(true);
    keep.remove();
  });

  it.each(['touchstart', 'mousedown'])('a %s on a sheet backdrop does not pause it', (type) => {
    const overlay = document.createElement('div');
    overlay.setAttribute('data-sheet-overlay', '');
    document.body.appendChild(overlay);
    const { result } = renderHook(() => useAutoScroll(3));
    act(() => result.current.toggle());
    act(() => {
      overlay.dispatchEvent(new Event(type, { bubbles: true }));
    });
    expect(result.current.playing).toBe(true);
    overlay.remove();
  });

  it('stops at the end of the lyrics, before the bottom of the page', () => {
    const end = document.createElement('div');
    end.getBoundingClientRect = () => ({ bottom: 900 }) as DOMRect; // viewport is 800 high
    const endRef = { current: end };
    const { result } = renderHook(() => useAutoScroll(5, undefined, endRef));
    act(() => result.current.toggle());
    runFrame(0);
    runFrame(16);
    expect(result.current.playing).toBe(true); // lyrics still run below the screen
    end.getBoundingClientRect = () => ({ bottom: 700 }) as DOMRect;
    runFrame(16);
    expect(result.current.playing).toBe(false);
    expect(scrollY).toBeLessThan(4200); // the page itself was nowhere near its bottom
  });

  it('stops by itself at the bottom of the page', () => {
    const { result } = renderHook(() => useAutoScroll(5));
    act(() => result.current.toggle());
    scrollY = 4200; // 4200 + 800 = 5000
    runFrame(0);
    runFrame(16);
    expect(result.current.playing).toBe(false);
  });

  it('stops by itself when auto-scroll is no longer possible (the song now fits the screen)', () => {
    const { result, rerender } = renderHook(({ on }) => useAutoScroll(3, undefined, undefined, on), {
      initialProps: { on: true },
    });
    act(() => result.current.toggle());
    expect(result.current.playing).toBe(true);
    rerender({ on: false });
    expect(result.current.playing).toBe(false);
    // and it does not restart by itself when the song stops fitting again
    rerender({ on: true });
    expect(result.current.playing).toBe(false);
  });

  it('cannot be started while auto-scroll is not possible', () => {
    const { result } = renderHook(() => useAutoScroll(3, undefined, undefined, false));
    act(() => result.current.toggle());
    expect(result.current.playing).toBe(false);
  });

  it('stops scheduling frames when it unmounts', () => {
    const { result, unmount } = renderHook(() => useAutoScroll(3));
    act(() => result.current.toggle());
    unmount();
    expect(frames).toHaveLength(0);
  });
});

describe('findScrollParent', () => {
  function panel(overflowY: string, scrollH: number, clientH: number) {
    const el = document.createElement('div');
    el.style.overflowY = overflowY;
    Object.defineProperty(el, 'scrollHeight', { configurable: true, value: scrollH });
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: clientH });
    document.body.appendChild(el);
    return el;
  }

  it('finds the nearest ancestor that really scrolls (desktop: the app main area)', () => {
    const scroller = panel('auto', 3000, 800);
    const inner = document.createElement('div');
    const leaf = document.createElement('p');
    inner.appendChild(leaf);
    scroller.appendChild(inner);
    expect(findScrollParent(leaf)).toBe(scroller);
    scroller.remove();
  });

  it('skips containers that cannot scroll and falls back to the page', () => {
    const idle = panel('auto', 800, 800);
    const leaf = document.createElement('p');
    idle.appendChild(leaf);
    expect(findScrollParent(leaf)).toBeNull();
    expect(findScrollParent(null)).toBeNull();
    idle.remove();
  });
});

describe('useAutoScroll in a scroll container', () => {
  it('scrolls that container instead of the window', () => {
    const scroller = document.createElement('div');
    scroller.style.overflowY = 'auto';
    Object.defineProperty(scroller, 'scrollHeight', { configurable: true, value: 5000 });
    Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 800 });
    const anchor = document.createElement('p');
    scroller.appendChild(anchor);
    document.body.appendChild(scroller);
    const ref = { current: anchor };
    const { result } = renderHook(() => useAutoScroll(5, ref));
    act(() => result.current.toggle());
    runFrame(0);
    runFrame(100);
    runFrame(100);
    expect(scroller.scrollTop).toBeGreaterThan(0);
    expect(scrollBy).not.toHaveBeenCalled();
    scroller.scrollTop = 4200; // + 800 = 5000
    runFrame(16);
    expect(result.current.playing).toBe(false);
    scroller.remove();
  });
});
