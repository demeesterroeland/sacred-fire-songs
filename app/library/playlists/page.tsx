import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Heart, PenLine, Music, Mic } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CreatePlaylistInput } from '@/components/playlists/CreatePlaylistInput';
import { PlaylistCard } from '@/components/playlists/PlaylistCard';
import { PublicPlaylistCard } from '@/components/playlists/PublicPlaylistCard';
import { CardContent } from '@/components/common/CardContent';
import { getRecentlyViewed, getRecentlyViewedCount, getUnviewedSongs } from '@/lib/songs/serverQueries';
import RecentlyViewed from '@/components/library/RecentlyViewed';
import NewSinceLastVisit from '@/components/library/NewSinceLastVisit';
import { getServerT } from '@/lib/i18n/server';
import GuestGate from '@/components/common/GuestGate';
import { MY_DRAFTS_HREF } from '@/lib/songs/draftsLink';
import { fetchLibrarySummary, type RecordingCounts, type SongCounts } from '@/lib/library/summary';


async function SongCountSubtitle({ counts, emptyLabel }: { counts: SongCounts; emptyLabel: string }) {
    const t = await getServerT();
    if (counts.total === 0) return <span className="text-caption text-fg-muted">{emptyLabel}</span>;
    return (
        <span className="text-caption text-fg-muted whitespace-nowrap">
            {counts.total === 1 ? t('playlists.songCountSingle') : t('playlists.songCount', { count: counts.total })}
            {' · '}
            <span>{t('playlists.countPublic', { count: counts.public })}</span>
            {' · '}
            <span>{t('playlists.countDraft', { count: counts.draft })}</span>
        </span>
    );
}

/** The Your recordings card counts recordings, not songs, and says which are public and which stay private. */
async function RecordingCountSubtitle({ counts, emptyLabel }: { counts: RecordingCounts; emptyLabel: string }) {
    const t = await getServerT();
    if (counts.total === 0) return <span className="text-caption text-fg-muted">{emptyLabel}</span>;
    return (
        <span className="text-caption text-fg-muted whitespace-nowrap">
            {counts.total === 1 ? t('librarySummary.recordings.countSingle') : t('librarySummary.recordings.count', { count: counts.total })}
            {' · '}
            <span>{t('librarySummary.recordings.public', { count: counts.public })}</span>
            {' · '}
            <span>{t('librarySummary.recordings.private', { count: counts.private })}</span>
        </span>
    );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

interface SmartPlaylistCardProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    subtitle: React.ReactNode;
    songTitles?: string[];
    accent?: string;
    href: string;
}

async function SmartPlaylistCard({ icon: Icon, title, description, subtitle, songTitles = [], href }: SmartPlaylistCardProps) {
    const inner = (
        <div className="border border-line bg-surface hover:bg-surface-2 p-4 rounded-panel flex items-center gap-4 transition-all w-full min-w-0 group hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-control flex items-center justify-center shrink-0 bg-surface-2 text-fg-muted group-hover:text-fg transition-colors">
                <Icon className="w-6 h-6 text-fg-muted group-hover:text-fg" />
            </div>
            <CardContent
                title={title}
                description={description}
                subtitle={subtitle}
                songTitles={songTitles}
            />
        </div>
    );

    return <Link href={href} className="block w-full min-w-0">{inner}</Link>;
}

