import type { SupabaseClient } from '@supabase/supabase-js';
import type { Song } from '../songUtils';
import { firstVersion } from './versionOrder';

/**
 * Shared select string for composition queries.
 * Used by both server and client fetchers — single source of truth.
 */
export const SONGS_SELECT = `
  *,
  song_versions(id, created_at, key, content_chordpro, melody_notation),
  song_category_map(
    categories(
      name,
      slug,
      emoji,
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
  opts?: { limit?: number; cursor?: string; songIds?: string[] }
) {
  let q = client
    .from('compositions')
    .select(SONGS_SELECT)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });

  if (opts?.songIds?.length) {
    q = q.in('id', opts.songIds);
  }
  if (opts?.cursor) {
    const [cursorDate, cursorId] = opts.cursor.split('::');
    q = q.or(`created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursorId})`);
  }
  if (opts?.limit) q = q.limit(opts.limit);
  return q;
}

/** Size of the "Recently added" row on Home (Story 6.1.28 / G6.3, #412). */
export const RECENTLY_ADDED_LIMIT = 10;
/** Below `md` (one column) Home shows only the first rows, so the categories stay close (Story 6.1.36, #488). */
export const RECENTLY_ADDED_PHONE_LIMIT = 5;

/**
 * Only what a compact song row shows (title, author, public badge, key, "Author · Category · Language"):
 * no chordpro bodies, no melody notation, no other composition columns.
 */
export const RECENTLY_ADDED_SELECT = `
  id, title, original_author, is_public, created_at,
  song_versions(key),
  song_category_map(
    categories(
      name,
      slug,
      parent:parent_id(name, slug)
    )
  )
`;

/**
 * The newest public compositions. The `is_public` filter is explicit on top of RLS: a signed-in
 * owner's drafts must not show up in a row that is the same for every visitor.
 */
export function recentlyAddedQuery(client: SupabaseClient, limit = RECENTLY_ADDED_LIMIT) {
  return client
    .from('compositions')
    .select(RECENTLY_ADDED_SELECT)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit);
}

/**
 * Maps a raw Supabase composition row (with joins) to a Song object.
 * Single source of truth for field mapping — used by server and client.
 */
interface SongVersionRow {
  id?: string;
  created_at?: string | null;
  key: string | null;
  content_chordpro: string | null;
  melody_notation: string | null;
}

interface CategoryRow {
  name: string;
  slug: string;
  emoji?: string | null;
  parent: {
    name: string | null;
    slug: string | null;
  } | null;
}

interface SongCategoryMapRow {
  categories: CategoryRow;
}

export interface CompositionRow {
  id: string;
  title: string;
  original_author: string | null;
  is_public: boolean;
  created_at: string;
  // Not part of the narrow RECENTLY_ADDED_SELECT, hence optional.
  owner_id?: string | null;
  updated_at?: string;
  content_chordpro?: string | null;
  has_chords?: boolean | null;
  has_melody?: boolean | null;
  song_versions: SongVersionRow[] | null;
  song_category_map: SongCategoryMapRow[] | null;
}

export function mapCompositionToSong(
  item: CompositionRow,
  favoriteIds?: Set<string>
): Song {
  // UXA-049: the card shows the first (oldest) version, the same one the song page opens on.
  const version = firstVersion(item.song_versions);

  const rawCategories = item.song_category_map || [];
  const categories = rawCategories.map((mapItem: SongCategoryMapRow) => {
    const cat = mapItem.categories;
    return {
      name: cat.name,
      slug: cat.slug,
      emoji: cat.emoji || undefined,
      parent: cat.parent?.name || null,
      parentSlug: cat.parent?.slug || null,
    };
  });

  return {
    id: item.id,
    title: item.title,
    author: item.original_author || '',
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
