'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Validation 2, item 6 (#392): true once `ref` has scrolled up under the bar at the top of the window
 * (`barHeight` px). The song page shows its full title in the page and only then lets the truncated copy
 * appear in the sticky bar. Without IntersectionObserver the answer stays false: the full title is in the page.
 *
 * The element may mount after the hook does (the song page shows a skeleton while it loads), so every commit
 * checks whether `ref.current` is a new element and observes that one.
 */
export function useScrolledPast(ref: RefObject<Element | null>, barHeight: number): boolean {
  const [past, setPast] = useState(false);
  const observed = useRef<{ el: Element | null; io: IntersectionObserver | null }>({ el: null, io: null });

  useEffect(() => {
    const el = ref.current;
    const state = observed.current;
    if (el === state.el) return;
    state.io?.disconnect();
    state.io = null;
    state.el = el;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // Not intersecting AND above the bar: it left through the top, not through the bottom of the window.
        setPast(!entry.isIntersecting && entry.boundingClientRect.bottom <= barHeight);
      },
      { rootMargin: `-${barHeight}px 0px 0px 0px` },
    );
    io.observe(el);
    state.io = io;
  });

  useEffect(() => {
    const state = observed.current;
    return () => {
      state.io?.disconnect();
      state.io = null;
      state.el = null;
    };
  }, []);

  return past;
}
