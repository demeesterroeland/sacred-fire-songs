import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchSongsPage } from '@/lib/songUtils';
import { fetchCategoryTree, type TaxonomyNode } from '@/lib/taxonomyUtils';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import type { Song } from '@/lib/songUtils';
import { useMemo } from 'react';

interface UseSongsQueryOptions {
  initialSongs: Song[];
  initialNextCursor: string | null;
  initialTaxonomy: TaxonomyNode[];
}

export function useSongsQuery({ initialSongs, initialNextCursor, initialTaxonomy }: UseSongsQueryOptions) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: songsLoading,
  } = useInfiniteQuery({
    queryKey: SONG_KEYS.list(),
    queryFn: ({ pageParam }) => fetchSongsPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: {
      pages: [{ songs: initialSongs, nextCursor: initialNextCursor }],
      pageParams: [undefined],
    },
    staleTime: 60_000,
  });

  const songs = useMemo(
    () => data?.pages.flatMap(p => p.songs) ?? [],
    [data]
  );

  const { data: taxonomy = [] } = useQuery({
    queryKey: SONG_KEYS.taxonomy(),
    queryFn: fetchCategoryTree,
    initialData: initialTaxonomy,
    staleTime: 5 * 60_000,
  });

  return { songs, taxonomy, fetchNextPage, hasNextPage, isFetchingNextPage, songsLoading };
}
