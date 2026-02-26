'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import SongCard from '@/components/home/SongCard';
import type { Song } from '@/lib/songUtils';

interface FavoritesPageContentProps {
    initialSongs: Song[];
}

export default function FavoritesPageContent({ initialSongs }: FavoritesPageContentProps) {
    const songs = initialSongs;

    return (
        <main className="flex-1 bg-gray-950 min-h-screen">
            {/* Hero */}
            <div className="relative overflow-hidden">
                {/* Ambient amber glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-950/50 via-amber-950/20 to-transparent pointer-events-none" />
                {/* Radial warm centre */}
                <div className="absolute top-0 left-1/4 w-96 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 px-6 pt-10 pb-8 max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <Heart
                            className="w-8 h-8 fill-amber-400 text-amber-400 heart-glow shrink-0"
                            strokeWidth={1.5}
                        />
                        <h1 className="text-2xl font-bold text-white tracking-tight">My Favorites</h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-11">Songs you&apos;ve called to your heart</p>
                    {songs.length > 0 && (
                        <p className="text-amber-400/50 text-xs mt-2 ml-11">
                            {songs.length} {songs.length === 1 ? 'song' : 'songs'}
                        </p>
                    )}
                </div>

                {/* Bottom fade line */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-800/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="px-6 py-8 max-w-5xl mx-auto">
                {songs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {songs.map((song) => (
                            <SongCard
                                key={song.id}
                                id={song.id}
                                title={song.title}
                                author={song.author}
                                songKey={song.songKey}
                                accentColor={song.color}
                                isPublic={song.isPublic}
                                hasChords={song.hasChords}
                                hasMelody={song.hasMelody}
                                isFavorite={true}
                                categories={song.categories}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}
            </div>
        </main>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-amber-400/10 rounded-full blur-xl" />
                <Heart
                    className="relative w-14 h-14 text-amber-400/25"
                    strokeWidth={1}
                />
            </div>
            <p className="text-gray-400 text-base font-medium mb-1">Your sacred circle is empty</p>
            <p className="text-gray-600 text-sm">Tap ♥ on any song to add it here</p>
            <Link
                href="/songs"
                className="mt-8 inline-flex items-center gap-1.5 text-amber-400 text-sm border border-amber-400/20 rounded-full px-4 py-2 hover:bg-amber-400/10 transition-colors duration-200"
            >
                Browse Songs
            </Link>
        </div>
    );
}
