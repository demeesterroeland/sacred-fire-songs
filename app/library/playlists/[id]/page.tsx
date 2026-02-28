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

    if (!user) redirect(`/auth/login?next=${encodeURIComponent('/library/playlists/' + id)}`);

    const { data: playlist } = await supabase
        .from('setlists')
        .select('id, title, owner_id')
        .eq('id', id)
        .maybeSingle();

    if (!playlist || playlist.owner_id !== user.id) notFound();

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
                songCount={mappedItems.length}
            />

            {/* Song list with DnD */}
            <PlaylistDetailClient
                playlistId={id}
                initialItems={mappedItems}
            />
        </div>
    );
}
