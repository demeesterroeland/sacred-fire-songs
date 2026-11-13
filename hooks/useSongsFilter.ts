import { useCallback, useMemo } from 'react';
import { useDeclarativeFilter } from '@/hooks/useDeclarativeFilter';
import { songListFilterConfig, isDraftActive, type SongFilterState } from '@/lib/songs/filterConfig';
import { applyBrowseFilters, browseOptions, type BrowseSelection } from '@/lib/songs/browseFilters';
import { rankSongsBySearch } from '@/lib/songs/search';
import type { Song } from '@/lib/songUtils';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface UseSongsFilterOptions {
  songs: Song[];
  userId?: string;
  favoriteIds: Set<string>;
  userRecordingCompositionIds?: Set<string>;
  viewedSongIds: Set<string>;
  sortBy: string;
  /** Sorts the songbook and language options by name. */
  locale?: string;
}

export function useSongsFilter({ songs, userId, favoriteIds, userRecordingCompositionIds = new Set(), viewedSongIds, sortBy, locale }: UseSongsFilterOptions) {
  const defaultState: SongFilterState = {
    status: 'all',
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
    songbook: '',
    language: '',
  };

  const { filteredItems, state, setFilter, commitFilters, resetFilters } = useDeclarativeFilter(
    songs,
    songListFilterConfig,
    defaultState,
    {
      parseUrl: (params) => ({
        category: params.get('category') || undefined,
        tags: params.get('tag') ? params.get('tag')!.split(',').filter(Boolean) : [],
        status: (params.get('status') as SongFilterState['status']) || ('all'),
        search: params.get('search') || '',
        chords: params.get('chords') === 'true',
        melody: params.get('melody') === 'true',
        myRecordings: params.get('myRecordings') === 'true',
        favorites: params.get('favorites') === 'true',
        mine: params.get('mine') === 'true',
        new: params.get('new') === 'true',
        artist: params.get('artist') || '',
        songbook: params.get('songbook') || '',
        language: params.get('language') || '',
      }),
      serializeUrl: (state) => ({
        category: state.category || '',
        tag: state.tags?.join(',') || '',
        status: state.status === ('all') ? '' : state.status || '',
        search: state.search || '',
        chords: state.chords ? 'true' : '',
        melody: state.melody ? 'true' : '',
        myRecordings: state.myRecordings ? 'true' : '',
        favorites: state.favorites ? 'true' : '',
        mine: state.mine ? 'true' : '',
        new: state.new ? 'true' : '',
        artist: state.artist || '',
        songbook: state.songbook || '',
        language: state.language || '',
        sort: sortBy,
      }),
    }
  );

  // The post-filters (favorites, mine, myRecordings, new) on top of what the engine kept.
  const applyPostFilters = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const cutoff = Date.now() - THIRTY_DAYS_MS;
    return (list: Song[]): Song[] => {
      let items = list;
      if (state.favorites) items = items.filter(s => favoriteIds.has(s.id));
      if (state.mine && userId) items = items.filter(s => s.ownerId === userId);
      if (state.myRecordings && userId) items = items.filter(s => userRecordingCompositionIds.has(s.id));
      if (state.new) {
        items = items.filter(s =>
          !viewedSongIds.has(s.id) && new Date(s.createdAt).getTime() >= cutoff
        );
      }
      return items;
    };
  }, [state.favorites, state.mine, state.myRecordings, state.new, favoriteIds, userRecordingCompositionIds, viewedSongIds, userId]);

  // Songbook and language (#522) narrow the engine's result; the engine itself does not know them (songListFilterConfig).
  const browseItems = useMemo(
    () => applyBrowseFilters(filteredItems, { songbook: state.songbook, language: state.language }) as Song[],
    [filteredItems, state.songbook, state.language]
  );
  const finalFilteredItems = useMemo(() => applyPostFilters(browseItems), [applyPostFilters, browseItems]);

  // Options and counts of the songbook and language selects: every option that exists in the catalog, each counted over
  // the songs that pass everything else (search, categories, status, post-filters) and the other select, but not its own
  // choice. A function of the choice, so the sheet can ask with its DRAFT choice before anything is committed.
  const countBase = useMemo(() => applyPostFilters(filteredItems), [applyPostFilters, filteredItems]);
  const browseOptionsFor = useCallback(
    (selection: BrowseSelection) => browseOptions(songs, countBase, selection, locale),
    [songs, countBase, locale]
  );

  // Sort, then (while searching) title matches before the songs found by an alias, author, songbook title, … (#521).
  // The partition is stable, so the chosen sort order holds inside each group.
  const displaySongs = useMemo(() => {
    const sorted = [...finalFilteredItems].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return rankSongsBySearch(sorted, state.search ?? '') as Song[];
  }, [finalFilteredItems, sortBy, state.search]);

  // Cross-filter-aware counts: each count applies all OTHER active post-filters
  // but excludes its own, so users see "how many would match if I toggled this?"
  const toggleCounts = useMemo(() => {
    let chords = 0, melody = 0, favorites = 0, mine = 0, recordings = 0;
    for (const s of browseItems) {
      const isFav = favoriteIds.has(s.id);
      const isMine = userId ? s.ownerId === userId : false;
      const hasRec = userId ? userRecordingCompositionIds.has(s.id) : false;
      // Apply all active post-filters EXCEPT the one we're counting
      const matchFav = !state.favorites || isFav;
      const matchMine = !state.mine || !userId || isMine;
      const matchRec = !state.myRecordings || !userId || hasRec;

      // For chords/melody: must pass all other post-filters
      if (matchFav && matchMine && matchRec && s.hasChords) chords++;
      if (matchFav && matchMine && matchRec && s.hasMelody) melody++;
      // For favorites: must pass mine + recordings (skip favorites check)
      if (matchMine && matchRec && isFav) favorites++;
      // For mine: must pass favorites + recordings (skip mine check)
      if (matchFav && matchRec && isMine) mine++;
      // For recordings: must pass favorites + mine (skip recordings check)
      if (matchFav && matchMine && hasRec) recordings++;
    }
    return { chords, melody, favorites, mine, recordings };
  }, [browseItems, favoriteIds, userRecordingCompositionIds, userId, state.favorites, state.mine, state.myRecordings]);

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
    recordingsCount: toggleCounts.recordings,
    browseOptionsFor,
    hasActiveFilters,
  };
}
