import { Globe, Lock, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { LibrarySubpageHeading } from '@/components/library/LibrarySubpageHeading';
import { CreatePlaylistInput } from '@/components/playlists/CreatePlaylistInput';
import { PlaylistCard } from '@/components/playlists/PlaylistCard';
import { PublicPlaylistCard } from '@/components/playlists/PublicPlaylistCard';
import { PLAYLIST_LIST } from '@/components/playlists/playlistRow';
import { SongCountSubtitle } from '@/components/playlists/PlaylistSubtitles';
import { getServerT } from '@/lib/i18n/server';
import GuestGate from '@/components/common/GuestGate';
import { FAVORITES_TITLE } from '@/lib/playlists/favorites';
import type { SongCounts } from '@/lib/library/summary';

type PublicPlaylist = { id: string; title: string; description: string | null; owner_id: string };
type OwnPlaylist = { id: string; title: string; description: string | null; is_public: boolean | null };


/** Public playlists of other people (or every public playlist, for a guest). */
async function OtherPublicPlaylists({
    title,
    playlists,
    songCounts,
    songTitles,
}: {
    title: string;
    playlists: PublicPlaylist[];
    songCounts: Record<string, number>;
    songTitles: Record<string, string[]>;
}) {
    if (playlists.length === 0) return null;
    return (
        <section data-testid="other-public-playlists">
            <LibrarySubpageHeading icon={Users} title={title} count={playlists.length} />
            <div className={PLAYLIST_LIST}>
                {playlists.map(setlist => (
                    <PublicPlaylistCard
                        key={setlist.id}
                        id={setlist.id}
                        title={setlist.title}
                        description={setlist.description}
                        songCount={songCounts[setlist.id] ?? 0}
                        songTitles={songTitles[setlist.id] ?? []}
                    />
                ))}
            </div>
        </section>
    );
}

/** The user's own playlists of one kind (private or public), with the ⋯ menu and PDF export. */
async function OwnPlaylists({
    playlists,
    songCounts,
    songTitles,
    emptyLabel,
}: {
    playlists: OwnPlaylist[];
    songCounts: Record<string, SongCounts>;
    songTitles: Record<string, string[]>;
    emptyLabel: string;
}) {
    const t = await getServerT();
    if (playlists.length === 0) return <p className="text-meta text-fg-muted italic py-2">{emptyLabel}</p>;
    return (
        <div className={PLAYLIST_LIST}>
            {playlists.map(setlist => {
                const counts = songCounts[setlist.id] ?? { total: 0, public: 0, draft: 0 };
                return (
                    <PlaylistCard
                        key={setlist.id}
                        id={setlist.id}
                        title={setlist.title}
                        isPublic={setlist.is_public ?? false}
                        description={setlist.description ?? null}
                        subtitle={<SongCountSubtitle counts={counts} emptyLabel={t('librarySummary.mySongs.empty')} />}
                        songTitles={songTitles[setlist.id] ?? []}
                    />
                );
            })}
        </div>
    );
}

/**
 * Library · Playlists tab (validation 4): your private playlists, your public playlists and other people's public
 * playlists. Smart playlists, History and New have their own tabs.
 */
export default async function PlaylistsPage() {
    const t = await getServerT();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Other members' public playlists: filtered in the query, so your own recent public lists cannot crowd them out.
    let publicQuery = supabase
        .from('setlists')
        .select('id, title, description, owner_id')
        .eq('is_public', true);
    if (user) publicQuery = publicQuery.neq('owner_id', user.id);
    const { data: publicSetlists } = await publicQuery
        .order('created_at', { ascending: false })
        .limit(20);
    const publicPlaylists: PublicPlaylist[] = publicSetlists ?? [];

    const publicIds = publicPlaylists.map(p => p.id);
    const publicSongCounts: Record<string, number> = {};
    const publicSongTitles: Record<string, string[]> = {};
    if (publicIds.length > 0) {
        const { data: pubItems } = await supabase
            .from('setlist_items')
            .select('setlist_id, order_index, song_versions(compositions(title))')
            .in('setlist_id', publicIds)
            .order('order_index', { ascending: true });
        for (const item of pubItems ?? []) {
            const sid = item.setlist_id;
            publicSongCounts[sid] = (publicSongCounts[sid] ?? 0) + 1;
            const title = (item.song_versions as unknown as { compositions: { title: string } } | null)?.compositions?.title;
            if (title) (publicSongTitles[sid] ??= []).push(title);
        }
    }

    if (!user) {
        return (
            <div className="space-y-8">
                {/* Smart playlists live on /library/smart; this tab asks a guest to sign in to make playlists. */}
                <GuestGate feature="newPlaylist" next="/library/playlists" />
                <OtherPublicPlaylists title={t('playlists.publicPlaylists')} playlists={publicPlaylists} songCounts={publicSongCounts} songTitles={publicSongTitles} />
            </div>
        );
    }

    const { data: setlists } = await supabase
        .from('setlists')
        .select('id, title, description, is_public, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
    const own = (setlists ?? []).filter(s => s.title !== FAVORITES_TITLE);
    const privatePlaylists = own.filter(s => !s.is_public);
    const ownPublicPlaylists = own.filter(s => s.is_public);

    const songCounts: Record<string, SongCounts> = {};
    const songTitles: Record<string, string[]> = {};
    const ownIds = own.map(s => s.id);
    if (ownIds.length > 0) {
        const { data: items } = await supabase
            .from('setlist_items')
            .select('setlist_id, order_index, song_versions(compositions(title, is_public))')
            .in('setlist_id', ownIds)
            .order('order_index', { ascending: true });
        for (const item of items ?? []) {
            const sid = item.setlist_id;
            const counts = (songCounts[sid] ??= { total: 0, public: 0, draft: 0 });
            counts.total++;
            const comp = (item.song_versions as unknown as { compositions: { is_public: boolean; title: string } } | null)?.compositions;
            if (comp?.is_public === true) counts.public++;
            else counts.draft++;
            if (comp?.title) (songTitles[sid] ??= []).push(comp.title);
        }
    }

    return (
        <div className="space-y-8">
            <section data-testid="your-private-playlists">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <LibrarySubpageHeading icon={Lock} title={t('playlists.myPrivatePlaylists')} count={privatePlaylists.length} className="" />
                    <CreatePlaylistInput />
                </div>
                <OwnPlaylists playlists={privatePlaylists} songCounts={songCounts} songTitles={songTitles} emptyLabel={t('playlists.emptyPrivateHint')} />
            </section>

            <section data-testid="your-public-playlists">
                <LibrarySubpageHeading icon={Globe} title={t('playlists.myPublicPlaylists')} count={ownPublicPlaylists.length} />
                <OwnPlaylists playlists={ownPublicPlaylists} songCounts={songCounts} songTitles={songTitles} emptyLabel={t('playlists.emptyPublicHint')} />
            </section>

            <OtherPublicPlaylists
                title={t('playlists.otherPublicPlaylists')}
                playlists={publicPlaylists}
                songCounts={publicSongCounts}
                songTitles={publicSongTitles}
            />
        </div>
    );
}
