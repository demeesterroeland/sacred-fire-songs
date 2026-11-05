'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { isAtBottom, stepScroll } from '@/lib/reader/autoScroll';

/** Touches inside an element marked with this attribute (the reading tools) do not pause the scroll. */
export const AUTOSCROLL_KEEP_ATTR = 'data-autoscroll-keep';

/** The bottom sheets mark their backdrop with this attribute; tapping it closes the sheet, not the scroll. */
export const SHEET_OVERLAY_ATTR = 'data-sheet-overlay';

/** Keys that move the page; any of them means "I take over". */
const PAGE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

/** The nearest ancestor that really scrolls (on desktop the app's main area does), or null for the page itself. */
export function findScrollParent(from: Element | null): HTMLElement | null {
  for (let el = from?.parentElement ?? null; el && el !== document.body; el = el.parentElement) {
    const overflowY = getComputedStyle(el).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) return el;
  }
  return null;
}

/**
 * Story 6.1.10 / G2.5 (#394): scroll the page down at a steady speed for singing from the screen.
 * A touch, mouse press, wheel or paging key anywhere outside the reading tools pauses it, and it
 * stops by itself when the end of the song (`endRef`, the lyrics) is on screen, or at the page bottom.
 * The speed level can change while it runs.
 */
export function useAutoScroll(speed: number, anchorRef?: RefObject<Element | null>, endRef?: RefObject<Element | null>) {
  const [playing, setPlaying] = useState(false);
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const pause = useCallback(() => setPlaying(false), []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last: number | undefined;
    let carry = 0;
    // Resolved once per run: the scroll container around the song, or the page.
    const scroller = findScrollParent(anchorRef?.current ?? null);

    const tick = (now: number) => {
      if (last !== undefined) {
        const step = stepScroll(carry, now - last, speedRef.current);
        carry = step.carry;
        if (step.px > 0) {
          if (scroller) scroller.scrollTop += step.px;
          else window.scrollBy(0, step.px);
        }
        const atBottom = scroller
          ? isAtBottom(scroller.scrollTop, scroller.clientHeight, scroller.scrollHeight)
          : isAtBottom(window.scrollY, window.innerHeight, document.documentElement.scrollHeight);
        const viewportBottom = scroller ? scroller.getBoundingClientRect().bottom : window.innerHeight;
        const endEl = endRef?.current;
        const lyricsEnded = !!endEl && endEl.getBoundingClientRect().bottom <= viewportBottom + 1;
        if (atBottom || lyricsEnded) {
          setPlaying(false);
          return;
        }
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const inKeepZone = (e: Event) =>
      e.target instanceof Element && !!e.target.closest(`[${AUTOSCROLL_KEEP_ATTR}], [${SHEET_OVERLAY_ATTR}]`);
    const stop = (e: Event) => {
      if (!inKeepZone(e)) setPlaying(false);
    };
    const stopOnKey = (e: KeyboardEvent) => {
      if (PAGE_KEYS.has(e.key) && !inKeepZone(e)) setPlaying(false);
    };
    document.addEventListener('touchstart', stop, { passive: true });
    document.addEventListener('mousedown', stop);
    document.addEventListener('wheel', stop, { passive: true });
    document.addEventListener('keydown', stopOnKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('touchstart', stop);
      document.removeEventListener('mousedown', stop);
      document.removeEventListener('wheel', stop);
      document.removeEventListener('keydown', stopOnKey);
    };
  }, [playing, anchorRef, endRef]);

  return { playing, toggle, pause };
}
