import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SONG_KEYS } from '@/lib/songs/queryKeys';

export function useFavoritesQuery(userId?: string) {
  const { data: favoriteIds = new Set<string>() } = useQuery({
    queryKey: SONG_KEYS.favorites(userId),
    queryFn: async () => {
      if (!userId) return new Set<string>();
      const supabase = createClient();
      const { data: setlist } = await supabase
        .from('setlists')
        .select('id')
        .eq('title', 'My Favorites')
        .maybeSingle();
      if (!setlist) return new Set<string>();
      const { data: items } = await supabase
        .from('setlist_items')
        .select('song_versions(composition_id)')
        .eq('setlist_id', setlist.id);
      return new Set<string>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (items ?? []).map((item: any) => item.song_versions?.composition_id).filter(Boolean)
      );
    },
    enabled: !!userId,
    staleTime: 60_000,
  });

  return { favoriteIds };
}
