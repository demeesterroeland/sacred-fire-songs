'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFavorite(
    compositionId: string
): Promise<{ success: true; isFavorite: boolean } | { error: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Find the default (first) song version for this composition
    const { data: version } = await supabase
        .from('song_versions')
        .select('id')
        .eq('composition_id', compositionId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (!version) {
        return { error: 'Song version not found' };
    }

    // Find or create "My Favorites" setlist
    let { data: setlist } = await supabase
        .from('setlists')
        .select('id')
        .eq('owner_id', user.id)
        .eq('title', 'My Favorites')
        .maybeSingle();

    if (!setlist) {
        const { data: newSetlist, error: createError } = await supabase
            .from('setlists')
            .insert({ owner_id: user.id, title: 'My Favorites', is_public: false })
            .select('id')
            .single();

        if (createError) return { error: createError.message };
        setlist = newSetlist;
    }

    // Check if already in favorites
    const { data: existingItem } = await supabase
        .from('setlist_items')
        .select('id')
        .eq('setlist_id', setlist.id)
        .eq('song_version_id', version.id)
        .maybeSingle();

    if (existingItem) {
        // Remove from favorites
        await supabase
            .from('setlist_items')
            .delete()
            .eq('id', existingItem.id);

        revalidatePath('/songs');
        revalidatePath('/');
        return { success: true, isFavorite: false };
    } else {
        // Get next order index
        const { data: items } = await supabase
            .from('setlist_items')
            .select('order_index')
            .eq('setlist_id', setlist.id)
            .order('order_index', { ascending: false })
            .limit(1);

        const nextIndex = (items?.[0]?.order_index ?? -1) + 1;

        await supabase
            .from('setlist_items')
            .insert({
                setlist_id: setlist.id,
                song_version_id: version.id,
                order_index: nextIndex,
            });

        revalidatePath('/songs');
        revalidatePath('/');
        return { success: true, isFavorite: true };
    }
}
