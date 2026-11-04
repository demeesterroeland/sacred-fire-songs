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
