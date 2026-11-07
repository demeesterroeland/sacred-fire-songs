// Client-side reads for the Add to playlist sheet (Story 6.1.30 / G8.1, #414).
import { createClient } from '@/lib/supabase/client';

export interface PickerPlaylist {
    id: string;
    title: string;
}

/** Playlists the user may add songs to: their own, plus public ones for admins and gatekeepers. */
export async function fetchUserPlaylists(userId: string): Promise<PickerPlaylist[]> {
    const supabase = createClient();

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

    const isCurator = profile?.role === 'admin' || profile?.role === 'gatekeeper';

    let query = supabase
        .from('setlists')
        .select('id, title, is_public, owner_id');

    if (isCurator) {
        query = query.or(`owner_id.eq.${userId},is_public.eq.true`);
    } else {
        query = query.eq('owner_id', userId);
    }

    const { data } = await query
        .not('title', 'in', '("My Favorites","My Songs","My Drafts")')
        .order('created_at', { ascending: false });

    return data ?? [];
}

/** Ids of the playlists that already contain the song. */
export async function fetchContainingPlaylists(compositionId: string): Promise<Set<string>> {
    const supabase = createClient();
    const { data } = await supabase
        .from('setlist_items')
        .select('setlist_id, song_versions!inner(composition_id)')
        .eq('song_versions.composition_id', compositionId);
    return new Set((data ?? []).map(d => d.setlist_id));
}
