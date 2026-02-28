import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Heart, ListMusic, Flame, Droplets, Lock, Globe, PenLine, Music, Plus, LogIn } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CreatePlaylistInput } from '@/components/playlists/CreatePlaylistInput';
import { PlaylistCard } from '@/components/playlists/PlaylistCard';
import { PublicPlaylistCard } from '@/components/playlists/PublicPlaylistCard';

interface SongCounts {
    total: number;
    public: number;
    draft: number;
}

function SongCountSubtitle({ counts, emptyLabel }: { counts: SongCounts; emptyLabel: string }) {
    if (counts.total === 0) return <p className="text-xs text-gray-500 mt-0.5">{emptyLabel}</p>;
    return (
        <p className="text-xs text-gray-500 mt-0.5">
            {counts.total} song{counts.total !== 1 ? 's' : ''}
            {' · '}
            <span className="text-emerald-500/70">{counts.public} public</span>
            {' · '}
            <span className="text-amber-500/70">{counts.draft} draft</span>
        </p>
    );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

const accentClasses = {
    amber: {
        card:      'bg-amber-500/8 border-amber-500/20',
        cardHover: 'hover:bg-amber-500/15 hover:border-amber-500/35',
        icon:      'bg-amber-500/15',
        iconHover: 'group-hover:bg-amber-500/25',
        iconText:  'text-amber-400 fill-amber-400',
    },
    violet: {
        card:      'bg-violet-500/8 border-violet-500/20',
        cardHover: 'hover:bg-violet-500/15 hover:border-violet-500/35',
        icon:      'bg-violet-500/15',
        iconHover: 'group-hover:bg-violet-500/25',
        iconText:  'text-violet-400',
    },
    gray: {
        card:      'bg-gray-800/40 border-gray-700/40',
        cardHover: 'hover:bg-gray-800/70 hover:border-gray-600/60',
        icon:      'bg-gray-700/40',
        iconHover: 'group-hover:bg-gray-700/60',
        iconText:  'text-gray-400 group-hover:text-gray-300 transition-colors',
    },
} as const;

interface SmartPlaylistCardProps {
    icon: LucideIcon;
    title: string;
    subtitle: React.ReactNode;
    accent: keyof typeof accentClasses;
    href?: string; // absent = locked (guest)
}

function SmartPlaylistCard({ icon: Icon, title, subtitle, accent, href }: SmartPlaylistCardProps) {
    const c = accentClasses[accent];
    const locked = !href;

    const inner = (
        <div className={`border p-4 rounded-2xl flex items-center gap-4 transition-all ${c.card} ${
            locked ? 'cursor-default' : `group ${c.cardHover} hover:-translate-y-0.5`
        }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${c.icon} ${locked ? '' : c.iconHover}`}>
                <Icon className={`w-6 h-6 ${c.iconText}`} />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-gray-100 ${locked ? '' : 'group-hover:text-white transition-colors'}`}>{title}</h3>
                {typeof subtitle === 'string'
                    ? <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                    : subtitle}
            </div>
            {locked && (
                <div className="flex items-center gap-1.5 shrink-0">
                    <Lock aria-hidden="true" className="w-3 h-3 text-gray-600" />
                    <span className="text-[10px] text-gray-600 font-medium">Members only</span>
                </div>
            )}
        </div>
    );

    return href ? <Link href={href}>{inner}</Link> : inner;
}

function PublicPlaylistsSection({
    playlists,
    userId,
}: {
    playlists: { id: string; title: string; description: string | null; owner_id: string }[];
    userId?: string;
}) {
    return (
        <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Public Playlists</p>
            {playlists.length === 0 ? (
                <p className="text-sm text-gray-600 italic py-2">No public playlists yet.</p>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {playlists.map(pl => (
                        <PublicPlaylistCard
                            key={pl.id}
                            id={pl.id}
                            title={pl.title}
                            description={pl.description}
                            isOwner={!!userId && pl.owner_id === userId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Views ────────────────────────────────────────────────────────────────────

function GuestView({ publicPlaylists }: { publicPlaylists: { id: string; title: string; description: string | null; owner_id: string }[] }) {
    return (
        <div className="space-y-8">

            {/* Smart Playlists — locked for guests */}
            <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Smart Playlists</p>
                <div className="grid grid-cols-1 gap-3">
                    <SmartPlaylistCard icon={Heart}   title="My Favorites" subtitle="Your favorited songs, always with you"      accent="amber"  />
                    <SmartPlaylistCard icon={Music}   title="My Songs"     subtitle="Songs you've contributed to the library"    accent="violet" />
                    <SmartPlaylistCard icon={PenLine} title="My Drafts"    subtitle="Your private work-in-progress songs"        accent="gray"   />
                </div>
            </div>

            {/* My Private Playlists — ghost demo */}
            <div>
                <div className="flex items-center justify-between mb-3">
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
                            className="flex items-center gap-1 text-xs font-semibold text-amber-400/50 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:text-amber-400/80 rounded-full px-3 py-1 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Create Playlist
                        </Link>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 opacity-40 pointer-events-none select-none">
                    <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
                        <div className="relative w-12 h-12 shrink-0">
                            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                                <Flame className="w-6 h-6 text-orange-500" />
                            </div>
                            <Lock aria-hidden="true" className="absolute -top-1 -right-1 w-3 h-3 text-gray-500" />
                            <span className="sr-only">Members only</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-100">Yage Ceremony 2024</h3>
                            <p className="text-xs text-gray-500 mt-0.5">12 songs</p>
                        </div>
                    </div>
                    <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
                        <div className="relative w-12 h-12 shrink-0">
                            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                                <Droplets className="w-6 h-6 text-blue-500" />
                            </div>
                            <Lock aria-hidden="true" className="absolute -top-1 -right-1 w-3 h-3 text-gray-500" />
                            <span className="sr-only">Members only</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-100">Temazcal — Water Songs</h3>
                            <p className="text-xs text-gray-500 mt-0.5">8 songs</p>
                        </div>
                    </div>
                </div>
            </div>

            <PublicPlaylistsSection playlists={publicPlaylists} />

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

    if (!user) return <GuestView publicPlaylists={publicPlaylists} />;

    // Fetch all user setlists
    const { data: setlists } = await supabase
        .from('setlists')
        .select('id, title, description, is_public, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    const myFavorites = setlists?.find(s => s.title === 'My Favorites');
    const privateSetlists = (setlists ?? []).filter(s => s.title !== 'My Favorites' && !s.is_public);

    // Fetch all setlist items with composition data in one query
    const allSetlistIds = (setlists ?? []).map(s => s.id);
    const songCounts: Record<string, SongCounts> = {};
    const songTitlesMap: Record<string, { index: number; title: string }[]> = {};

    if (allSetlistIds.length > 0) {
        const { data: items } = await supabase
            .from('setlist_items')
            .select(`
                setlist_id,
                order_index,
                song_versions(
                    compositions(is_public, title)
                )
            `)
            .in('setlist_id', allSetlistIds);

        for (const item of items ?? []) {
            const sid = item.setlist_id;
            if (!songCounts[sid]) songCounts[sid] = { total: 0, public: 0, draft: 0 };
            songCounts[sid].total++;
            const comp = (item.song_versions as any)?.compositions;
            if (comp?.is_public === true) songCounts[sid].public++;
            else songCounts[sid].draft++;
            if (comp?.title) {
                if (!songTitlesMap[sid]) songTitlesMap[sid] = [];
                songTitlesMap[sid].push({ index: item.order_index ?? 0, title: comp.title });
            }
        }
    }

    // Sort by order_index and take first 3 titles per setlist
    const songPreviewMap: Record<string, string> = {};
    for (const [sid, entries] of Object.entries(songTitlesMap)) {
        const titles = entries
            .sort((a, b) => a.index - b.index)
            .slice(0, 3)
            .map(e => e.title);
        const total = songCounts[sid]?.total ?? 0;
        songPreviewMap[sid] = titles.join(', ') + (total > titles.length ? '…' : '');
    }

    const favCounts: SongCounts = myFavorites
        ? (songCounts[myFavorites.id] ?? { total: 0, public: 0, draft: 0 })
        : { total: 0, public: 0, draft: 0 };

    return (
        <div className="space-y-8">

            {/* Smart Playlists */}
            <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Smart Playlists</p>
                <div className="grid grid-cols-1 gap-3">
                    <SmartPlaylistCard
                        icon={Heart}   title="My Favorites" accent="amber"
                        href="/songs?favorites=true"
                        subtitle={<SongCountSubtitle counts={favCounts} emptyLabel="No songs yet — tap ♥ on any song" />}
                    />
                    <SmartPlaylistCard icon={Music}   title="My Songs"  subtitle="Songs you've contributed to the library" accent="violet" href="/songs?mine=true" />
                    <SmartPlaylistCard icon={PenLine} title="My Drafts" subtitle="Your private work-in-progress songs"     accent="gray"   href="/songs?status=draft" />
                </div>
            </div>

            {/* My Private Playlists — real data */}
            <div>
                <div className="flex items-center justify-between mb-3">
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
                                    songTitlePreview={songPreviewMap[setlist.id]}
                                    subtitle={<SongCountSubtitle counts={counts} emptyLabel="No songs yet" />}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-600 italic py-2">No private playlists yet — create your first one above.</p>
                )}
            </div>

            <PublicPlaylistsSection playlists={publicPlaylists} userId={user.id} />

        </div>
    );
}
