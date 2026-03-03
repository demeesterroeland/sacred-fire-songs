import { useMemo } from 'react';
import { useDeclarativeFilter } from '@/hooks/useDeclarativeFilter';
import { songFilterConfig, type SongFilterState } from '@/lib/songs/filterConfig';
import type { Song } from '@/lib/songUtils';

interface UseSongsFilterOptions {
  songs: Song[];
  userId?: string;
  favoriteIds: Set<string>;
  sortBy: string;
}

export function useSongsFilter({ songs, userId, favoriteIds, sortBy }: UseSongsFilterOptions) {
  const defaultState: SongFilterState = {
    status: userId ? 'all' : 'public',
    search: '',
    category: undefined,
    tags: [],
    chords: false,
    melody: false,
    favorites: false,
    mine: false,
  };

  const { filteredItems, facets, state, setFilter, resetFilters } = useDeclarativeFilter(
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
        favorites: params.get('favorites') === 'true',
        mine: params.get('mine') === 'true',
      }),
      serializeUrl: (state) => ({
        category: state.category || '',
        tag: state.tags?.join(',') || '',
        status: state.status === 'all' ? '' : state.status || '',
        search: state.search || '',
        chords: state.chords ? 'true' : '',
        melody: state.melody ? 'true' : '',
        favorites: state.favorites ? 'true' : '',
        mine: state.mine ? 'true' : '',
        sort: sortBy,
      }),
    }
  );

  // Apply post-filters (favorites, mine)
  const finalFilteredItems = useMemo(() => {
    let items = filteredItems;
    if (state.favorites) items = items.filter(s => favoriteIds.has(s.id));
    if (state.mine && userId) items = items.filter(s => s.ownerId === userId);
    return items;
  }, [filteredItems, state.favorites, state.mine, favoriteIds, userId]);

  // Sort
  const displaySongs = useMemo(() => {
    return [...finalFilteredItems].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [finalFilteredItems, sortBy]);

  const chordsCount = facets.chords?.get('true') || 0;
  const melodyCount = facets.melody?.get('true') || 0;

  const hasActiveFilters = !!(
    state.category ||
    (state.tags?.length ?? 0) > 0 ||
    state.search ||
    (userId && state.status !== 'all') ||
    state.chords ||
    state.melody ||
    state.favorites ||
    state.mine
  );

  return {
    displaySongs,
    filteredCount: finalFilteredItems.length,
    state,
    setFilter,
    resetFilters,
    chordsCount,
    melodyCount,
    hasActiveFilters,
  };
}
