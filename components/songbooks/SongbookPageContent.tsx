'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { LibrarySubpageHeading } from '@/components/library/LibrarySubpageHeading';
import { VisibilityIcon } from '@/components/common/VisibilityIcon';
import { ListRow } from '@/components/ui/list-row';
import { MetaLine } from '@/components/ui/meta-line';
import { useLocale } from '@/context/LocaleContext';
import { songAuthors } from '@/lib/songs/authors';
import { pageLabel } from '@/lib/songs/versionSources';
import { songbookSongHref, sourceAnchor, type SongbookEntry } from '@/lib/songbooks/songbookPage';
import type { SongbookDetail } from '@/lib/songbooks/serverQueries';

/**
 * Story 6.2.11 / G2.2 (#514): one songbook — title with its song count, who compiled it, its attribution, then the songs
 * by page (a page label, the title and one grey line with the original title and the authors). Each row opens the
 * version printed there. Every row carries the anchor of its source (`#source-<id>`), so the source line on the
 * song page can jump to it.
 */
export function SongbookPageContent({ book }: { book: SongbookDetail }) {
  const { t } = useLocale();
  const meta = [book.compiler ? t('song.source.compiledBy', { compiler: book.compiler }) : null, book.community, book.year ? String(book.year) : null];
  return (
    <div>
      <LibrarySubpageHeading icon={BookOpen} title={book.title} count={book.songCount} level={1} className="mb-1" />
      <MetaLine items={meta} data-testid="songbook-meta" className="mb-2 whitespace-normal" />
      {book.attribution ? (
        <p data-testid="songbook-attribution" className="mb-4 whitespace-pre-line text-meta text-fg-muted">
          {book.attribution}
        </p>
      ) : null}
      {book.entries.length === 0 ? (
        <p className="mt-6 py-8 text-center text-meta italic text-fg-muted">{t('songbooks.empty')}</p>
      ) : (
        <ul aria-label={t('songbooks.listLabel')} className="mt-4 border-t border-line" data-testid="songbook-song-rows">
          {book.entries.map((entry) => (
            <SongbookSongRow key={entry.key} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SongbookSongRow({ entry }: { entry: SongbookEntry }) {
  const { t } = useLocale();
  const author = entry.originalAuthor === 'Unknown' ? null : entry.originalAuthor;
  const authors = songAuthors({ authors: entry.authors, originalAuthor: author }, t).join(', ');
  const page = pageLabel(entry.page, t);
  const [first, ...others] = entry.sourceIds;
  return (
    // The first source id is the row's own id; a second version on the same page keeps a (silent) anchor of its own.
    // `:target` then matches that empty span, so the row highlights through `has-[:target]` and the span keeps the offset.
    <li id={sourceAnchor(first)} className="scroll-mt-24 border-b border-line last:border-b-0 target:bg-surface has-[:target]:bg-surface">
      {others.map((id) => (
        <span key={id} id={sourceAnchor(id)} className="scroll-mt-24" />
      ))}
      <ListRow
        asChild
        title={entry.title}
        meta={[page ? null : t('songbooks.noPage'), entry.originalTitle ? t('song.source.originalTitle', { title: entry.originalTitle }) : null, authors]}
        leading={<span className="inline-block min-w-14 whitespace-nowrap text-meta tabular-nums">{page}</span>}
        trailing={entry.isPublic ? null : <VisibilityIcon isPublic={false} className="size-4 text-fg-subtle" />}
        className="ps-4 pe-3 border-b-0"
      >
        <Link href={songbookSongHref(entry)} data-testid="songbook-song-row" />
      </ListRow>
    </li>
  );
}
