import SongCard from "@/components/home/SongCard";
import { fetchSongsServer } from "@/lib/songs/serverQueries";
import Link from "next/link";

export default async function Home() {
  const songs = await fetchSongsServer(10);
  const displaySongs = songs.filter(song => song.isPublic);

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
            <p className="text-xs text-gray-500 mt-1">Add new</p>
          </Link>

          <Link href="/songs?favorites=true" className="bg-gray-900/50 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group text-left">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-3 group-hover:bg-amber-500/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star w-5 h-5 text-amber-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            </div>
            <h3 className="font-bold text-white">Favorites</h3>
            <p className="text-xs text-gray-500 mt-1">Your saved songs</p>
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
