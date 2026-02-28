import SongCard from "@/components/home/SongCard";
import { fetchSongsServer } from "@/lib/songs/serverQueries";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Heart } from "lucide-react";

export default async function Home() {
  const [songs, supabase] = await Promise.all([fetchSongsServer(10), createClient()]);
  const displaySongs = songs.filter(song => song.isPublic);

  // Favorites count for dashboard card
  const { data: { user } } = await supabase.auth.getUser();
  const favCounts = { total: 0, public: 0, draft: 0 };
  if (user) {
    const { data: setlist } = await supabase
      .from('setlists')
      .select('id')
      .eq('owner_id', user.id)
      .eq('title', 'My Favorites')
      .maybeSingle();
    if (setlist) {
      const { data: items } = await supabase
        .from('setlist_items')
        .select('song_versions(compositions(is_public))')
        .eq('setlist_id', setlist.id);
      for (const item of items ?? []) {
        favCounts.total++;
        if ((item.song_versions as any)?.compositions?.is_public === true) favCounts.public++;
        else favCounts.draft++;
      }
    }
  }

  return (
    <main className="flex-1 min-h-0 bg-gray-950">

      {/* Dashboard Widgets Area */}
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">

        {/* Quick Stats / Actions */}
        <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/songs" className="bg-gray-900/50 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3 group-hover:bg-red-500/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music w-5 h-5 text-red-500"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
            </div>
            <h3 className="font-bold text-white">Search Songs</h3>
            <p className="text-xs text-gray-500 mt-1">View all</p>
          </Link>

          <Link href="/songs/add" className="bg-gray-900/50 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus w-5 h-5 text-blue-500"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </div>
            <h3 className="font-bold text-white">Add Song</h3>
            <p className="text-xs text-gray-500 mt-1">Add new lyrics and chords</p>
          </Link>

          <Link href="/songs?favorites=true" className="bg-gray-900/50 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-3 group-hover:bg-rose-500/20 transition-colors">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            </div>
            <h3 className="font-bold text-white">My Favorites</h3>
            {favCounts.total > 0 ? (
              <p className="text-xs text-gray-500 mt-1">
                {favCounts.total} song{favCounts.total !== 1 ? 's' : ''}{' · '}
                <span className="text-emerald-500/70">{favCounts.public} public</span>{' · '}
                <span className="text-amber-500/70">{favCounts.draft} draft</span>
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Your saved songs</p>
            )}
          </Link>

          <Link href="/account/settings" className="bg-gray-900/50 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group text-left">
            <div className="w-10 h-10 rounded-full bg-gray-500/10 flex items-center justify-center mb-3 group-hover:bg-gray-500/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings w-5 h-5 text-gray-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l-.15.09a2 2 0 0 0 .73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
            </div>
            <h3 className="font-bold text-white">Settings</h3>
            <p className="text-xs text-gray-500 mt-1">Account & preferences</p>
          </Link>
        </div>

        {/* Song List Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-white">10 Latest Songs</h3>
            <Link href="/songs" className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wider">View All</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySongs.length > 0 ? (
              displaySongs.map((song, index) => (
                <SongCard
                  key={index}
                  id={song.id}
                  title={song.title}
                  author={song.author}
                  songKey={song.songKey}
                  accentColor={song.color}
                  isPublic={song.isPublic}
                  hasChords={song.hasChords}
                  hasMelody={song.hasMelody}
                  isFavorite={song.isFavorite ?? false}
                  userId={user?.id}
                  categories={song.categories}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400 pt-10">No public songs found.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
