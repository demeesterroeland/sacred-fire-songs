import { useMemo } from 'react';
import { useDeclarativeFilter } from '@/hooks/useDeclarativeFilter';
import { songFilterConfig, isDraftActive, type SongFilterState } from '@/lib/songs/filterConfig';
import type { Song } from '@/lib/songUtils';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface UseSongsFilterOptions {
  songs: Song[];
  userId?: string;
  favoriteIds: Set<string>;
  userRecordingCompositionIds?: Set<string>;
  viewedSongIds: Set<string>;
  sortBy: string;
}

export function useSongsFilter({ songs, userId, favoriteIds, userRecordingCompositionIds = new Set(), viewedSongIds, sortBy }: UseSongsFilterOptions) {
  const defaultState: SongFilterState = {
    status: userId ? 'all' : 'public',
    search: '',
    category: undefined,
    tags: [],
    chords: false,
    melody: false,
    myRecordings: false,
    favorites: false,
    mine: false,
    new: false,
    artist: '',
  };

  const { filteredItems, state, setFilter, commitFilters, resetFilters } = useDeclarativeFilter(
    songs,
    songFilterConfig,
    defaultState,
    {
      parseUrl: (params) => ({
        category: params.get('category') || undefined,
        tags: params.get('tag') ? params.get('tag')!.split(',').filter(Boolean) : [],
        status: (params.get('status') as SongFilterState['status']) || (userId ? 'all' : 'public'),
        search: params.get('search') || '',
        chords: params.get('chords') === 'true',
        melody: params.get('melody') === 'true',
        myRecordings: params.get('myRecordings') === 'true',
        favorites: params.get('favorites') === 'true',
        mine: params.get('mine') === 'true',
        new: params.get('new') === 'true',
        artist: params.get('artist') || '',
      }),
      serializeUrl: (state) => ({
        category: state.category || '',
        tag: state.tags?.join(',') || '',
        status: state.status === 'all' ? '' : state.status || '',
        search: state.search || '',
        chords: state.chords ? 'true' : '',
        melody: state.melody ? 'true' : '',
        myRecordings: state.myRecordings ? 'true' : '',
        favorites: state.favorites ? 'true' : '',
        mine: state.mine ? 'true' : '',
        new: state.new ? 'true' : '',
        artist: state.artist || '',
        sort: sortBy,
      }),
    }
  );

  // Apply post-filters (favorites, mine, myRecordings, new)
  const finalFilteredItems = useMemo(() => {
    let items = filteredItems;
    if (state.favorites) items = items.filter(s => favoriteIds.has(s.id));
    if (state.mine && userId) items = items.filter(s => s.ownerId === userId);
    if (state.myRecordings && userId) items = items.filter(s => userRecordingCompositionIds.has(s.id));
    if (state.new) {
      // eslint-disable-next-line react-hooks/purity
      const cutoff = Date.now() - THIRTY_DAYS_MS;
      items = items.filter(s =>
        !viewedSongIds.has(s.id) && new Date(s.createdAt).getTime() >= cutoff
      );
    }
    return items;
  }, [filteredItems, state.favorites, state.mine, state.myRecordings, state.new, favoriteIds, userRecordingCompositionIds, viewedSongIds, userId]);

  // Sort
  const displaySongs = useMemo(() => {
    return [...finalFilteredItems].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [finalFilteredItems, sortBy]);

  // Cross-filter-aware counts: each count applies all OTHER active post-filters
  // but excludes its own, so users see "how many would match if I toggled this?"
  const toggleCounts = useMemo(() => {
    let chords = 0, melody = 0, favorites = 0, mine = 0;
    for (const s of filteredItems) {
      const isFav = favoriteIds.has(s.id);
      const isMine = userId ? s.ownerId === userId : false;
      // Apply all active post-filters EXCEPT the one we're counting
      const matchFav = !state.favorites || isFav;
      const matchMine = !state.mine || !userId || isMine;

      // For chords/melody: must pass other post-filters
      if (matchFav && matchMine && s.hasChords) chords++;
      if (matchFav && matchMine && s.hasMelody) melody++;
      // For favorites: must pass mine (skip favorites check)
      if (matchMine && isFav) favorites++;
      // For mine: must pass favorites (skip mine check)
      if (matchFav && isMine) mine++;
    }
    return { chords, melody, favorites, mine };
  }, [filteredItems, favoriteIds, userId, state.favorites, state.mine]);

  const hasActiveFilters = isDraftActive(state, userId);

  return {
    displaySongs,
    filteredCount: finalFilteredItems.length,
    state,
    setFilter,
    commitFilters,
    resetFilters,
    chordsCount: toggleCounts.chords,
    melodyCount: toggleCounts.melody,
    favoritesCount: toggleCounts.favorites,
    mineCount: toggleCounts.mine,
    hasActiveFilters,
  };
}
