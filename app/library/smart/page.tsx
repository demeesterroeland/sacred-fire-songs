import { Sparkles } from 'lucide-react';
import { LibrarySubpageHeading } from '@/components/library/LibrarySubpageHeading';
import { createClient } from '@/lib/supabase/server';
import { getServerT } from '@/lib/i18n/server';
import GuestGate from '@/components/common/GuestGate';
import { PLAYLIST_LIST } from '@/components/playlists/playlistRow';
import { RecordingCountSubtitle, SmartPlaylistCard, SongCountSubtitle } from '@/components/playlists/PlaylistSubtitles';
import { fetchFavoritesSetlistId } from '@/lib/playlists/favorites';
import { fetchLibrarySummary, type SongCounts } from '@/lib/library/summary';

/**
 * Library · Smart tab (validation 4): playlists the app keeps for you. My Drafts is gone: private songs show
 * lighter in every song list instead.
 */
export default async function SmartPlaylistsPage() {
    const t = await getServerT();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <GuestGate feature="smartPlaylists" next="/library/smart" />;

    const [favoritesId, summary] = await Promise.all([
        fetchFavoritesSetlistId(supabase, user.id),
        fetchLibrarySummary(supabase, user.id),
    ]);

    const favCounts: SongCounts = { total: 0, public: 0, draft: 0 };
    const favTitles: string[] = [];
    if (favoritesId) {
        const { data: items } = await supabase
            .from('setlist_items')
            .select('order_index, song_versions(compositions(title, is_public))')
            .eq('setlist_id', favoritesId)
            .order('order_index', { ascending: true });
        for (const item of items ?? []) {
            favCounts.total++;
            const comp = (item.song_versions as unknown as { compositions: { is_public: boolean; title: string } } | null)?.compositions;
            if (comp?.is_public === true) favCounts.public++;
            else favCounts.draft++;
            if (comp?.title && favTitles.length < 5) favTitles.push(comp.title);
        }
    }

    const { mySongs, recordings } = summary;

    return (
        <section data-testid="smart-playlists">
            {/* Same heading as History, New and Artists, with the Smart tab's star (validation 4). */}
            <LibrarySubpageHeading icon={Sparkles} title={t('playlists.smartPlaylists')} count={3} />
            <div className={PLAYLIST_LIST}>
                <SmartPlaylistCard
                    title={t('librarySummary.favorites.title')} description={t('librarySummary.favorites.description')}
                    href="/songs?favorites=true"
                    subtitle={<SongCountSubtitle counts={favCounts} emptyLabel={t('librarySummary.favorites.empty')} />}
                    songTitles={favTitles}
                />
                <SmartPlaylistCard
                    title={t('librarySummary.mySongs.title')} description={t('librarySummary.mySongs.description')}
                    href="/songs?mine=true"
                    subtitle={<SongCountSubtitle counts={mySongs} emptyLabel={t('librarySummary.mySongs.empty')} />}
                    songTitles={mySongs.titles}
                />
                <SmartPlaylistCard
                    title={t('librarySummary.recordings.title')} description={t('librarySummary.recordings.description')}
                    href="/songs?myRecordings=true"
                    subtitle={<RecordingCountSubtitle counts={recordings} emptyLabel={t('librarySummary.recordings.empty')} />}
                    songTitles={recordings.titles.slice(0, 5)}
                />
            </div>
        </section>
    );
}
