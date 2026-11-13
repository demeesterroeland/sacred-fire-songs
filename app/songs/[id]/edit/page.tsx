'use client';

import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import SongForm from '@/components/song/SongForm';
import NotYoursToEdit from '@/components/common/feedback/NotYoursToEdit';
import GuestGate from '@/components/common/GuestGate';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/context/LocaleContext';
import { EDIT_VERSION_PARAM, pickVersion, sortVersions } from '@/lib/songs/versionOrder';
import { versionOptions } from '@/lib/songs/versionSwitch';

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
            created_at,
            version_name,
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
    // UXA-049: the same order as the song page (oldest first), so "the first version" is the same everywhere.
    return data && { ...data, song_versions: sortVersions(data.song_versions) };
};

export default function EditSongPage() {
    const { t } = useLocale();
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : params.id?.[0];
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const requestedVersionId = searchParams.get(EDIT_VERSION_PARAM);
    const search = searchParams.toString();
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
                <GuestGate feature="edit" next={`${pathname || `/songs/${id}/edit`}${search ? `?${search}` : ''}`} />
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

    // The version being read (`?version=`), else the first (oldest) one, like the song page.
    const version = pickVersion(song.song_versions, requestedVersionId);
    // Which version this form saves is only visible when the song has more than one (same labels as the switch).
    const versionLabel = versionOptions(song.song_versions, t)?.find((o) => o.value === version?.id)?.label;
    const initialData = {
        title: song.title,
        author: song.original_author || '',
        content: version?.content_chordpro || '',

        categoryIds: song.song_category_map?.map((m: { category_id: string }) => m.category_id) || [],
        key: version?.key,
        capo: version?.capo,
        tuning: version?.tuning,
        youtubeLink: version?.youtube_url || '',
        spotifyLink: version?.spotify_url || '',
        soundcloudLink: version?.soundcloud_url || '',
        melodyNotation: version?.melody_notation || '',
        isPublic: song.is_public ?? true
    };


    return (
        <div className="min-h-screen bg-bg pb-20">

            <div className="container mx-auto px-4 pt-4 lg:pt-8">


                {versionLabel && (
                    <p data-testid="edit-version-caption" className="mb-3 text-meta text-fg-muted">
                        {t('song.edit.versionCaption', { name: versionLabel })}
                    </p>
                )}

                {/* One form per version: version A's text can never be saved onto version B. */}
                <SongForm
                    key={version?.id}
                    mode="edit"
                    initialData={initialData}
                    songId={id}
                    versionId={version?.id}
                />
            </div>
        </div>
    );
}
