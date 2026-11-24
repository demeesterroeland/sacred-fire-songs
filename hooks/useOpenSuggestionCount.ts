'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOpenSuggestionCount, openSuggestionCountKey } from '@/lib/suggestions/queries';

const POLL_MS = 60_000;

/** The reviewer's badge: open link suggestions waiting (0 for everyone else). */
export function useOpenSuggestionCount(userId: string, enabled = true) {
  return useQuery({
    queryKey: openSuggestionCountKey(userId),
    queryFn: fetchOpenSuggestionCount,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    enabled,
  });
}
