import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Heart, ListMusic, Flame, Droplets, Lock, Globe, PenLine, Music, Plus, LogIn, Mic } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CreatePlaylistInput } from '@/components/playlists/CreatePlaylistInput';
import { PlaylistCard } from '@/components/playlists/PlaylistCard';
import { PublicPlaylistCard } from '@/components/playlists/PublicPlaylistCard';
import { CardContent } from '@/components/common/CardContent';
import { getRecentlyViewed, getRecentlyViewedCount, getUnviewedSongs } from '@/lib/songs/serverQueries';
import RecentlyViewed from '@/components/library/RecentlyViewed';
import NewSinceLastVisit from '@/components/library/NewSinceLastVisit';

interface SongCounts {
    total: number;
    public: number;
    draft: number;
}

function SongCountSubtitle({ counts, emptyLabel }: { counts: SongCounts; emptyLabel: string }) {
    if (counts.total === 0) return <span className="text-xs text-gray-500">{emptyLabel}</span>;
    return (
        <span className="text-xs text-gray-500 whitespace-nowrap">
            {counts.total} song{counts.total !== 1 ? 's' : ''}
            {' · '}
            <span className="text-emerald-500/70">{counts.public} public</span>
            {' · '}
            <span className="text-amber-500/70">{counts.draft} draft</span>
        </span>
    );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

const accentClasses = {
    rose: {
        card:      'bg-rose-500/8 border-rose-500/20',
        cardHover: 'hover:bg-rose-500/15 hover:border-rose-500/35',
        icon:      'bg-rose-500/15',
        iconHover: 'group-hover:bg-rose-500/25',
        iconText:  'text-rose-400 fill-rose-400',
    },
    amber: {
        card:      'bg-amber-500/8 border-amber-500/20',
        cardHover: 'hover:bg-amber-500/15 hover:border-amber-500/35',
        icon:      'bg-amber-500/15',
        iconHover: 'group-hover:bg-amber-500/25',
        iconText:  'text-amber-400',
    },
    violet: {
        card:      'bg-violet-500/8 border-violet-500/20',
        cardHover: 'hover:bg-violet-500/15 hover:border-violet-500/35',
        icon:      'bg-violet-500/15',
        iconHover: 'group-hover:bg-violet-500/25',
        iconText:  'text-violet-400',
    },
    gray: {
        card:      'bg-gray-200/40 dark:bg-gray-800/40 border-gray-300/40 dark:border-gray-700/40',
        cardHover: 'hover:bg-gray-200/70 dark:hover:bg-gray-800/70 hover:border-gray-400/60 dark:hover:border-gray-600/60',
        icon:      'bg-gray-300/40 dark:bg-gray-700/40',
        iconHover: 'group-hover:bg-gray-300/60 dark:group-hover:bg-gray-700/60',
        iconText:  'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors',
    },
} as const;

interface SmartPlaylistCardProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    subtitle: React.ReactNode;
    songTitles?: string[];
    accent: keyof typeof accentClasses;
    href?: string; // absent = locked (guest)
}

function SmartPlaylistCard({ icon: Icon, title, description, subtitle, songTitles = [], accent, href }: SmartPlaylistCardProps) {
    const c = accentClasses[accent];
    const locked = !href;

    const inner = (
        <div className={`border p-4 rounded-2xl flex items-center gap-4 transition-all w-full min-w-0 ${c.card} ${
            locked ? 'cursor-default' : `group ${c.cardHover} hover:-translate-y-0.5`
        }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${c.icon} ${locked ? '' : c.iconHover}`}>
                <Icon className={`w-6 h-6 ${c.iconText}`} />
            </div>
            <CardContent
                title={title}
                description={description}
                subtitle={subtitle}
                songTitles={songTitles}
            />
            {locked && (
                <div className="flex items-center gap-1.5 shrink-0">
                    <Lock aria-hidden="true" className="w-3 h-3 text-gray-600" />
                    <span className="text-[10px] text-gray-600 font-medium">Members only</span>
                </div>
            )}
        </div>
    );

    return href ? <Link href={href} className="block w-full min-w-0">{inner}</Link> : inner;
}

