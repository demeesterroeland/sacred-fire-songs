import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SONG_KEYS } from '@/lib/songs/queryKeys';

interface GlobalFilterCounts {
  chordsCount: number | undefined;
  melodyCount: number | undefined;
  favoritesCount: number | undefined;
  mineCount: number | undefined;
}

/**
 * Fetches filter counts directly from Supabase for use on non-/songs pages
 * where the full song list isn't loaded.  Uses lightweight COUNT queries.
 *
 * Note: counts are global (not cross-filter-aware like useSongsFilter).
 * That's acceptable here since the modal navigates to /songs where exact
 * cross-filter counts are recomputed from the live song list.
 */
export function useGlobalFilterCounts(userId?: string): GlobalFilterCounts {
  const { data } = useQuery({
    queryKey: SONG_KEYS.globalFilterCounts(userId),
    queryFn: async (): Promise<GlobalFilterCounts> => {
      const supabase = createClient();

      // Run all queries in parallel
      const [chordsResult, melodyResult, mineResult, favSetlistResult] = await Promise.all([
        // Chords count — RLS filters to songs visible to this user
        supabase
          .from('compositions')
          .select('id', { count: 'exact', head: true })
          .eq('has_chords', true),

        // Melody count — RLS filters to songs visible to this user
        supabase
          .from('compositions')
          .select('id', { count: 'exact', head: true })
          .eq('has_melody', true),

        // Mine count — only makes sense when logged in
        userId
          ? supabase
              .from('compositions')
              .select('id', { count: 'exact', head: true })
              .eq('owner_id', userId)
          : Promise.resolve({ count: null, error: null }),

        // Favorites — fetch setlist ID first
        userId
          ? supabase
              .from('setlists')
              .select('id')
              .eq('title', 'My Favorites')
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      // Favorites count: if we got a setlist, count its items
      let favoritesCount: number | undefined = undefined;
      if (userId && favSetlistResult && 'data' in favSetlistResult && favSetlistResult.data?.id) {
        const { count } = await supabase
          .from('setlist_items')
          .select('id', { count: 'exact', head: true })
          .eq('setlist_id', favSetlistResult.data.id);
        favoritesCount = count ?? undefined;
      }

      return {
        chordsCount: chordsResult.count ?? undefined,
        melodyCount: melodyResult.count ?? undefined,
        mineCount: userId ? (mineResult.count ?? undefined) : undefined,
        favoritesCount,
      };
    },
    enabled: true, // always fetch — chords/melody counts don't need auth
    staleTime: 10 * 60_000, // 10 min — invalidated on song create/update/delete and favorite toggle
  });

  return {
    chordsCount: data?.chordsCount,
    melodyCount: data?.melodyCount,
    favoritesCount: data?.favoritesCount,
    mineCount: data?.mineCount,
  };
}
