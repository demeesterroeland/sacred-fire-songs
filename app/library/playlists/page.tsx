import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Heart, ListMusic, Flame, Droplets, Lock, Globe, Users, PenLine, Music } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CreatePlaylistInput } from '@/components/playlists/CreatePlaylistInput';
import { PlaylistCard } from '@/components/playlists/PlaylistCard';

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

/** Identical in both guest and auth views — rendered once from a shared component. */
function PublicPlaylistsSection() {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Public Playlists</p>
                <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 uppercase tracking-wider">Coming Soon</span>
            </div>
            <div className="grid grid-cols-1 gap-3 opacity-40 pointer-events-none select-none">
                <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-100">Ceremony Night – Agua y Fuego</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Community Playlist · 14 songs</p>
                    </div>
                </div>
                <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-100">Opening Circle Icaros</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Community Playlist · 9 songs</p>
                    </div>
                </div>
            </div>
            <p className="text-xs text-gray-600 italic mt-3">
                Public playlists shared by community members — coming soon.
            </p>
        </div>
    );
}

// ─── Views ────────────────────────────────────────────────────────────────────

function GuestView() {
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

            {/* My Playlists — ghost demo */}
            <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">My Playlists</p>
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

            <PublicPlaylistsSection />

        </div>
    );
}

export default async function PlaylistsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <GuestView />;

    // Fetch all user setlists
    const { data: setlists } = await supabase
        .from('setlists')
        .select('id, title, description, is_public, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    const myFavorites = setlists?.find(s => s.title === 'My Favorites');
    const otherSetlists = (setlists ?? []).filter(s => s.title !== 'My Favorites');

    // Fetch all setlist items with composition is_public in one query
    const allSetlistIds = (setlists ?? []).map(s => s.id);
    const songCounts: Record<string, SongCounts> = {};

    if (allSetlistIds.length > 0) {
        const { data: items } = await supabase
            .from('setlist_items')
            .select(`
                setlist_id,
                song_versions(
                    compositions(is_public)
                )
            `)
            .in('setlist_id', allSetlistIds);

        for (const item of items ?? []) {
            const sid = item.setlist_id;
            if (!songCounts[sid]) songCounts[sid] = { total: 0, public: 0, draft: 0 };
            songCounts[sid].total++;
            const isPublic = (item.song_versions as any)?.compositions?.is_public;
            if (isPublic === true) songCounts[sid].public++;
            else songCounts[sid].draft++;
        }
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

            {/* My Playlists — real data */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">My Playlists</p>
                    <CreatePlaylistInput />
                </div>
                {otherSetlists.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {otherSetlists.map(setlist => {
                            const counts = songCounts[setlist.id] ?? { total: 0, public: 0, draft: 0 };
                            return (
                                <PlaylistCard
                                    key={setlist.id}
                                    id={setlist.id}
                                    title={setlist.title}
                                    subtitle={<SongCountSubtitle counts={counts} emptyLabel={setlist.description ?? 'No songs yet'} />}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-600 italic py-2">No playlists yet — create your first one above.</p>
                )}
            </div>

            <PublicPlaylistsSection />

        </div>
    );
}
