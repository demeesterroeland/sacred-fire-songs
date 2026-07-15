import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { PlaylistDetailClient } from '@/components/playlists/PlaylistDetailClient';
import { PlaylistDetailHeader } from '@/components/playlists/PlaylistDetailHeader';

interface SetlistItemRow {
    id: string;
    song_versions: {
        compositions: {
            id: string;
            title: string;
            original_author: string;
        };
    };
}

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

    let isCurator = false;
    if (user && playlist.is_public) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
        isCurator = profile?.role === 'admin' || profile?.role === 'gatekeeper';
    }

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

    const mappedItems = (items as unknown as SetlistItemRow[] ?? []).map(item => ({
        id: item.id,
        songTitle: item.song_versions?.compositions?.title ?? 'Unknown',
        songAuthor: item.song_versions?.compositions?.original_author ?? '',
        songId: item.song_versions?.compositions?.id ?? '',
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
                isCurator={isCurator}
            />

            {/* Song list with DnD */}
            <PlaylistDetailClient
                playlistId={id}
                initialItems={mappedItems}
                isOwner={isOwner}
                isCurator={isCurator}
            />
        </div>
    );
}
