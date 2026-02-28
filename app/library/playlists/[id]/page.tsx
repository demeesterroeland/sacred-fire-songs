import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PlaylistDetailClient } from '@/components/playlists/PlaylistDetailClient';
import { PlaylistContextMenu } from '@/components/playlists/PlaylistContextMenu';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function PlaylistDetailPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login?next=/library/playlists/' + id);

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
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link
                    href="/library/playlists"
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label="Back to playlists"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-gray-100 truncate">{playlist.title}</h1>
                    <p className="text-xs text-gray-500">{mappedItems.length} song{mappedItems.length !== 1 ? 's' : ''}</p>
                </div>
                <PlaylistContextMenu
                    playlistId={playlist.id}
                    playlistTitle={playlist.title}
                    onRenameStart={() => {}}
                />
            </div>

            {/* Song list with DnD */}
            <PlaylistDetailClient
                playlistId={id}
                initialItems={mappedItems}
            />
        </div>
    );
}
