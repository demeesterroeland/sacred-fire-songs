/**
 * Links to a rehearsal recording.
 *
 * - `/recordings/<recordingId>` is the shareable permalink (bell, email, "Copy link").
 *   The route looks the recording up under RLS and redirects to its song page.
 * - `/songs/<compositionId>?recording=<recordingId>` is the song page focused on the
 *   recording: it opens the recording's version and the Recordings tab, then
 *   highlights the take.
 */
export const RECORDING_PARAM = 'recording';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Shareable, song-independent link to a recording. */
export function recordingPermalink(recordingId: string): string {
  return `/recordings/${encodeURIComponent(recordingId)}`;
}

/** Song page focused on one recording. */
export function songRecordingPath(compositionId: string, recordingId: string): string {
  return `/songs/${compositionId}?${RECORDING_PARAM}=${encodeURIComponent(recordingId)}`;
}

/** The recording id when it is well formed, else null. */
export function parseRecordingParam(value: string | null | undefined): string | null {
  return value && UUID.test(value) ? value : null;
}

/** The Practice tab that lists the takes: Record for a member, Listen for a guest (who cannot record). */
export function takeListTab(signedIn: boolean): 'recorder' | 'media' {
  return signedIn ? 'recorder' : 'media';
}

/**
 * The Practice tab a `?recording=` link opens. A guest lands on Listen when the linked take is
 * there to hear; otherwise (no such take) on Record, which asks them to sign in.
 */
export function linkedTakeTab(signedIn: boolean, found: boolean): 'recorder' | 'media' {
  return signedIn || !found ? 'recorder' : 'media';
}
