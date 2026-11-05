'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  DEFAULT_READER_PREFS,
  READER_PREFS_KEY,
  parseReaderPrefs,
  saveReaderPrefs,
  type ReaderPrefs,
} from '@/lib/reader/readerPrefs';

/**
 * Per-device reader preferences (Story 6.1.6, #390). The server render and
 * hydration use the defaults; the stored value is applied right after.
 */
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: ReaderPrefs } | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(READER_PREFS_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): ReaderPrefs {
  const raw = readRaw();
  if (!cache || cache.raw !== raw) cache = { raw, value: parseReaderPrefs(raw) };
  return cache.value;
}

const getServerSnapshot = () => DEFAULT_READER_PREFS;

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === READER_PREFS_KEY) cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

export function useReaderPrefs(): [ReaderPrefs, (next: ReaderPrefs) => void] {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const set = useCallback((next: ReaderPrefs) => {
    saveReaderPrefs(next);
    // Storage may be blocked: keep the value for this session anyway.
    cache = { raw: readRaw(), value: next };
    listeners.forEach((l) => l());
  }, []);
  return [prefs, set];
}
