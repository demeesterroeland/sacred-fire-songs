/**
 * Sacred Fire Songs - Artist & Multi-Author Utilities
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a URL-friendly slug from an artist name.
 */
export function slugifyArtist(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parses an author string (e.g. "Herbert Quinteros, Cari El" or "Herbert Quinteros / Cari El")
 * into a clean array of individual artist names.
 */
export function parseArtists(authorStr?: string | null): string[] {
  if (!authorStr || !authorStr.trim()) {
    return [];
  }

  // Split on commas, slashes, or ' & ' / ' and '
  const rawList = authorStr.split(/[,/]|(?:\s+&(?:amp;)?\s+)|(?:\s+and\s+)/i);
  const result: string[] = [];
  const seen = new Set<string>();

  for (const raw of rawList) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const lowerKey = trimmed.toLowerCase();
    if (!seen.has(lowerKey)) {
      seen.add(lowerKey);
      result.push(trimmed);
    }
  }

  return result;
}

/**
 * Formats an array of artist names into a canonical comma-separated string for persistence.
 */
export function formatArtists(artists: string[]): string {
  if (!artists || artists.length === 0) {
    return '';
  }
  const clean = artists.map((a) => a.trim()).filter(Boolean);
  return Array.from(new Set(clean)).join(', ');
}

/**
 * Sorts tag/artist suggestions:
 * 1. Primary sort: song_count descending (most popular first)
 * 2. Secondary sort: Alphabetical ascending by name
 */
export function sortTagSuggestions<T extends { song_count?: number; name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const countA = a.song_count ?? 0;
    const countB = b.song_count ?? 0;
    if (countB !== countA) {
      return countB - countA;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

/**
 * Ensures the parent 'Artists' category exists in Supabase and creates subcategories
 * for the specified artist names if they don't already exist.
 * Returns the array of category IDs for the artists.
 */
export async function ensureArtistCategoryIds(
  supabase: SupabaseClient,
  artistNames: string[]
): Promise<string[]> {
  if (!artistNames || artistNames.length === 0) return [];

  // 1. Ensure top-level 'Artists' category exists
  let parentId: string | null = null;
  const { data: parentCat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'artists')
    .maybeSingle();

  if (parentCat) {
    parentId = parentCat.id;
  } else {
    const { data: newParent, error: createParentErr } = await supabase
      .from('categories')
      .insert({
        name: 'Artists',
        slug: 'artists',
        emoji: '👤',
        parent_id: null,
      })
      .select('id')
      .single();

    if (!createParentErr && newParent) {
      parentId = newParent.id;
    }
  }

  if (!parentId) return [];

  const categoryIds: string[] = [];

  // 2. Process each artist
  for (const name of artistNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const slug = slugifyArtist(trimmed);

    const { data: existingSub } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', parentId)
      .ilike('name', trimmed)
      .maybeSingle();

    if (existingSub) {
      categoryIds.push(existingSub.id);
    } else {
      const { data: newSub, error: createSubErr } = await supabase
        .from('categories')
        .insert({
          name: trimmed,
          slug: `artist-${slug || Date.now()}`,
          emoji: '👤',
          parent_id: parentId,
        })
        .select('id')
        .single();

      if (!createSubErr && newSub) {
        categoryIds.push(newSub.id);
      }
    }
  }

  return categoryIds;
}
