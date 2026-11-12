/**
 * The one place that builds what the edit form writes to `song_versions` (Story 6.2.20 / G5.3, #523).
 * A later story that has to mark a save (for example an "edited in the app" stamp on catalog versions, #524)
 * adds its fields here and every save carries it.
 */
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
