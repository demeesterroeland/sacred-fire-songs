import Link from 'next/link';
import { Sparkles, Music } from 'lucide-react';
import type { Song } from '@/lib/songUtils';

interface NewSinceLastVisitProps {
  songs: Song[];
}

export default function NewSinceLastVisit({ songs }: NewSinceLastVisitProps) {
  if (songs.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">New Since Last Visit</p>
        </div>
        <Link
          href="/songs?new=true"
          className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-wider"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {songs.map((song) => (
          <Link
            key={song.id}
            href={`/songs/${song.id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/30 border border-emerald-500/10 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/15 transition-colors">
              <Music className="w-4 h-4 text-emerald-500" />
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
