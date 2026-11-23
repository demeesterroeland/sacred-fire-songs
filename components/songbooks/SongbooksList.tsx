'use client';

import Link from 'next/link';
import { ListRow } from '@/components/ui/list-row';
import { useLocale } from '@/context/LocaleContext';
import { songbookHref } from '@/lib/songbooks/songbookPage';
import type { SongbookSummary } from '@/lib/songbooks/serverQueries';

/** Story 6.2.11 / G2.2 (#514): the songbooks as list rows — title, then one grey line "Compiler A · 12 songs". */
export function SongbooksList({ books }: { books: SongbookSummary[] }) {
  const { t } = useLocale();
  if (books.length === 0) {
    return <p className="text-meta text-fg-muted italic py-8 text-center">{t('songbooks.emptyHint')}</p>;
  }
  return (
    <div className="border-t border-line" data-testid="songbook-rows">
      {books.map((book) => (
        <ListRow
          key={book.id}
          asChild
          title={book.title}
          meta={[book.compiler, book.songCount === 1 ? t('playlists.songCountSingle') : t('playlists.songCount', { count: book.songCount })]}
          className="ps-4 pe-1"
        >
          <Link href={songbookHref(book.id)} data-testid="songbook-row" />
        </ListRow>
      ))}
    </div>
  );
}
