'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export const SMART_PLAYLISTS = ['My Favorites', 'My Songs', 'My Drafts'] as const;

export function isSmartPlaylist(title: string): boolean {
    return (SMART_PLAYLISTS as readonly string[]).includes(title);
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createPlaylist(
    title: string
): Promise<{ id: string } | { error: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const trimmed = title.trim();
    if (!trimmed) return { error: 'Title required' };

    const { data, error } = await supabase
        .from('setlists')
        .insert({ owner_id: user.id, title: trimmed, is_public: false })
        .select('id')
        .single();

    if (error) return { error: error.message };
    revalidatePath('/library/playlists');
    return { id: data.id };
}

// ─── Rename ───────────────────────────────────────────────────────────────────

export async function renamePlaylist(
    id: string,
    title: string
): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('title, owner_id')
        .eq('id', id)
        .maybeSingle();

    if (!playlist) return { error: 'Playlist not found' };
    if (playlist.owner_id !== user.id) return { error: 'Not your playlist' };
    if (isSmartPlaylist(playlist.title)) return { error: 'Cannot rename smart playlists' };

    const trimmed = title.trim();
    if (!trimmed) return { error: 'Title required' };

    const { error } = await supabase
        .from('setlists')
        .update({ title: trimmed })
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/library/playlists');
    revalidatePath(`/library/playlists/${id}`);
    return {};
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deletePlaylist(
    id: string
): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('title, owner_id')
        .eq('id', id)
        .maybeSingle();

    if (!playlist) return { error: 'Playlist not found' };
    if (playlist.owner_id !== user.id) return { error: 'Not your playlist' };
    if (isSmartPlaylist(playlist.title)) return { error: 'Cannot delete smart playlists' };

    const { error } = await supabase
        .from('setlists')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/library/playlists');
    return {};
}

// ─── Add song ─────────────────────────────────────────────────────────────────

export async function addSongToPlaylist(
    playlistId: string,
    compositionId: string
): Promise<{ added: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { added: false, error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('owner_id')
        .eq('id', playlistId)
        .maybeSingle();

    if (!playlist || playlist.owner_id !== user.id) return { added: false, error: 'Not your playlist' };

    // Get first song version for this composition
    const { data: version } = await supabase
        .from('song_versions')
        .select('id')
        .eq('composition_id', compositionId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (!version) return { added: false, error: 'Song version not found' };

    // Check if already in playlist — toggle out if so
    const { data: existing } = await supabase
        .from('setlist_items')
        .select('id')
        .eq('setlist_id', playlistId)
        .eq('song_version_id', version.id)
        .maybeSingle();

    if (existing) {
        await supabase.from('setlist_items').delete().eq('id', existing.id);
        return { added: false };
    }

    // Get next order_index
    const { data: last } = await supabase
        .from('setlist_items')
        .select('order_index')
        .eq('setlist_id', playlistId)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextIndex = (last?.order_index ?? -1) + 1;

    const { error } = await supabase
        .from('setlist_items')
        .insert({ setlist_id: playlistId, song_version_id: version.id, order_index: nextIndex });

    if (error) return { added: false, error: error.message };
    return { added: true };
}

// ─── Remove song ──────────────────────────────────────────────────────────────

export async function removeSongFromPlaylist(
    itemId: string
): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: item } = await supabase
        .from('setlist_items')
        .select('id, setlists(owner_id)')
        .eq('id', itemId)
        .maybeSingle();

    if (!item) return { error: 'Item not found' };
    if ((item.setlists as any)?.owner_id !== user.id) return { error: 'Not your playlist' };

    const { error } = await supabase.from('setlist_items').delete().eq('id', itemId);
    if (error) return { error: error.message };
    return {};
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

export async function reorderPlaylistSongs(
    playlistId: string,
    orderedItemIds: string[]
): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('owner_id')
        .eq('id', playlistId)
        .maybeSingle();

    if (!playlist || playlist.owner_id !== user.id) return { error: 'Not your playlist' };

    await Promise.all(
        orderedItemIds.map((id, index) =>
            supabase.from('setlist_items').update({ order_index: index }).eq('id', id)
        )
    );

    return {};
}
