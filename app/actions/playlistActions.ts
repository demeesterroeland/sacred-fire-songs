'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { isSmartPlaylist } from '@/lib/playlists/smartPlaylists';
import { uuid, playlistTitle, playlistDescription, safeParse } from '@/lib/validation/schemas';
import { z } from 'zod';

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createPlaylist(
    title: string
): Promise<{ id: string } | { error: string }> {
    const parsed = safeParse(playlistTitle, title);
    if ('error' in parsed) return { error: parsed.error };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
        .from('setlists')
        .insert({ owner_id: user.id, title: parsed.data, is_public: false })
        .select('id')
        .maybeSingle();

    if (error) return { error: error.message };
    if (!data) return { error: 'Insert returned no data' };
    revalidatePath('/library/playlists');
    return { id: data.id };
}

// ─── Rename ───────────────────────────────────────────────────────────────────

export async function renamePlaylist(
    id: string,
    title: string
): Promise<{ error?: string }> {
    const idParsed = safeParse(uuid, id);
    if ('error' in idParsed) return { error: 'Invalid playlist ID' };

    const titleParsed = safeParse(playlistTitle, title);
    if ('error' in titleParsed) return { error: titleParsed.error };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('title, owner_id')
        .eq('id', idParsed.data)
        .maybeSingle();

    if (!playlist) return { error: 'Playlist not found' };
    if (playlist.owner_id !== user.id) return { error: 'Not your playlist' };
    if (isSmartPlaylist(playlist.title)) return { error: 'Cannot rename smart playlists' };

    const { error } = await supabase
        .from('setlists')
        .update({ title: titleParsed.data })
        .eq('id', idParsed.data);

    if (error) return { error: error.message };
    revalidatePath('/library/playlists');
    revalidatePath(`/library/playlists/${id}`);
    return {};
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deletePlaylist(
    id: string
): Promise<{ error?: string }> {
    const parsed = safeParse(uuid, id);
    if ('error' in parsed) return { error: 'Invalid playlist ID' };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('title, owner_id')
        .eq('id', parsed.data)
        .maybeSingle();

    if (!playlist) return { error: 'Playlist not found' };
    if (playlist.owner_id !== user.id) return { error: 'Not your playlist' };
    if (isSmartPlaylist(playlist.title)) return { error: 'Cannot delete smart playlists' };

    const { error } = await supabase
        .from('setlists')
        .delete()
        .eq('id', parsed.data);

    if (error) return { error: error.message };
    revalidatePath('/library/playlists');
    return {};
}

// ─── Visibility ───────────────────────────────────────────────────────────────

export async function togglePlaylistVisibility(
    id: string,
    isPublic: boolean
): Promise<{ error?: string }> {
    const idParsed = safeParse(uuid, id);
    if ('error' in idParsed) return { error: 'Invalid playlist ID' };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('owner_id, title')
        .eq('id', idParsed.data)
        .maybeSingle();

    if (!playlist || playlist.owner_id !== user.id) return { error: 'Not your playlist' };
    if (isSmartPlaylist(playlist.title)) return { error: 'Cannot modify smart playlists' };

    const { error } = await supabase
        .from('setlists')
        .update({ is_public: isPublic })
        .eq('id', idParsed.data);

    if (error) return { error: error.message };
    revalidatePath('/library/playlists');
    revalidatePath(`/library/playlists/${id}`);
    return {};
}

// ─── Description ──────────────────────────────────────────────────────────────

export async function updatePlaylistDescription(
    id: string,
    description: string
): Promise<{ error?: string }> {
    const idParsed = safeParse(uuid, id);
    if ('error' in idParsed) return { error: 'Invalid playlist ID' };

    const descParsed = safeParse(playlistDescription, description);
    if ('error' in descParsed) return { error: descParsed.error };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('owner_id, title')
        .eq('id', idParsed.data)
        .maybeSingle();

    if (!playlist || playlist.owner_id !== user.id) return { error: 'Not your playlist' };
    if (isSmartPlaylist(playlist.title)) return { error: 'Cannot modify smart playlists' };

    const { error } = await supabase
        .from('setlists')
        .update({ description: descParsed.data?.trim() || null })
        .eq('id', idParsed.data);

    if (error) return { error: error.message };
    revalidatePath(`/library/playlists/${id}`);
    return {};
}

// ─── Add song ─────────────────────────────────────────────────────────────────

export async function addSongToPlaylist(
    playlistId: string,
    compositionId: string
): Promise<{ added: boolean; error?: string }> {
    const playlistParsed = safeParse(uuid, playlistId);
    if ('error' in playlistParsed) return { added: false, error: 'Invalid playlist ID' };

    const compositionParsed = safeParse(uuid, compositionId);
    if ('error' in compositionParsed) return { added: false, error: 'Invalid composition ID' };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { added: false, error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('owner_id')
        .eq('id', playlistParsed.data)
        .maybeSingle();

    if (!playlist || playlist.owner_id !== user.id) return { added: false, error: 'Not your playlist' };

    // Get first song version for this composition
    const { data: version } = await supabase
        .from('song_versions')
        .select('id')
        .eq('composition_id', compositionParsed.data)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (!version) return { added: false, error: 'Song version not found' };

    // Check if already in playlist — toggle out if so
    const { data: existing } = await supabase
        .from('setlist_items')
        .select('id')
        .eq('setlist_id', playlistParsed.data)
        .eq('song_version_id', version.id)
        .maybeSingle();

    if (existing) {
        const { error: deleteError } = await supabase
            .from('setlist_items').delete().eq('id', existing.id);
        if (deleteError) return { added: true, error: deleteError.message };
        revalidatePath(`/library/playlists/${playlistParsed.data}`);
        return { added: false };
    }

    // Get next order_index
    const { data: last } = await supabase
        .from('setlist_items')
        .select('order_index')
        .eq('setlist_id', playlistParsed.data)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextIndex = (last?.order_index ?? -1) + 1;

    const { error } = await supabase
        .from('setlist_items')
        .insert({ setlist_id: playlistParsed.data, song_version_id: version.id, order_index: nextIndex });

    if (error) return { added: false, error: error.message };
    revalidatePath(`/library/playlists/${playlistParsed.data}`);
    return { added: true };
}

// ─── Remove song ──────────────────────────────────────────────────────────────

export async function removeSongFromPlaylist(
    itemId: string
): Promise<{ error?: string }> {
    const parsed = safeParse(uuid, itemId);
    if ('error' in parsed) return { error: 'Invalid item ID' };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: item } = await supabase
        .from('setlist_items')
        .select('id, setlist_id, setlists(owner_id)')
        .eq('id', parsed.data)
        .maybeSingle();

    if (!item) return { error: 'Item not found' };
    if ((item.setlists as any)?.owner_id !== user.id) return { error: 'Not your playlist' };

    const { error } = await supabase.from('setlist_items').delete().eq('id', parsed.data);
    if (error) return { error: error.message };
    revalidatePath(`/library/playlists/${item.setlist_id}`);
    return {};
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

export async function reorderPlaylistSongs(
    playlistId: string,
    orderedItemIds: string[]
): Promise<{ error?: string }> {
    const playlistParsed = safeParse(uuid, playlistId);
    if ('error' in playlistParsed) return { error: 'Invalid playlist ID' };

    const itemIdsParsed = safeParse(z.array(uuid), orderedItemIds);
    if ('error' in itemIdsParsed) return { error: 'Invalid item IDs' };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: playlist } = await supabase
        .from('setlists')
        .select('owner_id')
        .eq('id', playlistParsed.data)
        .maybeSingle();

    if (!playlist || playlist.owner_id !== user.id) return { error: 'Not your playlist' };

    const results = await Promise.all(
        itemIdsParsed.data.map((id, index) =>
            supabase.from('setlist_items')
                .update({ order_index: index })
                .eq('id', id)
                .eq('setlist_id', playlistParsed.data)
        )
    );
    const failed = results.find(r => r.error);
    if (failed) return { error: failed.error!.message };
    return {};
}
