/**
 * The select of the song page's lookup (`fetchSong`), in one place so a unit test can guard it: it must embed
 * `song_version_sources (` exactly once (a second embed fails every song page with PostgREST 42803) and a contract
 * scenario sends this very string to the local API.
 */
import { VERSION_SOURCES_SELECT } from '@/lib/songs/versionSources';

export const SONG_SELECT = `
          title,
          original_author,
          authors,
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
            melody_notation,
            song_note,${VERSION_SOURCES_SELECT}
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

/**
 * The select of the edit page (`app/songs/[id]/edit/page.tsx`): one song with every version, the sources of each
 * version for its label in the version switch (#509), from the same `VERSION_SOURCES_SELECT`, so it embeds
 * `song_version_sources (` once too.
 */
export const EDIT_SONG_SELECT = `
          id,
          title,
          original_author,
          authors,
          owner_id,
          is_public,
          song_category_map (
            category_id
          ),
          song_versions!inner (
            id,
            created_at,
            version_name,
            version_kind,
            content_chordpro,
            key,
            capo,
            tuning,
            youtube_url,
            spotify_url,
            soundcloud_url,
            melody_notation,${VERSION_SOURCES_SELECT}
          )
        `;
