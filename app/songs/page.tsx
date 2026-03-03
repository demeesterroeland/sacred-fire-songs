import { Suspense } from 'react';
import SongsPageContent from './SongsPageContent';
import { fetchSongsPageServer, fetchCategoryTreeServer } from '@/lib/songs/serverQueries';

export default async function SongsPage() {
  const [songsData, taxonomy] = await Promise.all([
    fetchSongsPageServer(),
    fetchCategoryTreeServer(),
  ]);

  return (
    <Suspense fallback={
      <div className="flex-1 min-h-0 bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <SongsPageContent 
        initialSongs={songsData.songs} 
        initialNextCursor={songsData.nextCursor}
        initialTotalCount={songsData.totalCount}
        initialTaxonomy={taxonomy} 
      />
    </Suspense>
  );
}
