import type { TranslationKey } from '@/messages/en';

/**
 * Validation 1 review, M4: what a person sees when a server action or a database call fails.
 *
 * The server answers with plain English strings ("Playlist not found") and sometimes with a raw database
 * message. Neither is shown. A message we know maps to a translated key; anything else becomes the generic
 * message of the call site. Pure functions: pass the `t` of the active language.
 */
export const ACTION_ERROR_KEYS: Readonly<Record<string, TranslationKey>> = {
  'Not authenticated': 'errors.notSignedIn',
  Unauthorized: 'errors.notSignedIn',
  'Access denied': 'errors.accessDenied',
  'Access denied: not your playlist or unauthorized': 'errors.accessDenied',
  'Not your playlist': 'errors.accessDenied',
  'Forbidden: Admins only': 'errors.accessDenied',
  'Playlist not found': 'errors.playlistNotFound',
  'Song version not found': 'errors.songNotFound',
  'Cannot rename smart playlists': 'errors.smartPlaylistLocked',
  'Cannot delete smart playlists': 'errors.smartPlaylistLocked',
  'Cannot modify smart playlists': 'errors.smartPlaylistLocked',
  'Title required': 'errors.titleRequired',
  'Title too long': 'errors.titleTooLong',
  'Description too long': 'errors.descriptionTooLong',
  'Please log in to export a PDF songbook': 'errors.notSignedIn',
  'Export limit exceeded: maximum 200 songs allowed per PDF export': 'errors.exportLimit',
};

type Translate = (key: TranslationKey) => string;

/** The key of the message to show for a server error string. */
export function actionErrorKey(error: string | null | undefined, fallbackKey: TranslationKey = 'errors.generic'): TranslationKey {
  return (error && ACTION_ERROR_KEYS[error]) || fallbackKey;
}

/** The translated message for a server error string; never the raw text. */
export function actionErrorMessage(error: string | null | undefined, t: Translate, fallbackKey: TranslationKey = 'errors.generic'): string {
  return t(actionErrorKey(error, fallbackKey));
}
