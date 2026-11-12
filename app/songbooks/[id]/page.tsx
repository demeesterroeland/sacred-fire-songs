import { notFound } from 'next/navigation';
import { fetchSongbookServer } from '@/lib/songbooks/serverQueries';
import { getServerLocale } from '@/lib/i18n/server';
import { songbookIdFromParam } from '@/lib/songbooks/songbookPage';
import { SongbookPageContent } from '@/components/songbooks/SongbookPageContent';

/**
 * Story 6.2.11 / G2.2 (#514): `/songbooks/<id>`, the songs of one printed book by page. Open to guests; row-level security
 * leaves them the public songs. A book that does not exist, or none of whose songs the viewer can read, is a 404 (the
 * same answer, so a link does not reveal a book of private songs).
 */
export default async function SongbookPage({ params }: { params: Promise<{ id: string }> }) {
  const id = songbookIdFromParam((await params).id);
  const book = await fetchSongbookServer(id, await getServerLocale());
  if (!book) notFound();
  return <SongbookPageContent book={book} />;
}
