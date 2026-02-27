'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createSetlist(title: string, description?: string): Promise<{ success: true; id: string } | { error: string }> {
    if (!title) {
        return { error: 'Title is required' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
        .from('setlists')
        .insert({
            owner_id: user.id,
            title,
            description,
            is_public: false, // Default to private
        })
        .select('id')
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/library/playlists');
    return { success: true, id: data.id };
}

export async function getSetlists(): Promise<{ success: true; setlists: any[] } | { error: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
        .from('setlists')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return { error: error.message };
    }

    return { success: true, setlists: data };
}

export async function getSetlistDetail(id: string): Promise<{ success: true; setlist: any } | { error: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
        .from('setlists')
        .select(`
            *,
            items:setlist_items(
                *,
                song_version:song_versions(
                    *,
                    composition:compositions(title)
                )
            )
        `)
        .eq('id', id)
        .eq('owner_id', user.id)
        .single();

    if (error) {
        return { error: error.message };
    }

    // Sort items by order_index manually
    if (data.items) {
        data.items.sort((a: any, b: any) => a.order_index - b.order_index);
    }

    return { success: true, setlist: data };
}

export async function addSongToSetlist(setlistId: string, songVersionId: string): Promise<{ success: true } | { error: string }> {
    if (!setlistId || !songVersionId) {
        return { error: 'setlistId and songVersionId are required' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify ownership
    const { data: setlist } = await supabase
        .from('setlists')
        .select('id')
        .eq('id', setlistId)
        .eq('owner_id', user.id)
        .maybeSingle();

    if (!setlist) {
        return { error: 'Setlist not found or access denied' };
    }

    // Get next order index
    const { data: items } = await supabase
        .from('setlist_items')
        .select('order_index')
        .eq('setlist_id', setlistId)
        .order('order_index', { ascending: false })
        .limit(1);

    const nextIndex = (items?.[0]?.order_index ?? -1) + 1;

    const { error } = await supabase
        .from('setlist_items')
        .insert({
            setlist_id: setlistId,
            song_version_id: songVersionId,
            order_index: nextIndex,
        });

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/library/playlists/${setlistId}`);
    return { success: true };
}

export async function removeSongFromSetlist(setlistItemId: string): Promise<{ success: true } | { error: string }> {
    if (!setlistItemId) {
        return { error: 'setlistItemId is required' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify ownership via join
    const { data: item } = await supabase
        .from('setlist_items')
        .select('id, setlist_id, setlists!inner(owner_id)')
        .eq('id', setlistItemId)
        .eq('setlists.owner_id', user.id)
        .maybeSingle();

    if (!item) {
        return { error: 'Setlist item not found or access denied' };
    }

    const { error } = await supabase
        .from('setlist_items')
        .delete()
        .eq('id', setlistItemId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/library/playlists/${item.setlist_id}`);
    return { success: true };
}

export async function updateSetlistItemOrder(setlistId: string, items: { id: string; order_index: number }[]): Promise<{ success: true } | { error: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Verify setlist ownership
    const { data: setlist } = await supabase
        .from('setlists')
        .select('id')
        .eq('id', setlistId)
        .eq('owner_id', user.id)
        .maybeSingle();

    if (!setlist) {
        return { error: 'Setlist not found or access denied' };
    }

    // Perform batch update (sequential for simplicity in server actions, or use a RPC if many items)
    for (const item of items) {
        const { error } = await supabase
            .from('setlist_items')
            .update({ order_index: item.order_index })
            .eq('id', item.id)
            .eq('setlist_id', setlistId);
        
        if (error) return { error: error.message };
    }

    revalidatePath(`/library/playlists/${setlistId}`);
    return { success: true };
}
