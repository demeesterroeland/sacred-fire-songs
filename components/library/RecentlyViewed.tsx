import Link from 'next/link';
import { Clock, Music } from 'lucide-react';
import type { Song } from '@/lib/songUtils';

interface RecentlyViewedProps {
  songs: Song[];
}

export default function RecentlyViewed({ songs }: RecentlyViewedProps) {
  if (songs.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5 text-gray-500" />
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Recently Viewed</p>
      </div>
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
    </div>
  );
}
