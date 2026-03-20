import { useQuery } from '@tanstack/react-query';
import { fetchAllSongs } from '@/lib/songUtils';
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
    queryFn: fetchAllSongs,
    placeholderData: initialSongs,
    staleTime: 60_000,
  });

  const { data: taxonomy = [] } = useQuery({
    queryKey: SONG_KEYS.taxonomy(),
    queryFn: fetchCategoryTree,
    initialData: initialTaxonomy,
    staleTime: 5 * 60_000,
  });

  return { songs, taxonomy, songsLoading };
}
