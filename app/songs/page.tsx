import { Suspense } from 'react';
import SongsPageContent from './SongsPageContent';
import { fetchSongsServer, fetchCategoryTreeServer } from '@/lib/songs/serverQueries';

export default async function SongsPage() {
  const [songs, taxonomy] = await Promise.all([
    fetchSongsServer(),
    fetchCategoryTreeServer(),
  ]);

  return (
    <Suspense fallback={
      <div className="flex-1 min-h-0 bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <SongsPageContent initialSongs={songs} initialTaxonomy={taxonomy} />
    </Suspense>
  );
}
