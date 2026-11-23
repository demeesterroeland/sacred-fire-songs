import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import { fetchFavoritesPlaylistId } from '@/lib/playlists/favorites';

export function useFavoritesQuery(userId?: string) {
  const { data: favoriteIds = new Set<string>() } = useQuery({
    queryKey: SONG_KEYS.favorites(userId),
    queryFn: async () => {
      if (!userId) return new Set<string>();
      const supabase = createClient();
      const playlistId = await fetchFavoritesPlaylistId(supabase, userId);
      if (!playlistId) return new Set<string>();
      const { data: items } = await supabase
        .from('playlist_items')
        .select('song_versions(composition_id)')
        .eq('playlist_id', playlistId);
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