async function PublicPlaylistsSection({
    playlists,
    userId,
    songCounts,
    songTitles,
}: {
    playlists: { id: string; title: string; description: string | null; owner_id: string }[];
    userId?: string;
    songCounts: Record<string, number>;
    songTitles: Record<string, string[]>;
}) {
    const t = await getServerT();
    if (playlists.length === 0) return null;

    return (
        <div>
            <p className="text-meta font-semibold text-fg-muted mb-3">{t('playlists.publicPlaylists')}</p>
            <div className="grid grid-cols-1 gap-3">
                {playlists.map(setlist => (
                    <PublicPlaylistCard
                        key={setlist.id}
                        id={setlist.id}
                        title={setlist.title}
                        description={setlist.description}
                        songCount={songCounts[setlist.id] ?? 0}
                        songTitles={songTitles[setlist.id] ?? []}
                        isOwner={userId === setlist.owner_id}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Views ────────────────────────────────────────────────────────────────────

async function GuestView({ publicPlaylists, publicSongCounts, publicSongTitles }: {
    publicPlaylists: { id: string; title: string; description: string | null; owner_id: string }[];
    publicSongCounts: Record<string, number>;
    publicSongTitles: Record<string, string[]>;
}) {
    return (
        <div className="space-y-8">

            {/* Smart + private playlists are members-only: one locked preview with the reason (Story 6.1.26) */}
            <GuestGate feature="smartPlaylists" next="/library/playlists" />

            <PublicPlaylistsSection playlists={publicPlaylists} songCounts={publicSongCounts} songTitles={publicSongTitles} />

        </div>
    );
}

export default async function PlaylistsPage() {
    const t = await getServerT();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch public playlists for both guests and auth users
    const { data: publicSetlists } = await supabase
        .from('setlists')
        .select('id, title, description, owner_id')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);
    const publicPlaylists = publicSetlists ?? [];

    // Fetch song data for public playlists (guests + auth users)
    const publicIds = publicPlaylists.map(p => p.id);
    const publicSongCounts: Record<string, number> = {};
    const publicSongTitles: Record<string, string[]> = {};

    if (publicIds.length > 0) {
        const { data: pubItems } = await supabase
            .from('setlist_items')
            .select(`
                setlist_id,
                order_index,
                song_versions(
                    compositions(title)
                )
            `)
            .in('setlist_id', publicIds)
            .order('order_index', { ascending: true });

        for (const item of pubItems ?? []) {
            const sid = item.setlist_id;
            publicSongCounts[sid] = (publicSongCounts[sid] ?? 0) + 1;
            const songVers = item.song_versions as unknown as { compositions: { title: string } } | null;
            const title = songVers?.compositions?.title;
            if (title) {
                if (!publicSongTitles[sid]) publicSongTitles[sid] = [];
                publicSongTitles[sid].push(title);
            }
        }
    }

    if (!user) return <GuestView publicPlaylists={publicPlaylists} publicSongCounts={publicSongCounts} publicSongTitles={publicSongTitles} />;

    // Fetch all user setlists
    const { data: setlists } = await supabase
        .from('setlists')
        .select('id, title, description, is_public, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    const myFavorites = setlists?.find(s => s.title === 'My Favorites');
    const privateSetlists = (setlists ?? []).filter(s => s.title !== 'My Favorites' && !s.is_public);

    // Fetch all setlist items to compute song counts
    const allSetlistIds = (setlists ?? []).map(s => s.id);
    const songCounts: Record<string, SongCounts> = {};
    const songTitles: Record<string, string[]> = {};

    if (allSetlistIds.length > 0) {
        const { data: items } = await supabase
            .from('setlist_items')
            .select(`
                setlist_id,
                order_index,
                song_versions(
                    compositions(title, is_public)
                )
            `)
            .in('setlist_id', allSetlistIds)
            .order('order_index', { ascending: true });

        for (const item of items ?? []) {
            const sid = item.setlist_id;
            if (!songCounts[sid]) songCounts[sid] = { total: 0, public: 0, draft: 0 };
            songCounts[sid].total++;
            const songVers = item.song_versions as unknown as { compositions: { is_public: boolean; title: string } } | null;
            const comp = songVers?.compositions;
            if (comp?.is_public === true) songCounts[sid].public++;
            else songCounts[sid].draft++;
            if (comp?.title) {
                if (!songTitles[sid]) songTitles[sid] = [];
                songTitles[sid].push(comp.title);
            }
        }
    }

    const favCounts: SongCounts = myFavorites
        ? (songCounts[myFavorites.id] ?? { total: 0, public: 0, draft: 0 })
        : { total: 0, public: 0, draft: 0 };
    const favTitles: string[] = myFavorites
        ? (songTitles[myFavorites.id] ?? []).slice(0, 5)
        : [];

    // Fetch My Songs + My Drafts + My Recordings counts and titles, plus personalized sections
    const [summary, recentlyViewedSongs, recentlyViewedCount, newSongs] = await Promise.all([
        fetchLibrarySummary(supabase, user.id),
        getRecentlyViewed(user.id, 5),
        getRecentlyViewedCount(user.id),
        getUnviewedSongs(user.id, 5),
    ]);

    const { mySongs: mySongsCounts, drafts: myDraftsCounts, recordings: myRecordings } = summary;
    const mySongsTitles = mySongsCounts.titles;
    const myDraftsTitles = myDraftsCounts.titles;

    return (
        <div className="space-y-8">

            {/* Smart Playlists */}
            <div>
                <p className="text-meta font-semibold text-fg-muted mb-3">{t('playlists.smartPlaylists')}</p>
                <div className="grid grid-cols-1 gap-3">
                    <SmartPlaylistCard
                        icon={Heart} title={t('librarySummary.favorites.title')} description={t('librarySummary.favorites.description')} accent="rose"
                        href="/songs?favorites=true"
                        subtitle={<SongCountSubtitle counts={favCounts} emptyLabel={t('librarySummary.favorites.empty')} />}
                        songTitles={favTitles}
                    />
                    <SmartPlaylistCard
                        icon={Music} title={t('librarySummary.mySongs.title')} description={t('librarySummary.mySongs.description')} accent="violet"
                        href="/songs?mine=true"
                        subtitle={<SongCountSubtitle counts={mySongsCounts} emptyLabel={t('librarySummary.mySongs.empty')} />}
                        songTitles={mySongsTitles}
                    />
                    <SmartPlaylistCard
                        icon={PenLine} title={t('librarySummary.drafts.title')} description={t('librarySummary.drafts.description')} accent="gray"
                        href={MY_DRAFTS_HREF}
                        subtitle={<SongCountSubtitle counts={myDraftsCounts} emptyLabel={t('librarySummary.drafts.empty')} />}
                        songTitles={myDraftsTitles}
                    />
                    <SmartPlaylistCard
                        icon={Mic} title={t('librarySummary.recordings.title')} description={t('librarySummary.recordings.description')} accent="violet"
                        href="/songs?myRecordings=true"
                        subtitle={<RecordingCountSubtitle counts={myRecordings} emptyLabel={t('librarySummary.recordings.empty')} />}
                        songTitles={myRecordings.titles.slice(0, 5)}
                    />
                </div>
            </div>

            {/* Recently Viewed */}
            <RecentlyViewed songs={recentlyViewedSongs} total={recentlyViewedCount} />

            {/* New Since Last Visit */}
            <NewSinceLastVisit songs={newSongs} />

            {/* My Private Playlists — real data */}
            <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <p className="text-meta font-semibold text-fg-muted">{t('playlists.myPrivatePlaylists')}</p>
                    <CreatePlaylistInput />
                </div>
                {privateSetlists.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {privateSetlists.map(setlist => {
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
                ) : (
                    <p className="text-sm text-fg-muted italic py-2">{t('playlists.emptyPrivateHint')}</p>
                )}
            </div>

            <PublicPlaylistsSection playlists={publicPlaylists} userId={user.id} songCounts={publicSongCounts} songTitles={publicSongTitles} />

        </div>
    );
}
