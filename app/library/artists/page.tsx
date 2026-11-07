import { Mic2 } from 'lucide-react';
import { fetchArtistsServer } from '@/lib/songs/serverQueries';
import { getServerT } from '@/lib/i18n/server';
import { LibrarySubpageHeading } from '@/components/library/LibrarySubpageHeading';
import ArtistsPageContent from './ArtistsPageContent';

// Aggregates all songs visible to the user (RLS handles visibility)
export default async function ArtistsPage() {
    const t = await getServerT();
    const artists = await fetchArtistsServer();

    return (
        <div>
            <LibrarySubpageHeading icon={Mic2} title={t('artists.pageTitle')} count={artists.length} />
            <ArtistsPageContent artists={artists} />
        </div>
    );
}
