/**
 * Centralised React Query key definitions for songs.
 * Import these everywhere — never hardcode string arrays inline.
 *
 * invalidateQueries({ queryKey: SONG_KEYS.all() }) invalidates every song list.
 * invalidateQueries({ queryKey: SONG_KEYS.detail(id) }) invalidates one song's detail + edit.
 */
export const SONG_KEYS = {
    /** Matches ['songs', 'all'] — the main songs list */
    list: () => ['songs', 'all'] as const,

    /** Prefix that matches ALL ['songs', *] keys in one call */
    all: () => ['songs'] as const,

    /** Individual song detail */
    detail: (id: string) => ['song', id] as const,

    /** Song edit form */
    edit: (id: string) => ['song', id, 'edit'] as const,

    /** User's favorite composition IDs */
    favorites: (userId?: string) => ['favorites', userId] as const,

    /** Prefix that matches ALL ['favorites', *] keys */
    allFavorites: () => ['favorites'] as const,

    /** Taxonomy / category tree */
    taxonomy: () => ['taxonomy'] as const,

    /** Global filter counts (chords, melody, mine, favorites) used in GlobalSearchModal */
    globalFilterCounts: (userId?: string) => ['global-filter-counts', userId] as const,
} as const;

/**
 * React Query key definitions for playlists (setlists).
 */
export const PLAYLIST_KEYS = {
    /** All user-created playlists (excludes smart playlists) for a user */
    list: (userId: string) => ['playlists', userId] as const,

    /** Playlist IDs that contain a given composition */
    containingComposition: (compositionId: string) => ['playlists', 'containing', compositionId] as const,
} as const;
