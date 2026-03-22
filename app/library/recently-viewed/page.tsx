import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Clock, Music } from 'lucide-react';
import { getRecentlyViewedLight } from '@/lib/songs/serverQueries';

export default async function RecentlyViewedPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login?next=/library/recently-viewed');

    const songs = await getRecentlyViewedLight(user.id, 50);

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recently Viewed</h2>
                <span className="text-xs text-gray-600 ml-1">({songs.length})</span>
            </div>

            {songs.length === 0 ? (
                <p className="text-sm text-gray-600 italic py-8 text-center">
                    No recently viewed songs yet. Start exploring to see your history here.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {songs.map((song) => (
                        <Link
                            key={song.id}
                            href={`/songs/${song.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/30 border border-gray-800/50 hover:bg-gray-800/50 hover:border-gray-700/50 transition-all group"
                        >
                            <div className="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center shrink-0 group-hover:bg-gray-700/80 transition-colors">
                                <Music className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-white transition-colors">{song.title}</p>
                                {song.author && (
                                    <p className="text-xs text-gray-500 truncate">{song.author}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
