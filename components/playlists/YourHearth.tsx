'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart, ListMusic, Plus, ChevronRight, Flame } from 'lucide-react';
import Link from 'next/link';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import { getSetlists } from '@/app/actions/setlists';
import { Loader2 } from 'lucide-react';

export default function YourHearth() {
    const { data: setlists, isLoading } = useQuery({
        queryKey: SONG_KEYS.setlists(),
        queryFn: async () => {
            const result = await getSetlists();
            if ('error' in result) throw new Error(result.error);
            return result.setlists;
        },
    });

    const myFavorites = setlists?.find(s => s.title === 'My Favorites');
    const otherSetlists = (setlists ?? []).filter(s => s.title !== 'My Favorites');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h2 className="text-xl font-bold text-white tracking-tight">Your Hearth</h2>
                </div>
                <Link 
                    href="/library/playlists" 
                    className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors flex items-center gap-1"
                >
                    View All <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* My Favorites Smart Playlist */}
                <Link href="/songs?favorites=true">
                    <div className="bg-amber-500/[0.08] border border-amber-500/20 p-5 rounded-2xl hover:bg-amber-500/15 hover:border-amber-500/35 transition-all group h-full flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center group-hover:bg-amber-500/25 transition-colors">
                                <Heart className="w-6 h-6 text-amber-400 fill-amber-400" />
                            </div>
                            <span className="text-[10px] font-black bg-amber-500/10 text-amber-500/70 px-2 py-1 rounded uppercase tracking-tighter">Smart</span>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">My Favorites</h3>
                            <p className="text-xs text-gray-500 mt-1">Your personally hearted medicine songs.</p>
                        </div>
                    </div>
                </Link>

                {/* Latest Manual Playlist */}
                {otherSetlists.length > 0 ? (
                    <Link href={`/library/playlists/${otherSetlists[0].id}`}>
                        <div className="bg-emerald-500/[0.08] border border-emerald-500/20 p-5 rounded-2xl hover:bg-emerald-500/15 hover:border-emerald-500/35 transition-all group h-full flex flex-col justify-between">
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center group-hover:bg-emerald-500/25 transition-colors">
                                    <ListMusic className="w-6 h-6 text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500/70 px-2 py-1 rounded uppercase tracking-tighter">Collection</span>
                            </div>
                            <div className="mt-4">
                                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{otherSetlists[0].title}</h3>
                                <p className="text-xs text-gray-500 mt-1 truncate">{otherSetlists[0].description || 'No description'}</p>
                            </div>
                        </div>
                    </Link>
                ) : (
                    <Link href="/library/playlists">
                        <div className="bg-gray-900/40 border border-dashed border-gray-800 p-5 rounded-2xl hover:bg-gray-800/60 hover:border-gray-700 transition-all group h-full flex flex-col items-center justify-center text-center">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-3 group-hover:bg-emerald-500/10 transition-colors">
                                <Plus className="w-5 h-5 text-gray-500 group-hover:text-emerald-500" />
                            </div>
                            <p className="text-xs font-bold text-gray-500 group-hover:text-gray-300 transition-colors">Create your first collection</p>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
}
