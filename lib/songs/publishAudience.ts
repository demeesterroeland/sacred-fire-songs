// Story 6.1.21 / G4.8 (#405): who will hear a take once its owner publishes it.
//
// Product rule: a take on a private song has no audience yet, so publishing starts with the song.
// The Make public dialog and the `publishRecording` action only publish a take on a public song;
// an owner of the song (or an admin) can make the song public from the same dialog. Unpublishing
// is always allowed. A song whose visibility is empty counts as not public; one that could not be
// read says so, and the take is not offered for publishing until it can be.
// Publishing sets `user_recordings.is_public` and `singer_consent_confirmed` in one update, and
// the dialog always records the singer consent.
export type PublishAudience = 'everyone' | 'song-private' | 'checking' | 'unreadable';

/** `null` = the visibility of the song is not known yet; `unreadable` = looking it up failed. */
type SongVisibility = { songIsPublic: boolean | null; unreadable?: boolean };

export function publishAudience(opts: SongVisibility): PublishAudience {
  if (opts.unreadable) return 'unreadable';
  if (opts.songIsPublic === null) return 'checking';
  return opts.songIsPublic ? 'everyone' : 'song-private';
}

/** Message key of the sentence that tells the owner who will be able to listen. */
export function publishAudienceKey(opts: SongVisibility):
  | 'recording.publish.description'
  | 'recording.publish.descriptionPrivateSong'
  | 'recording.publish.checkingSong'
  | 'recording.publish.checkFailed' {
  switch (publishAudience(opts)) {
    case 'everyone':
      return 'recording.publish.description';
    case 'song-private':
      return 'recording.publish.descriptionPrivateSong';
    case 'unreadable':
      return 'recording.publish.checkFailed';
    default:
      return 'recording.publish.checkingSong';
  }
}

/** Only a take on a public song can be published. */
export function canPublishTake(opts: SongVisibility): boolean {
  return publishAudience(opts) === 'everyone';
}

/** What the Make public dialog offers next. */
export type PublishOffer = 'publish' | 'make-song-public' | 'ask-owner' | 'wait';

export function publishOffer(opts: SongVisibility & { canMakeSongPublic: boolean }): PublishOffer {
  switch (publishAudience(opts)) {
    case 'everyone':
      return 'publish';
    case 'checking':
    case 'unreadable':
      return 'wait';
    default:
      return opts.canMakeSongPublic ? 'make-song-public' : 'ask-owner';
  }
}

/** Code of the refusal `publishRecording` returns for a take on a song that is not public. */
export const SONG_NOT_PUBLIC = 'song-private';

type Embedded<T> = T | T[] | null | undefined;
const first = <T,>(value: Embedded<T>): T | undefined => (Array.isArray(value) ? value[0] : value ?? undefined);

/**
 * Visibility of the song behind a take row fetched with
 * `song_versions(compositions(is_public))`. Anything but an explicit `true` is not public.
 */
export function songIsPublicOfTake(
  row: { song_versions?: Embedded<{ compositions?: Embedded<{ is_public?: boolean | null }> }> } | null | undefined,
): boolean {
  const version = first(row?.song_versions);
  return first(version?.compositions)?.is_public === true;
}
