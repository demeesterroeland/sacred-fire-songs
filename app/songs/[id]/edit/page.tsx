'use client';

import { useParams, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import SongForm from '@/components/song/SongForm';
import NotYoursToEdit from '@/components/common/feedback/NotYoursToEdit';
import GuestGate from '@/components/common/GuestGate';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/context/LocaleContext';

// Similar fetch to detail page, but we just need basic data
const fetchSongForEdit = async (id: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('compositions')
        .select(`
          id,
          title,
          original_author,
          owner_id,
          is_public,
          song_category_map (
            category_id
          ),
          song_versions!inner (
            id,
            content_chordpro,
            key,
            capo,
            tuning,
            youtube_url,
            spotify_url,
            soundcloud_url,
            melody_notation
          )
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

export default function EditSongPage() {
    const { t } = useLocale();
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : params.id?.[0];
    const pathname = usePathname();
    const { user, loading: authLoading } = useAuth();

    const { data: song, isLoading, error } = useQuery({
        queryKey: ['song', id, 'edit'],
        queryFn: () => fetchSongForEdit(id!),
        enabled: !!id,
        retry: 1
    });

    // Guests get the unified GuestGate (Story 6.1.26); the warm "not yours" copy is for signed-in non-owners.
    if (!authLoading && !user) {
        return (
            <div className="mx-auto max-w-xl p-4">
                <GuestGate feature="edit" next={pathname || `/songs/${id}/edit`} />
            </div>
        );
    }

    if (isLoading || authLoading) return <div className="p-8 text-fg text-center">{t('common.loading')}</div>;
    if (error || !song) {
        console.error("Fetch error:", error);
        return <div className="p-8 text-danger text-center">{t('song.edit.loadError')}</div>;
    }

    // Permission Check (Client-side visual check, RLS enforces actual security)
    // We can show a friendly message if mismatch, though RLS would prevent the fetch ideally if using strict policies,
    // but typically fetch is open, update is restricted.
    // If we only allow Owners to EDIT, we should verify ownership here to show UI.
    // Note: Admins also can edit (not fully checked here without role fetch, relying on RLS for save)

    // For now, render form. RLS will explode on save if unauthorized.
    // Permission Check
    if (!authLoading && !isLoading && song) {
        const isOwner = user?.id === song.owner_id;
        const isAdmin = user?.role === 'admin';

        if (!user || (!isOwner && !isAdmin)) {
            return <NotYoursToEdit songId={id} />;
        }
    }

    const initialData = {
        title: song.title,
        author: song.original_author || '',
        content: song.song_versions[0]?.content_chordpro || '',

        categoryIds: song.song_category_map?.map((m: { category_id: string }) => m.category_id) || [],
        key: song.song_versions[0]?.key,
        capo: song.song_versions[0]?.capo,
        tuning: song.song_versions[0]?.tuning,
        youtubeLink: song.song_versions[0]?.youtube_url || '',
        spotifyLink: song.song_versions[0]?.spotify_url || '',
        soundcloudLink: song.song_versions[0]?.soundcloud_url || '',
        melodyNotation: song.song_versions[0]?.melody_notation || '',
        isPublic: song.is_public ?? true
    };


    return (
        <div className="min-h-screen bg-bg pb-20">

            <main className="container mx-auto px-4 pt-4 lg:pt-8">


                <SongForm
                    mode="edit"
                    initialData={initialData}
                    songId={id}
                    versionId={song.song_versions[0]?.id}
                />
            </main>
        </div>
    );
}
