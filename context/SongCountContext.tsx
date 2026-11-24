'use client';

import { createContext, useContext } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { roundSongCount } from '@/lib/songs/songSearchCount';

/** The number of public songs, counted once per request in the root layout (#657). Null when unknown. */
const SongCountContext = createContext<number | null>(null);

export function SongCountProvider({ count, children }: { count: number | null; children: React.ReactNode }) {
  return <SongCountContext.Provider value={count}>{children}</SongCountContext.Provider>;
}

type PlaceholderKey = 'songs.searchPlaceholder' | 'search.placeholder';

/** "Search 1000+ songs" with the rounded real count; "Search songs" when the count is unknown or zero. */
export function useSongSearchPlaceholder(key: PlaceholderKey): string {
  const { t } = useLocale();
  const count = roundSongCount(useContext(SongCountContext));
  return count == null ? t('home.search.placeholder') : t(key, { count });
}
