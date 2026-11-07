'use client';

import { useEffect, useRef, useState } from 'react';
import { applyActionBarHeight, initialBarScroll, nextBarScroll, type BarScroll } from '@/lib/song/actionBar';

/**
 * Story 6.1.9 / G2.4 (#393): hide the song page action bar on scroll down, show it on scroll up.
 * `autoHide` is the user's auto-hide preference; when off the bar always shows.
 * While mounted it reserves its own height on the page (`--action-bar-h`).
 */
export function useActionBarVisibility(autoHide: boolean): boolean {
  const [state, setState] = useState<BarScroll>(() => initialBarScroll(0));
  const ref = useRef(state);

  useEffect(() => {
    applyActionBarHeight(true, document.documentElement);
    return () => applyActionBarHeight(false, document.documentElement);
  }, []);

  useEffect(() => {
    if (!autoHide) return;
    ref.current = initialBarScroll(window.scrollY);
    const onScroll = () => {
      const next = nextBarScroll(ref.current, window.scrollY, true);
      if (next === ref.current) return;
      ref.current = next;
      setState(next);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      // Auto-hide turned off (or unmount): forget a hidden state, so turning it on again starts visible.
      ref.current = initialBarScroll(0);
      setState(ref.current);
    };
  }, [autoHide]);

  return !autoHide || state.visible;
}
