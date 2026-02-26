'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sfs_guest_favorites';
const NUDGE_THRESHOLDS = [1, 5]; // show nudge after 1st and 5th favorite

function readFromStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeToStorage(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export interface GuestFavoritesReturn {
  ids: Set<string>;
  toggle: (id: string) => { isFavorited: boolean; shouldNudge: boolean };
  count: number;
  getAll: () => string[];
  clear: () => void;
}

export function useGuestFavorites(): GuestFavoritesReturn {
  const [ids, setIds] = useState<Set<string>>(() => readFromStorage());

  // Sync from storage on mount (SSR-safe)
  useEffect(() => {
    setIds(readFromStorage());
  }, []);

  const toggle = useCallback((id: string): { isFavorited: boolean; shouldNudge: boolean } => {
    let isFavorited = false;
    let shouldNudge = false;

    setIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        isFavorited = false;
      } else {
        next.add(id);
        isFavorited = true;
        shouldNudge = NUDGE_THRESHOLDS.includes(next.size);
      }
      writeToStorage(next);
      return next;
    });

    return { isFavorited, shouldNudge };
  }, []);

  const clear = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    setIds(new Set());
  }, []);

  const getAll = useCallback(() => [...ids], [ids]);

  return { ids, toggle, count: ids.size, getAll, clear };
}
