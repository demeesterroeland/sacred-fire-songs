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
    .order('created_at', { ascending: false });

  if (opts?.cursor) q = q.lt('created_at', opts.cursor);
  if (opts?.limit) q = q.limit(opts.limit);
  return q;
}

/**
 * Maps a raw Supabase composition row (with joins) to a Song object.
 * Single source of truth for field mapping — used by server and client.
 */
export function mapCompositionToSong(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any,
  favoriteIds?: Set<string>
): Song {
  const version = (item.song_versions as any[])?.[0];

  const rawCategories = (item.song_category_map as any[]) || [];
  const categories = rawCategories.map((mapItem: any) => {
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
