import type { UserRecording } from "@/lib/actions/rehearsal";

/** One entry of Supabase Storage `createSignedUrls`. */
export interface SignedUrlResult {
  path: string | null;
  signedUrl: string | null;
  error?: string | null;
}

/** A recording listed on a singer profile (`/users/:id`). */
export interface ProfileRecording {
  id: string;
  user_id: string;
  recording_name: string;
  song_version_id: string;
  storage_path: string;
  song_id?: string;
  song_title?: string;
  created_at: string;
  /** Signed URL to play the file; null when the file could not be signed (missing file, no access). */
  audio_url: string | null;
}

/** Signed URL per storage path. Paths that failed to sign are left out. */
export function signedUrlByPath(results: ReadonlyArray<SignedUrlResult> | null | undefined): Map<string, string> {
  const map = new Map<string, string>();
  for (const r of results ?? []) {
    if (r.path && r.signedUrl && !r.error) map.set(r.path, r.signedUrl);
  }
  return map;
}

/** The fields the shared audio player (`AudioProvider.handleTogglePlay`) reads. */
export function toPlayableRecording(rec: ProfileRecording): UserRecording {
  return {
    id: rec.id,
    user_id: rec.user_id,
    song_version_id: rec.song_version_id,
    recording_name: rec.recording_name,
    storage_path: rec.storage_path,
    created_at: rec.created_at,
    audioUrl: rec.audio_url ?? undefined,
  };
}
