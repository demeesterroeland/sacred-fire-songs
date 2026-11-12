/**
 * The select of the song page's lookup (`fetchSong`), in one place so a unit test can guard it: it must embed
 * `song_version_sources (` exactly once (a second embed fails every song page with PostgREST 42803) and a contract
 * scenario sends this very string to the local API.
 */
import { VERSION_SOURCES_SELECT } from '@/lib/songs/versionSources';

export const SONG_SELECT = `
          title,
          original_author,
          owner_id,
          is_public,
          has_chords,
          has_melody,
          song_versions (
            id,
            version_name,
            version_kind,
            created_at,
            content_chordpro,
            key,
            capo,
            tuning,
            beats,
            youtube_url,
            spotify_url,
            soundcloud_url,
            melody_notation,${VERSION_SOURCES_SELECT}
          ),
          song_category_map (
            categories (
              name,
              slug,
              emoji,
              parent:parent_id(name, slug)
            )
          )
        `;
