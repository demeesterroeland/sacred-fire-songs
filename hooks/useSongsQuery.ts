import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '@/lib/songUtils';
import { fetchCategoryTree, type TaxonomyNode } from '@/lib/taxonomyUtils';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import type { Song } from '@/lib/songUtils';

interface UseSongsQueryOptions {
  initialSongs: Song[];
  initialTaxonomy: TaxonomyNode[];
}

export function useSongsQuery({ initialSongs, initialTaxonomy }: UseSongsQueryOptions) {
  const { data: songs = [], isLoading: songsLoading } = useQuery({
    queryKey: SONG_KEYS.list(),
    queryFn: () => fetchSongs(),
    initialData: initialSongs,
    staleTime: 60_000, // 1 min for lists
  });

  const { data: taxonomy = [] } = useQuery({
    queryKey: SONG_KEYS.taxonomy(),
    queryFn: fetchCategoryTree,
    initialData: initialTaxonomy,
    staleTime: 5 * 60_000, // 5 min for taxonomy (rarely changes)
  });

  return { songs, taxonomy, songsLoading };
}
