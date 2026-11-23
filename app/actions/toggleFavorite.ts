'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { uuid, safeParse } from '@/lib/validation/schemas';
import { firstVersion } from '@/lib/songs/versionOrder';
import { fetchFavoritesPlaylistId, FAVORITES_TITLE } from '@/lib/playlists/favorites';

export async function toggleFavorite(
    compositionId: string
): Promise<{ success: true; isFavorite: boolean } | { error: string }> {
    const parsed = safeParse(uuid, compositionId);
    if ('error' in parsed) return { error: 'Invalid composition ID' };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // The default (first) version of the song, in the order of the song page (original, variants, translations;
    // each oldest first: lib/songs/versionOrder.ts, #509), not simply the oldest row.
    const { data: versionRows } = await supabase
        .from('song_versions')
        .select('id, created_at, version_kind')
        .eq('composition_id', parsed.data);

    const version = firstVersion(versionRows);

    if (!version) {
        return { error: 'Song version not found' };
    }

    // Find or create "My Favorites" playlist
    let playlistId = await fetchFavoritesPlaylistId(supabase, user.id);

    if (!playlistId) {
        const { data: newPlaylist, error: createError } = await supabase
            .from('playlists')
            .insert({ owner_id: user.id, title: FAVORITES_TITLE, is_public: false })
            .select('id')
            .single();

        if (createError) return { error: createError.message };
        playlistId = newPlaylist.id;
    }

    // Check if already in favorites
    const { data: existingItem } = await supabase
        .from('playlist_items')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('song_version_id', version.id)
        .maybeSingle();

    if (existingItem) {
        // Remove from favorites
        await supabase
            .from('playlist_items')
            .delete()
            .eq('id', existingItem.id);

        revalidatePath('/songs');
        revalidatePath('/');
        return { success: true, isFavorite: false };
    } else {
        // Get next order index
        const { data: items } = await supabase
            .from('playlist_items')
            .select('order_index')
            .eq('playlist_id', playlistId)
            .order('order_index', { ascending: false })
            .limit(1);

        const nextIndex = (items?.[0]?.order_index ?? -1) + 1;

        await supabase
            .from('playlist_items')
            .insert({
                playlist_id: playlistId,
                song_version_id: version.id,
                order_index: nextIndex,
            });

        revalidatePath('/songs');
        revalidatePath('/');
        return { success: true, isFavorite: true };
    }
}
