import type { SupabaseClient } from '@supabase/supabase-js';
import type { Song } from '../songUtils';

/**
 * Shared select string for composition queries.
 * Used by both server and client fetchers — single source of truth.
 */
export const SONGS_SELECT = `
  *,
  song_versions(key, content_chordpro, melody_notation),
  song_category_map(
    categories(
      name,
      slug,
      parent:parent_id(name, slug)
    )
  )
`;

/**
 * Builds a Supabase query for compositions with all joins.
 * Works with both server and browser Supabase clients.
 */
export function songsQuery(
  client: SupabaseClient,
  opts?: { limit?: number; cursor?: string }
) {
  let q = client
    .from('compositions')
    .select(SONGS_SELECT)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });

  if (opts?.cursor) {
    const [cursorDate, cursorId] = opts.cursor.split('::');
    q = q.or(`created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursorId})`);
  }
  if (opts?.limit) q = q.limit(opts.limit);
  return q;
}

/**
 * Maps a raw Supabase composition row (with joins) to a Song object.
 * Single source of truth for field mapping — used by server and client.
 */
interface SongVersionRow {
  key: string | null;
  content_chordpro: string | null;
  melody_notation: string | null;
}

interface CategoryRow {
  name: string;
  slug: string;
  parent: {
    name: string | null;
    slug: string | null;
  } | null;
}

interface SongCategoryMapRow {
  categories: CategoryRow;
}

interface CompositionRow {
  id: string;
  title: string;
  original_author: string | null;
  owner_id: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  content_chordpro: string | null;
  has_chords: boolean | null;
  has_melody: boolean | null;
  song_versions: SongVersionRow[] | null;
  song_category_map: SongCategoryMapRow[] | null;
}

export function mapCompositionToSong(
  item: CompositionRow,
  favoriteIds?: Set<string>
): Song {
  const version = item.song_versions?.[0];

  const rawCategories = item.song_category_map || [];
  const categories = rawCategories.map((mapItem: SongCategoryMapRow) => {
    const cat = mapItem.categories;
    return {
      name: cat.name,
      slug: cat.slug,
      parent: cat.parent?.name || null,
      parentSlug: cat.parent?.slug || null,
    };
  });

  return {
    id: item.id,
    title: item.title,
    author: item.original_author || 'Unknown',
    songKey: version?.key || null,
    content: version?.content_chordpro || '',
    melodyNotation: version?.melody_notation || '',
    ownerId: item.owner_id ?? undefined,
    isPublic: item.is_public ?? true,
    hasChords: item.has_chords ?? false,
    hasMelody: item.has_melody ?? false,
    createdAt: item.created_at,
    color: 'red',
    categories,
    isFavorite: favoriteIds?.has(item.id) ?? false,
  } as Song;
}
