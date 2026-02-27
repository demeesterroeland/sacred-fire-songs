import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Heart, Plus, ListMusic, Flame, Droplets } from 'lucide-react';

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

export default async function PlaylistsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

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

            {/* Page Actions */}
            <div className="flex justify-end">
                <button className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/20 active:scale-95">
                    <Plus className="w-4 h-4" />
                    Create Playlist
                </button>
            </div>

            {/* My Favorites — smart playlist, always shown */}
            <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Smart Playlist</p>
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

            {/* Placeholder playlists — shown until real setlist creation is built */}
            <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Example Playlists</p>
                <div className="grid grid-cols-1 gap-4 opacity-40 pointer-events-none select-none">
                    <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                            <Flame className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-100">Yage Ceremony 2024</h3>
                            <p className="text-xs text-gray-500 mt-0.5">12 Songs</p>
                        </div>
                    </div>
                    <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                            <Droplets className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-100">Temazcal — Water Songs</h3>
                            <p className="text-xs text-gray-500 mt-0.5">8 Songs</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
