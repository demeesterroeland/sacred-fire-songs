import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Heart, ListMusic, Flame, Droplets, Lock, LogIn, Globe, Users, PenLine, Music } from 'lucide-react';

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

function GuestView() {
    return (
        <div className="space-y-8">

            {/* Sign-in nudge — above the fold */}
            <Link
                href="/auth/login"
                className="flex items-center gap-3 bg-gray-800/60 border border-gray-700/60 hover:border-gray-600 hover:bg-gray-800 p-4 rounded-2xl transition-all group"
            >
                <div className="w-9 h-9 bg-gray-700/60 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-gray-700 transition-colors">
                    <LogIn aria-hidden="true" className="w-4 h-4 text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">Sign in to manage your playlists</p>
                    <p className="text-xs text-gray-500 mt-0.5">Create setlists, save favorites, and more</p>
                </div>
                <span aria-hidden="true" className="text-gray-500 group-hover:text-gray-300 transition-colors text-sm">→</span>
            </Link>

            {/* Section 1: Smart Playlists — locked */}
            <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Smart Playlists</p>
                <div className="grid grid-cols-1 gap-3">

                    {/* My Favorites */}
                    <div className="bg-amber-500/8 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4 cursor-default">
                        <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center shrink-0">
                            <Heart className="w-6 h-6 text-amber-400 fill-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-100">My Favorites</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Your favorited songs, always with you</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Lock aria-hidden="true" className="w-3 h-3 text-gray-600" />
                            <span className="text-[10px] text-gray-600 font-medium">Members only</span>
                        </div>
                    </div>

                    {/* My Songs */}
                    <div className="bg-red-500/8 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 cursor-default">
                        <div className="w-12 h-12 bg-red-500/15 rounded-xl flex items-center justify-center shrink-0">
                            <Music className="w-6 h-6 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-100">My Songs</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Songs you've contributed to the library</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Lock aria-hidden="true" className="w-3 h-3 text-gray-600" />
                            <span className="text-[10px] text-gray-600 font-medium">Members only</span>
                        </div>
                    </div>

                    {/* My Drafts */}
                    <div className="bg-gray-800/40 border border-gray-700/40 p-4 rounded-2xl flex items-center gap-4 cursor-default">
                        <div className="w-12 h-12 bg-gray-700/40 rounded-xl flex items-center justify-center shrink-0">
                            <PenLine className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-100">My Drafts</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Your private work-in-progress songs</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Lock aria-hidden="true" className="w-3 h-3 text-gray-600" />
                            <span className="text-[10px] text-gray-600 font-medium">Members only</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Section 2: Public Playlists — coming soon + ghost demo */}
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

            {/* Section 3: My Playlists — demo ghost + sign-in nudge */}
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

            {/* Smart Playlists — always shown */}
            <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Smart Playlists</p>
                <div className="grid grid-cols-1 gap-3">
                    <Link href="/songs?favorites=true">
                        <div className="bg-amber-500/8 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4 group hover:bg-amber-500/15 hover:border-amber-500/35 transition-all hover:-translate-y-0.5">
                            <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center group-hover:bg-amber-500/25 transition-colors shrink-0">
                                <Heart className="w-6 h-6 text-amber-400 fill-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-100 group-hover:text-white transition-colors">My Favorites</h3>
                                <SongCountSubtitle counts={favCounts} emptyLabel="No songs yet — tap ♥ on any song" />
                            </div>
                        </div>
                    </Link>

                    {/* My Songs */}
                    <Link href="/songs?mine=true">
                        <div className="bg-red-500/8 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 group hover:bg-red-500/15 hover:border-red-500/35 transition-all hover:-translate-y-0.5">
                            <div className="w-12 h-12 bg-red-500/15 rounded-xl flex items-center justify-center group-hover:bg-red-500/25 transition-colors shrink-0">
                                <Music className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-100 group-hover:text-white transition-colors">My Songs</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Songs you've contributed to the library</p>
                            </div>
                        </div>
                    </Link>

                    {/* My Drafts */}
                    <Link href="/songs?status=draft">
                        <div className="bg-gray-800/40 border border-gray-700/40 p-4 rounded-2xl flex items-center gap-4 group hover:bg-gray-800/70 hover:border-gray-600/60 transition-all hover:-translate-y-0.5">
                            <div className="w-12 h-12 bg-gray-700/40 rounded-xl flex items-center justify-center group-hover:bg-gray-700/60 transition-colors shrink-0">
                                <PenLine className="w-6 h-6 text-gray-400 group-hover:text-gray-300 transition-colors" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-100 group-hover:text-white transition-colors">My Drafts</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Your private work-in-progress songs</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Other user setlists (real) */}
            {otherSetlists.length > 0 && (
                <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">My Playlists</p>
                    <div className="grid grid-cols-1 gap-4">
                        {otherSetlists.map(setlist => {
                            const counts = songCounts[setlist.id] ?? { total: 0, public: 0, draft: 0 };
                            return (
                                <div key={setlist.id} className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4 group cursor-pointer hover:bg-gray-800/60 transition-all hover:-translate-y-0.5">
                                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-gray-700 transition-colors shrink-0">
                                        <ListMusic className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-100 group-hover:text-white transition-colors">{setlist.title}</h3>
                                        <SongCountSubtitle counts={counts} emptyLabel={setlist.description ?? 'No songs yet'} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Public Playlists — coming soon */}
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

        </div>
    );
}
