import type { SupabaseClient } from '@supabase/supabase-js';
import type { Song } from '../songUtils';
import { firstVersion } from './versionOrder';
import { foldForSearch } from './search';
import { normalizeWhitespace } from '../utils';
import { songbooksOfVersions } from './browseFilters';
import type { SourceBook } from './versionSources';

/**
 * Shared select string for composition queries.
 * Used by both server and client fetchers — single source of truth.
 */
export const SONGS_SELECT = `
  *,
  song_versions(id, created_at, version_kind, key, content_chordpro, melody_notation, song_version_sources(original_title, songbooks(id, title, short_name))),
  song_translations(language, title),
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

/**
 * Rows per request when the whole list is fetched. PostgREST silently stops at `max_rows` (1000, supabase/config.toml)
 * without an error, so one unbounded request would quietly drop every song after the 1000th from the search.
 */
export const SONGS_FETCH_PAGE_SIZE = 1000;

/**
 * Every composition the visitor may read, fetched in keyset pages (the `cursor` of `songsQuery`: `created_at`, `id`,
 * newest first; `id` is unique, so the order is total). Paging continues until an empty page, not until a short one:
 * a server whose `max_rows` is below the page size answers with short pages that are not the end. A song added
 * during the fetch sorts before the cursor and is simply not part of this list; a song deleted during the fetch moves
 * no other row, so no row is skipped or repeated (rows are still de-duplicated by `id` as a guard). The one fetch
 * behind every full-list consumer (server render and client refresh), so the search always sees the whole catalog.
 * An error on any page is returned as the error; a partial list is never returned.
 */
export async function fetchAllSongRows(
  client: SupabaseClient,
  pageSize: number = SONGS_FETCH_PAGE_SIZE
): Promise<{ data: CompositionRow[]; error: { message: string } | null }> {
  const rows: CompositionRow[] = [];
  const seen = new Set<string>();
  let cursor: string | undefined;
  for (;;) {
    const { data, error } = await songsQuery(client, { cursor, limit: pageSize });
    if (error) return { data: [], error };
    const page = (data ?? []) as unknown as CompositionRow[];
    if (page.length === 0) break;
    for (const row of page) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      rows.push(row);
    }
    const last = page[page.length - 1];
    cursor = `${last.created_at}::${last.id}`;
  }
  return { data: rows, error: null };
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
  version_kind?: string | null;
  key: string | null;
  content_chordpro: string | null;
  melody_notation: string | null;
  /** Where the version was printed: the title it has there (search, #521) and the book (songbook filter, #522). */
  song_version_sources?: {
    original_title?: string | null;
    songbooks?: Partial<SourceBook> | Partial<SourceBook>[] | null;
  }[] | null;
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
  /** Every credit (`compositions.authors`); selected by `SONGS_SELECT` (`*`). */
  authors?: string[] | null;
  /** Other titles of the song (`compositions.aliases`); selected by `SONGS_SELECT` (`*`). */
  aliases?: string[] | null;
  is_public: boolean;
  created_at: string;
  // Not part of the narrow RECENTLY_ADDED_SELECT, hence optional.
  owner_id?: string | null;
  updated_at?: string;
  content_chordpro?: string | null;
  has_chords?: boolean | null;
  has_melody?: boolean | null;
  song_versions: SongVersionRow[] | null;
  /** The translations of the song: only the language and the title are selected, for the search (#547). */
  song_translations?: { language: string; title?: string | null }[] | null;
  song_category_map: SongCategoryMapRow[] | null;
}

/** Trimmed, non-empty values without duplicates (case and accent insensitive, first spelling kept). */
function distinctTexts(values: ReadonlyArray<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const text = normalizeWhitespace(raw ?? '');
    const key = foldForSearch(text);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

export function mapCompositionToSong(
  item: CompositionRow,
  favoriteIds?: Set<string>
): Song {
  // UXA-049: the card shows the first version (original first, #509), the same one the song page opens on.
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
    authors: item.authors ?? [],
    aliases: distinctTexts(item.aliases ?? []),
    // The title each songbook printed it under, over every version (the card shows only the first one).
    sourceTitles: distinctTexts(
      (item.song_versions ?? []).flatMap((v) => (v.song_version_sources ?? []).map((src) => src.original_title))
    ),
    songbooks: songbooksOfVersions(item.song_versions),
    // Every titled translation is searchable, also one without lyrics yet: its title still names the song (#547).
    translationTitles: (item.song_translations ?? []).flatMap((tr) => {
      const title = normalizeWhitespace(tr.title ?? '');
      return title ? [{ language: tr.language, title }] : [];
    }),
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
