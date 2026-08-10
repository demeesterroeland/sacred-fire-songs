import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import type { SupabaseClient } from '@supabase/supabase-js';

interface GlobalFilterCounts {
  chordsCount: number | undefined;
  melodyCount: number | undefined;
  favoritesCount: number | undefined;
  mineCount: number | undefined;
}

// ─── Individual count queries ─────────────────────────────────────────────────

async function fetchChordsCount(supabase: SupabaseClient): Promise<number | undefined> {
  const { count } = await supabase
    .from('compositions')
    .select('id', { count: 'exact', head: true })
    .eq('has_chords', true);
  return count ?? undefined;
}

async function fetchMelodyCount(supabase: SupabaseClient): Promise<number | undefined> {
  const { count } = await supabase
    .from('compositions')
    .select('id', { count: 'exact', head: true })
    .eq('has_melody', true);
  return count ?? undefined;
}

async function fetchMySongsCount(supabase: SupabaseClient, userId: string): Promise<number | undefined> {
  const { count } = await supabase
    .from('compositions')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', userId);
  return count ?? undefined;
}

async function fetchFavoritesCount(supabase: SupabaseClient): Promise<number | undefined> {
  const { data: setlist } = await supabase
    .from('setlists')
    .select('id')
    .eq('title', 'My Favorites')
    .maybeSingle();
  if (!setlist?.id) return undefined;

  const { count } = await supabase
    .from('setlist_items')
    .select('id', { count: 'exact', head: true })
    .eq('setlist_id', setlist.id);
  return count ?? undefined;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches all filter badge counts directly from Supabase for use on non-/songs
 * pages where the full song list isn't loaded in memory.
 *
 * Counts are global (not cross-filter-aware like useSongsFilter). That's
 * acceptable here since this modal navigates to /songs where exact cross-filter
 * counts are recomputed from the live song list.
 *
 * Cache: 10-minute staleTime, invalidated on song create/update/delete and
 * favorite toggle via SONG_KEYS.globalFilterCounts().
 */
export function useGlobalFilterCounts(userId?: string): GlobalFilterCounts {
  const { data } = useQuery({
    queryKey: SONG_KEYS.globalFilterCounts(userId),
    queryFn: async (): Promise<GlobalFilterCounts> => {
      const supabase = createClient();

      // Chords and melody counts don't require auth — run always
      // My Songs and Favorites are only fetched when logged in
      const [chordsCount, melodyCount, mineCount, favoritesCount] = await Promise.all([
        fetchChordsCount(supabase),
        fetchMelodyCount(supabase),
        userId ? fetchMySongsCount(supabase, userId) : Promise.resolve(undefined),
        userId ? fetchFavoritesCount(supabase)      : Promise.resolve(undefined),
      ]);

      return { chordsCount, melodyCount, mineCount, favoritesCount };
    },
    staleTime: 10 * 60_000, // 10 min — invalidated on mutations, see SONG_KEYS.globalFilterCounts
  });

  return {
    chordsCount:   data?.chordsCount,
    melodyCount:   data?.melodyCount,
    mineCount:     data?.mineCount,
    favoritesCount: data?.favoritesCount,
  };
}
