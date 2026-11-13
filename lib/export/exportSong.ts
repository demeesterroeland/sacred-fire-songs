/**
 * What the playlist PDF export reads per playlist item and how it becomes a printed song (Story 6.2.17, #520).
 * Kept out of the server action file (`'use server'` files only export async functions) so a test can send the very
 * select to the local API and map rows without a session.
 */
import type { ExportSongData } from '@/lib/export/pdfExport';
import { VERSION_SOURCES_SELECT, type VersionSourceRow } from '@/lib/songs/versionSources';

/**
 * Select of `setlist_items`: the embedded `song_versions` is the version the item is pinned to (`song_version_id`), not
 * the song's first one, and `transposition_override` is the item's own transposition. The sources come from the one
 * shared fragment: PostgREST fails the whole query with 42803 when `song_version_sources (` is embedded twice. There is
 * deliberately no `song_translations (` embed: a translation is never printed, the sheet always shows the version's own
 * (original) lyrics.
 */
export const PLAYLIST_EXPORT_SELECT = `
            id,
            order_index,
            transposition_override,
            song_versions (
              id,
              key,
              capo,
              tuning,
              beats,
              content_chordpro,${VERSION_SOURCES_SELECT},
              compositions (
                id,
                title,
                original_author
              )
            )
        `;

export interface PlaylistExportItem {
  id?: string;
  order_index?: number;
  transposition_override?: number | null;
  song_versions?: {
    id?: string;
    key?: string | null;
    capo?: number | null;
    tuning?: string | null;
    beats?: string | null;
    content_chordpro?: string | null;
    song_version_sources?: VersionSourceRow[] | null;
    compositions?: { id?: string; title?: string | null; original_author?: string | null } | null;
  } | null;
}

export interface ExportPlaylistSong extends ExportSongData {
  id?: string;
}

/** One playlist item as a song to print: the pinned version's own values, the item's transposition. */
export function exportSongFromItem(item: PlaylistExportItem): ExportPlaylistSong {
  const version = item.song_versions;
  const compId = version?.compositions?.id;
  return {
    id: compId || version?.id || undefined,
    title: version?.compositions?.title || '', // empty: the sheet falls back to its translated "untitled song" label
    author: version?.compositions?.original_author || undefined,
    key: version?.key || undefined,
    capo: version?.capo ?? undefined,
    tuning: version?.tuning || undefined,
    beats: version?.beats?.trim() || undefined,
    sources: version?.song_version_sources ?? [],
    transposition: item.transposition_override ?? undefined,
    content: version?.content_chordpro || '',
    url: compId ? `/songs/${compId}` : undefined,
  };
}
