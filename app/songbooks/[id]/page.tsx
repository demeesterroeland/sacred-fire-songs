import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchSongbookServer } from '@/lib/songbooks/serverQueries';
import { getServerLocale } from '@/lib/i18n/server';
import { tWithLocale } from '@/lib/i18n';
import { songbookIdFromParam } from '@/lib/songbooks/songbookPage';
import { SongbookPageContent } from '@/components/songbooks/SongbookPageContent';

/** One read per request for the title and the page. */
const loadSongbook = cache(async (rawId: string) => fetchSongbookServer(songbookIdFromParam(rawId), await getServerLocale()));

/**
 * The tab shows the book's title. A book that does not exist or that the viewer cannot read gets the not-found title,
 * the same answer for both, so a tab title never reveals a book of private songs.
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const book = await loadSongbook((await params).id);
  return { title: book ? book.title : tWithLocale(await getServerLocale(), 'songbooks.notFound.title') };
}

/**
 * Story 6.2.11 / G2.2 (#514): `/songbooks/<id>`, the songs of one printed book by page. Open to guests; row-level security
 * leaves them the public songs. A book that does not exist, or none of whose songs the viewer can read, is a 404 (the
 * same answer, so a link does not reveal a book of private songs).
 */
export default async function SongbookPage({ params }: { params: Promise<{ id: string }> }) {
  const book = await loadSongbook((await params).id);
  if (!book) notFound();
  return <SongbookPageContent book={book} />;
}
