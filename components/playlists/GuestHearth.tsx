// components/playlists/GuestHearth.tsx
'use client';

import { useGuestFavorites } from '@/hooks/useGuestFavorites';
import { GuestBanner } from '@/components/common/GuestBanner';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export function GuestHearth() {
  const { ids } = useGuestFavorites();
  const count = ids.size;

  return (
    <div className="space-y-8">
      <GuestBanner
        message="These songs live here for now. Create an account to keep them forever."
        linkText="Join the circle"
        linkHref="/auth/sign-up"
      />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
          <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
            Your Hearth
          </h2>
          {count > 0 && (
            <span className="text-xs text-gray-500">({count} songs)</span>
          )}
        </div>

        {count === 0 ? (
          <div className="bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
              <Heart className="w-8 h-8 text-gray-700" />
            </div>
            <p className="text-gray-500 text-sm max-w-xs">
              Songs you touch with your heart will gather here.
            </p>
            <Link
              href="/songs"
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-amber-400 rounded-xl font-bold text-sm transition-all border border-white/5 active:scale-95"
            >
              Browse the library
            </Link>
          </div>
        ) : (
          <Link href="/songs?favorites=true">
            <div className="bg-amber-500/8 border border-amber-500/20 p-6 rounded-3xl flex items-center gap-4 group hover:bg-amber-500/15 hover:border-amber-500/35 transition-all hover:-translate-y-0.5">
              <div className="w-14 h-14 bg-amber-500/15 rounded-2xl flex items-center justify-center group-hover:bg-amber-500/25 transition-colors shrink-0">
                <Heart className="w-7 h-7 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors">Session Favorites</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {count} song{count !== 1 ? 's' : ''} saved in this circle
                </p>
              </div>
              <div className="ml-auto text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                <span className="material-symbols-outlined">chevron_right</span>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Example Playlists (Locked for guests) */}
      <div className="space-y-4 pt-4">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Global Collections</p>
        <div className="grid grid-cols-1 gap-4 opacity-40 grayscale-[0.5] pointer-events-none select-none">
          <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-100">Yage Ceremony 2024</h3>
              <p className="text-xs text-gray-500 mt-0.5">12 Songs</p>
            </div>
          </div>
          <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-500">water_drop</span>
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
