'use client';

import { useCallback, useSyncExternalStore } from 'react';

export const SONG_CONTROLS_EXPANDED_KEY = 'sfs_song_controls_expanded';

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue = false;

function readRaw(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(SONG_CONTROLS_EXPANDED_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): boolean {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = raw === 'true';
  }
  return cachedValue;
}

const getServerSnapshot = () => false;

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SONG_CONTROLS_EXPANDED_KEY) cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

/**
 * Remembers per device whether the song page's controls (Key, Capo, Chords · A− · A+ · ▶)
 * are expanded (Story 6.1, validation 3). Defaults to closed (false).
 */
export function useSongControlsExpanded(): [boolean, (next: boolean | ((prev: boolean) => boolean)) => void] {
  const expanded = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setExpanded = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof next === 'function' ? next(getSnapshot()) : next;
    try {
      window.localStorage.setItem(SONG_CONTROLS_EXPANDED_KEY, String(nextVal));
    } catch {
      // quota or blocked storage
    }
    cachedRaw = String(nextVal);
    cachedValue = nextVal;
    listeners.forEach((l) => l());
  }, []);

  return [expanded, setExpanded];
}
