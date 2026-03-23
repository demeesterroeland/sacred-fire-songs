import { Suspense } from 'react';
import SongsPageContent from './SongsPageContent';
import { fetchSongsServer, fetchCategoryTreeServer, getViewedSongIds } from '@/lib/songs/serverQueries';
import { createClient } from '@/lib/supabase/server';

export default async function SongsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [songs, taxonomy, viewedSongIds] = await Promise.all([
    fetchSongsServer(),
    fetchCategoryTreeServer(),
    user ? getViewedSongIds(user.id) : Promise.resolve([]),
  ]);

  return (
    <Suspense fallback={
      <div className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <SongsPageContent
        initialSongs={songs}
        initialTaxonomy={taxonomy}
        initialViewedSongIds={viewedSongIds}
      />
    </Suspense>
  );
}
