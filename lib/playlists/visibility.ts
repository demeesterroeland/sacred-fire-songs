/**
 * Visibility of a new playlist (Story 6.1.32 / G8.3, #416).
 *
 * What the database does (RLS on `setlists`): a private playlist is readable by
 * its owner (and admins); a public one by everyone, signed in or not, and it is
 * listed under "Public playlists". Only the owner, or an admin or gatekeeper for a
 * public one, may change it. New playlists are private unless the creator
 * switches to public. The Add to playlist sheet always creates private.
 */
export const NEW_PLAYLIST_IS_PUBLIC = false;

/** Only an explicit `true` makes a playlist public; anything else is private. */
export function toIsPublic(value: unknown): boolean {
  return value === true;
}

export type VisibilityExplainKey = 'playlists.add.privateExplain' | 'playlists.add.publicExplain';

/** The one-line explanation shown under the visibility switch. */
export function visibilityExplainKey(isPublic: boolean): VisibilityExplainKey {
  return isPublic ? 'playlists.add.publicExplain' : 'playlists.add.privateExplain';
}

export const VISIBILITY_LOCALE_KEYS = [
  'playlists.add.visibilityLabel',
  'playlists.add.privateExplain',
  'playlists.add.publicExplain',
  'playlists.picker.newPrivateHint',
] as const;

/** Create is possible once a name is typed and nothing is being created. */
export function canCreatePlaylist(title: string, pending: boolean): boolean {
  return !pending && title.trim().length > 0;
}
