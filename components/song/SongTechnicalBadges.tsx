'use client';

import Link from 'next/link';
import { Guitar, Music, Mic } from 'lucide-react';

interface SongTechnicalBadgesProps {
  hasChords?: boolean;
  hasMelody?: boolean;
  hasPersonalRecording?: boolean;
}

export function SongTechnicalBadges({
  hasChords,
  hasMelody,
  hasPersonalRecording,
}: SongTechnicalBadgesProps) {
  if (!hasChords && !hasMelody && !hasPersonalRecording) return null;

  return (
    <div className="flex items-center gap-2">
      {hasChords && (
        <Link
          href="/songs?chords=true"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm bg-amber-500/5 border border-amber-500/30 text-amber-500 hover:bg-amber-500/15 transition-colors"
        >
          <Guitar className="w-3 h-3" /> Chords
        </Link>
      )}
      {hasMelody && (
        <Link
          href="/songs?melody=true"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm bg-emerald-500/5 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/15 transition-colors"
        >
          <Music className="w-3 h-3" /> Melody
        </Link>
      )}
      {hasPersonalRecording && (
        <Link
          href="/songs?myRecordings=true"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm bg-violet-500/5 border border-violet-500/30 text-violet-400 hover:bg-violet-500/15 transition-colors"
        >
          <Mic className="w-3 h-3" /> Recording
        </Link>
      )}
    </div>
  );
}
