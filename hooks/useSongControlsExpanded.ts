'use client';

import { useCallback, useSyncExternalStore } from 'react';

export const SONG_CONTROLS_EXPANDED_KEY = 'sfs_song_controls_expanded';

const listeners = new Set<() => void>();
/** Holds the choice for this visit when the browser refuses to store it. Null when storage has it. */
let unsaved: boolean | null = null;

function getSnapshot(): boolean {
  if (unsaved !== null) return unsaved;
  try {
    return window.localStorage.getItem(SONG_CONTROLS_EXPANDED_KEY) === 'true';
  } catch {
    return false;
  }
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
      unsaved = null;
    } catch {
      unsaved = nextVal; // blocked or full storage: the controls still open, only for this visit
    }
    listeners.forEach((l) => l());
  }, []);

  return [expanded, setExpanded];
}
