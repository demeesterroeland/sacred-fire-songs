'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ArtistSummary } from '@/lib/songs/serverQueries';

const GRADIENTS: [string, string][] = [
    ['#ef4444', '#f97316'],
    ['#8b5cf6', '#6366f1'],
    ['#10b981', '#059669'],
    ['#f59e0b', '#d97706'],
    ['#3b82f6', '#2563eb'],
    ['#ec4899', '#db2777'],
    ['#14b8a6', '#0d9488'],
    ['#f43f5e', '#e11d48'],
];

function getArtistGradient(name: string): [string, string] {
    const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return GRADIENTS[hash % GRADIENTS.length];
}

export default function ArtistsPageContent({ artists }: { artists: ArtistSummary[] }) {
    if (artists.length === 0) {
        return (
            <p className="text-sm text-gray-600 italic py-8 text-center">
                No artists yet — songs added to the library will appear here.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-1">
            {artists.map((artist) => {
                const [from, to] = getArtistGradient(artist.name);
                const initial = artist.name.charAt(0).toUpperCase();
                const subtitle = [
                    `${artist.songCount} song${artist.songCount !== 1 ? 's' : ''}`,
                    ...artist.topCategories,
                ].join(' · ');

                return (
                    <Link
                        key={artist.name}
                        href={`/songs?search=${encodeURIComponent(artist.name)}`}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors group"
                    >
                        <div
                            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-base shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                        >
                            {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-gray-950 dark:group-hover:text-white transition-colors">
                                {artist.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {subtitle}
                            </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-700 shrink-0 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
                    </Link>
                );
            })}
        </div>
    );
}
