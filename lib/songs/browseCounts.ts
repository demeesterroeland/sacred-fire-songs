/**
 * Client-side RPC helper for `GlobalSearchModal` songbook and language counts (Story 6.2.25, #570).
 *
 * Calls the read-only `SECURITY INVOKER` SQL function `fn_search_filter_counts()` so caller RLS decides
 * which songs count without downloading the entire song list on non-`/songs` pages.
 */
import { createClient } from '@/lib/supabase/client';
import type { SearchFilterCountRow } from '@/lib/songs/browseFilters';

export interface SearchFilterCountsClient {
  rpc: (
    fn: string
  ) => PromiseLike<{ data: SearchFilterCountRow[] | null; error: { message: string } | null }>;
}

/**
 * Fetch songbook and language counts visible to the current viewer.
 * Logs and returns `[]` on RPC failure so the modal degrades gracefully without selects.
 */
export async function fetchBrowseFilterCounts(
  client?: SearchFilterCountsClient
): Promise<SearchFilterCountRow[]> {
  const supabase = client ?? (createClient() as unknown as SearchFilterCountsClient);
  const { data, error } = await supabase.rpc('fn_search_filter_counts');
  if (error) {
    console.error('Failed to load browse filter counts:', error.message);
    return [];
  }
  return data ?? [];
}
