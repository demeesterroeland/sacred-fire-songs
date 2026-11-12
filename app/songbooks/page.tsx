import { BookOpen } from 'lucide-react';
import { fetchSongbooksServer } from '@/lib/songbooks/serverQueries';
import { getServerLocale } from '@/lib/i18n/server';
import { tWithLocale } from '@/lib/i18n';
import { LibrarySubpageHeading } from '@/components/library/LibrarySubpageHeading';
import { SongbooksList } from '@/components/songbooks/SongbooksList';

/**
 * Story 6.2.11 / G2.2 (#514): the printed songbooks with their song counts. Row-level security decides what the viewer
 * counts: guests the public songs, members also their own and shared ones. Open to guests (no gate).
 */
export default async function SongbooksPage() {
  const locale = await getServerLocale();
  const books = await fetchSongbooksServer(locale);
  return (
    <div>
      <LibrarySubpageHeading icon={BookOpen} title={tWithLocale(locale, 'songbooks.pageTitle')} count={books.length} />
      <SongbooksList books={books} />
    </div>
  );
}
