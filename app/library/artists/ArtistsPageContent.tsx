'use client';

import Link from 'next/link';
import { Mic2 } from 'lucide-react';
import { CardContent } from '@/components/common/CardContent';
import type { ArtistSummary } from '@/lib/songs/serverQueries';

export default function ArtistsPageContent({ artists }: { artists: ArtistSummary[] }) {
    if (artists.length === 0) {
        return (
            <p className="text-sm text-gray-600 italic py-8 text-center">
                No artists yet — songs added to the library will appear here.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3">
            {artists.map((artist) => {
                const songLabel = `${artist.songCount} song${artist.songCount !== 1 ? 's' : ''}`;

                return (
                    <Link
                        key={artist.name}
                        href={`/songs?search=${encodeURIComponent(artist.name)}`}
                        className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl group hover:bg-gray-100/60 dark:hover:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700 transition-all hover:-translate-y-0.5"
                    >
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-gray-700 transition-colors shrink-0">
                            <Mic2 className="w-6 h-6 text-gray-400" />
                        </div>

                        <CardContent
                            title={artist.name}
                            subtitle={<span className="whitespace-nowrap">{songLabel}</span>}
                            songTitles={artist.songTitles}
                        />
                    </Link>
                );
            })}
        </div>
    );
}
