export const SMART_PLAYLISTS = ['My Favorites', 'My Songs', 'My Drafts', 'My Recordings'] as const;

export function isSmartPlaylist(title: string): boolean {
    return (SMART_PLAYLISTS as readonly string[]).includes(title);
}

