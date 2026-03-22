import { useMemo } from 'react';
import { useDeclarativeFilter } from '@/hooks/useDeclarativeFilter';
import { songFilterConfig, type SongFilterState } from '@/lib/songs/filterConfig';
import type { Song } from '@/lib/songUtils';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface UseSongsFilterOptions {
  songs: Song[];
  userId?: string;
  isAdmin?: boolean;
  favoriteIds: Set<string>;
  viewedSongIds: Set<string>;
  sortBy: string;
}

export function useSongsFilter({ songs, userId, isAdmin, favoriteIds, viewedSongIds, sortBy }: UseSongsFilterOptions) {
  const defaultState: SongFilterState = {
    status: userId ? 'all' : 'public',
    search: '',
    category: undefined,
    tags: [],
    chords: false,
    melody: false,
    favorites: false,
    mine: false,
    new: false,
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
        new: params.get('new') === 'true',
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
        new: state.new ? 'true' : '',
        sort: sortBy,
      }),
    }
  );

  // Apply post-filters (favorites, mine, new)
  const finalFilteredItems = useMemo(() => {
    let items = filteredItems;
    if (state.favorites) items = items.filter(s => favoriteIds.has(s.id));
    if (state.mine && userId) items = items.filter(s => s.ownerId === userId);
    if (state.new) {
      const cutoff = Date.now() - THIRTY_DAYS_MS;
      items = items.filter(s => {
        if (viewedSongIds.has(s.id)) return false;
        if (new Date(s.createdAt).getTime() < cutoff) return false;
        // Public songs are always "new" for everyone
        if (s.isPublic) return true;
        // Admins also see unviewed drafts by other users
        return isAdmin && !s.isPublic && s.ownerId !== userId;
      });
    }
    return items;
  }, [filteredItems, state.favorites, state.mine, state.new, favoriteIds, viewedSongIds, userId]);

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
    state.mine ||
    state.new
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
