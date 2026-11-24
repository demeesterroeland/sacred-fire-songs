/**
 * Browser-side query for the reviewer's badge (Story 6.2.26 / G1.5, #598): how many open link suggestions wait.
 * The database answers 0 for everyone who is not a gatekeeper or admin.
 */
import { createClient } from '@/lib/supabase/client';

export async function fetchOpenSuggestionCount(): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('fn_open_song_link_suggestion_count');
  if (error) throw error;
  return typeof data === 'number' && data > 0 ? data : 0;
}

export function openSuggestionCountKey(userId: string): readonly ['link-suggestion-count', string] {
  return ['link-suggestion-count', userId];
}
