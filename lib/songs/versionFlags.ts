/**
 * Song-level capability flags across ALL versions (Epic 6.1, Story 6.1.11 / G2.6, #395, UXA-048).
 *
 * `compositions.has_chords` / `has_melody` drive the filters, the cards, transpose and the reader for the
 * whole song. Since a song can have several versions (`?version=` makes editing one the normal case), a
 * flag is true when ANY version has it: saving a lyrics-only "Simplified" must not clear the chords of
 * "Original".
 */
import { hasChords } from '@/lib/chordProParsing';

export interface VersionFlagSource {
  content_chordpro?: string | null;
  youtube_url?: string | null;
  spotify_url?: string | null;
  soundcloud_url?: string | null;
  melody_notation?: string | null;
}

export interface SongFlags {
  has_chords: boolean;
  has_melody: boolean;
}

export function versionHasMelody(v: VersionFlagSource): boolean {
  return !!(v.youtube_url || v.spotify_url || v.soundcloud_url || v.melody_notation);
}

export function songFlags(versions: ReadonlyArray<VersionFlagSource>): SongFlags {
  return {
    has_chords: versions.some((v) => hasChords(v.content_chordpro ?? '')),
    has_melody: versions.some(versionHasMelody),
  };
}
