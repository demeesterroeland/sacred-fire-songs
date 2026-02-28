import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { PlaylistDetailClient } from '@/components/playlists/PlaylistDetailClient';
import { PlaylistDetailHeader } from '@/components/playlists/PlaylistDetailHeader';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function PlaylistDetailPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: playlist } = await supabase
        .from('setlists')
        .select('id, title, owner_id, is_public, description')
        .eq('id', id)
        .maybeSingle();

    if (!playlist) notFound();

    // Private playlists: only owner can access
    if (!playlist.is_public) {
        if (!user) redirect(`/auth/login?next=${encodeURIComponent('/library/playlists/' + id)}`);
        if (playlist.owner_id !== user.id) notFound();
    }

    const isOwner = user?.id === playlist.owner_id;

    const { data: items } = await supabase
        .from('setlist_items')
        .select(`
            id,
            order_index,
            song_versions (
                id,
                compositions (
                    id,
                    title,
                    original_author
                )
            )
        `)
        .eq('setlist_id', id)
        .order('order_index', { ascending: true });

    const mappedItems = (items ?? []).map(item => ({
        id: item.id,
        songTitle: (item.song_versions as any)?.compositions?.title ?? 'Unknown',
        songAuthor: (item.song_versions as any)?.compositions?.original_author ?? '',
        songId: (item.song_versions as any)?.compositions?.id ?? '',
    }));

    return (
        <div className="space-y-6">
            <PlaylistDetailHeader
                playlistId={playlist.id}
                initialTitle={playlist.title}
                initialIsPublic={playlist.is_public ?? false}
                initialDescription={playlist.description ?? null}
                songCount={mappedItems.length}
                isOwner={isOwner}
            />

            {/* Song list with DnD */}
            <PlaylistDetailClient
                playlistId={id}
                initialItems={mappedItems}
                isOwner={isOwner}
            />
        </div>
    );
}
