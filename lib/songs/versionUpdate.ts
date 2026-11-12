/**
 * The one place that builds what the edit form writes to `song_versions` (Story 6.2.20 / G5.3, #523).
 * A later story that has to mark a save (for example an "edited in the app" stamp on catalog versions, #524)
 * adds its fields here and every save carries it.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { versionMetaFieldsForSave, type VersionMetaInput } from '@/lib/songs/versionMeta';

/** What the form holds for one version. `beats` and `note` exist in the edit form only. */
export interface VersionFormValues extends VersionMetaInput {
  content: string;
  key?: string;
  capo?: string;
  tuning?: string;
  youtubeLink: string;
  spotifyLink: string;
  soundcloudLink: string;
  melodyNotation: string;
}

/**
 * The `song_versions` update of an edit. Key, capo, tuning, lyrics and media links are always written (the form
 * has always done so); beats and note only when the user changed them, as NULL when cleared.
 */
export function versionUpdateFields(data: VersionFormValues, initial: VersionMetaInput | undefined) {
  return {
    content_chordpro: data.content,
    key: data.key,
    capo: data.capo ? parseInt(data.capo) : 0,
    tuning: data.tuning,
    youtube_url: data.youtubeLink,
    spotify_url: data.spotifyLink,
    soundcloud_url: data.soundcloudLink,
    melody_notation: data.melodyNotation,
    ...versionMetaFieldsForSave(data, initial),
  };
}

/** Error codes `errorMessage()` turns into a translated sentence (lib/errors/errorCode.ts). */
export const VERSION_NOT_SAVED = 'sfs_version_not_saved';
export const SOURCE_NOT_CORRECTED = 'sfs_source_not_corrected';

/** A write the database accepted without error but did not apply (row-level security filtered the row). */
export class SaveRefusedError extends Error {
  constructor(readonly code: typeof VERSION_NOT_SAVED | typeof SOURCE_NOT_CORRECTED) {
    super(code);
    this.name = 'SaveRefusedError';
  }
}

/**
 * Updates one `song_versions` row. PostgREST answers an update that row-level security filters (for example a song
 * owner editing a catalog version that has no contributor) with success and no row, so the row is asked back and an
 * empty answer is an error: the form must never say "saved" for a write that changed nothing.
 */
export async function updateVersionRow(supabase: SupabaseClient, versionId: string, fields: Record<string, unknown>) {
  const { data, error } = await supabase.from('song_versions').update(fields).eq('id', versionId).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new SaveRefusedError(VERSION_NOT_SAVED);
}

/**
 * Updates one `song_version_sources` row, the last step of a save: by then the version, its categories and tags are
 * stored, so a refusal (an error or no row) is reported as "source not corrected", not as a failed save.
 */
export async function updateSourceRow(supabase: SupabaseClient, sourceId: string, fields: Record<string, unknown>) {
  const { data, error } = await supabase.from('song_version_sources').update(fields).eq('id', sourceId).select('id');
  if (error || !data || data.length === 0) throw new SaveRefusedError(SOURCE_NOT_CORRECTED);
}
