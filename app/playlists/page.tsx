import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Heart, Plus, ListMusic, Flame, Droplets } from 'lucide-react';

export default async function PlaylistsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Fetch all user setlists
    const { data: setlists } = await supabase
        .from('setlists')
        .select('id, title, description, is_public, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    const myFavorites = setlists?.find(s => s.title === 'My Favorites');
    const otherSetlists = (setlists ?? []).filter(s => s.title !== 'My Favorites');

    // Get favorites song count
    let favCount = 0;
    if (myFavorites) {
        const { count } = await supabase
            .from('setlist_items')
            .select('*', { count: 'exact', head: true })
            .eq('setlist_id', myFavorites.id);
        favCount = count ?? 0;
    }

    return (
        <main className="flex-1 min-w-0 overflow-y-auto bg-gray-950">
            {/* Page Actions */}
            <div className="px-8 py-4 max-w-5xl mx-auto flex justify-end">
                <button className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/20 active:scale-95">
                    <Plus className="w-4 h-4" />
                    Create Playlist
                </button>
            </div>

            <div className="p-8 max-w-5xl mx-auto space-y-8">

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
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {favCount > 0
                                        ? `${favCount} song${favCount !== 1 ? 's' : ''}`
                                        : 'No songs yet — tap ♥ on any song'}
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Other user setlists (real) */}
                {otherSetlists.length > 0 && (
                    <div>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">My Playlists</p>
                        <div className="grid grid-cols-1 gap-4">
                            {otherSetlists.map(setlist => (
                                <div key={setlist.id} className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4 group cursor-pointer hover:bg-gray-800/60 transition-all hover:-translate-y-0.5">
                                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-gray-700 transition-colors shrink-0">
                                        <ListMusic className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-100 group-hover:text-white transition-colors">{setlist.title}</h3>
                                        {setlist.description && (
                                            <p className="text-xs text-gray-500 mt-0.5">{setlist.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
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
        </main>
    );
}