function PublicPlaylistsSection({
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
    if (playlists.length === 0) return null;

    return (
        <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Public Playlists</p>
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

function GuestView({ publicPlaylists, publicSongCounts, publicSongTitles }: {
    publicPlaylists: { id: string; title: string; description: string | null; owner_id: string }[];
    publicSongCounts: Record<string, number>;
    publicSongTitles: Record<string, string[]>;
}) {
    return (
        <div className="space-y-8">

            {/* Smart Playlists — locked for guests */}
            <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Smart Playlists</p>
                <div className="grid grid-cols-1 gap-3">
                    <SmartPlaylistCard icon={Heart}   title="My Favorites" description="Your favorited songs, always with you"      subtitle={<span className="text-xs text-gray-500">Sign in to save favorites</span>} accent="rose"   />
                    <SmartPlaylistCard icon={Music}   title="My Songs"     description="Songs you've contributed to the library"    subtitle={<span className="text-xs text-gray-500">Sign in to see your songs</span>} accent="violet" />
                    <SmartPlaylistCard icon={PenLine} title="My Drafts"    description="Your private work-in-progress songs"        subtitle={<span className="text-xs text-gray-500">Sign in to see your drafts</span>} accent="gray"   />
                    <SmartPlaylistCard icon={Mic}     title="My Recordings" description="Your private rehearsal recordings"       subtitle={<span className="text-xs text-gray-500">Sign in to see your recordings</span>} accent="amber" />
                </div>
            </div>

            {/* My Private Playlists — ghost demo */}
            <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">My Private Playlists</p>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/auth/login?next=/library/playlists"
                            className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            <LogIn className="w-3 h-3" />
                            Sign in to create playlists
                        </Link>
                        <Link
                            href="/auth/login?next=/library/playlists"
                            className="flex items-center gap-1 text-xs font-semibold text-red-500/50 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:text-red-500/80 rounded-full px-3 py-1 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            New Playlist
                        </Link>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 opacity-40 pointer-events-none select-none">
                    <div className="bg-gray-100/40 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                        <div className="relative w-12 h-12 shrink-0">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                <Flame className="w-6 h-6 text-orange-500" />
                            </div>
                            <Lock aria-hidden="true" className="absolute -top-1 -right-1 w-3 h-3 text-gray-500" />
                            <span className="sr-only">Members only</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">Yage Ceremony 2024</h3>
                            <p className="text-xs text-gray-500 mt-0.5">12 songs</p>
                        </div>
                    </div>
                    <div className="bg-gray-100/40 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                        <div className="relative w-12 h-12 shrink-0">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                <Droplets className="w-6 h-6 text-blue-500" />
                            </div>
                            <Lock aria-hidden="true" className="absolute -top-1 -right-1 w-3 h-3 text-gray-500" />
                            <span className="sr-only">Members only</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">Temazcal — Water Songs</h3>
                            <p className="text-xs text-gray-500 mt-0.5">8 songs</p>
                        </div>
                    </div>
                </div>
            </div>

            <PublicPlaylistsSection playlists={publicPlaylists} songCounts={publicSongCounts} songTitles={publicSongTitles} />

        </div>
    );
}

export default async function PlaylistsPage() {
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
    const [mySongsResult, myDraftsResult, myRecordingsResult, recentlyViewedSongs, recentlyViewedCount, newSongs] = await Promise.all([
        supabase.from('compositions').select('title, is_public').eq('owner_id', user.id).limit(500),
        supabase.from('compositions').select('title, is_public').eq('is_public', false).limit(500),
        supabase.from('user_recordings').select('song_versions(compositions(title, is_public))').eq('user_id', user.id),
        getRecentlyViewed(user.id, 5),
        getRecentlyViewedCount(user.id),
        getUnviewedSongs(user.id, 5),
    ]);

    const mySongsData = mySongsResult.data ?? [];
    const mySongsCounts: SongCounts = {
        total: mySongsData.length,
        public: mySongsData.filter(s => s.is_public).length,
        draft: mySongsData.filter(s => !s.is_public).length,
    };
    const mySongsTitles = mySongsData.slice(0, 5).map(s => s.title);

    const myDraftsData = myDraftsResult.data ?? [];
    const myDraftsCounts: SongCounts = {
        total: myDraftsData.length,
        public: 0,
        draft: myDraftsData.length,
    };
    const myDraftsTitles = myDraftsData.slice(0, 5).map(s => s.title);

    // Compute My Recordings counts and titles
    const myRecordingsData = (myRecordingsResult.data ?? []).map(r => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (r.song_versions as any)?.compositions;
    }).filter(Boolean);

    const myRecordingsCounts: SongCounts = {
        total: myRecordingsData.length,
        public: myRecordingsData.filter(s => s?.is_public).length,
        draft: myRecordingsData.filter(s => s && !s.is_public).length,
    };
    const myRecordingsTitles = Array.from(new Set(myRecordingsData.map(s => s?.title).filter(Boolean))).slice(0, 5) as string[];

    return (
        <div className="space-y-8">

            {/* Smart Playlists */}
            <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Smart Playlists</p>
                <div className="grid grid-cols-1 gap-3">
                    <SmartPlaylistCard
                        icon={Heart} title="My Favorites" description="Your favorited songs" accent="rose"
                        href="/songs?favorites=true"
                        subtitle={<SongCountSubtitle counts={favCounts} emptyLabel="No songs yet — tap ♥ on any song" />}
                        songTitles={favTitles}
                    />
                    <SmartPlaylistCard
                        icon={Music} title="My Songs" description="Songs you've contributed" accent="violet"
                        href="/songs?mine=true"
                        subtitle={<SongCountSubtitle counts={mySongsCounts} emptyLabel="No songs yet" />}
                        songTitles={mySongsTitles}
                    />
                    <SmartPlaylistCard
                        icon={PenLine} title="My Drafts" description="Your work-in-progress songs" accent="gray"
                        href="/songs?status=draft"
                        subtitle={<SongCountSubtitle counts={myDraftsCounts} emptyLabel="No drafts yet" />}
                        songTitles={myDraftsTitles}
                    />
                    <SmartPlaylistCard
                        icon={Mic} title="My Recordings" description="Your private rehearsal recordings" accent="amber"
                        href="/songs?myRecordings=true"
                        subtitle={<SongCountSubtitle counts={myRecordingsCounts} emptyLabel="No recordings yet" />}
                        songTitles={myRecordingsTitles}
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
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">My Private Playlists</p>
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
                                    subtitle={<SongCountSubtitle counts={counts} emptyLabel="No songs yet" />}
                                    songTitles={songTitles[setlist.id] ?? []}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-600 italic py-2">No private playlists yet — create your first one above.</p>
                )}
            </div>

            <PublicPlaylistsSection playlists={publicPlaylists} userId={user.id} songCounts={publicSongCounts} songTitles={publicSongTitles} />

        </div>
    );
}
