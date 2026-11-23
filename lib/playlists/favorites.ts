import type { SupabaseClient } from '@supabase/supabase-js';

/** Title of the smart playlist that holds a member's favourites (one per member). */
export const FAVORITES_TITLE = 'My Favorites';

/**
 * The id of the signed-in user's own "My Favorites" setlist, or null.
 *
 * Always filter on the owner: an admin or curator can read every member's setlists, so a title-only lookup sees several
 * rows, `.maybeSingle()` answers with an error and no data, and the hearts, the list and the counts come back empty.
 * Ordered and limited, so a stray duplicate of the user's own cannot cause the same error.
 */
export async function fetchFavoritesSetlistId(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('setlists')
    .select('id')
    .eq('owner_id', userId)
    .eq('title', FAVORITES_TITLE)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}
