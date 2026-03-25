import { Mic2 } from 'lucide-react';
import { fetchArtistsServer } from '@/lib/songs/serverQueries';
import ArtistsPageContent from './ArtistsPageContent';

export default async function ArtistsPage() {
    const artists = await fetchArtistsServer();

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Mic2 className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Artists
                </h2>
                <span className="text-xs text-gray-600 ml-1">({artists.length})</span>
            </div>
            <ArtistsPageContent artists={artists} />
        </div>
    );
}
