'use client';

import Link from 'next/link';
import { useLocale } from '@/context/LocaleContext';
import { formatSourceLines, type VersionSourceRow } from '@/lib/songs/versionSources';
import { songbookHref } from '@/lib/songbooks/songbookPage';
import { cn } from '@/lib/utils';

interface SongSourceLineProps {
  /** The sources of the version being shown; `undefined` for older cached song data that has none. */
  sources: ReadonlyArray<VersionSourceRow> | null | undefined;
  songTitle: string;
  className?: string;
}

/**
 * Story 6.2.10 / G2.1 (#513): grey source line under the lyrics — "Songbook A · p. 38 · compiled by Compiler A", one
 * line per source (primary first), with the original title when it differs. Nothing (and no space) without sources.
 * Story 6.2.11 (#511) moves this into the collapsible "About this song". The line is a link to the songbook's page,
 * at the row of this source (#514); the book's name is underlined so it reads as one.
 */
export function SongSourceLine({ sources, songTitle, className }: SongSourceLineProps) {
  const { t, locale } = useLocale();
  const lines = formatSourceLines(sources, songTitle, t, locale);
  if (lines.length === 0) return null;
  return (
    <ul aria-label={t(lines.length > 1 ? 'song.source.labelMany' : 'song.source.label')} data-testid="song-source-line" className={cn('space-y-1 text-meta text-fg-muted', className)}>
      {lines.map((line) => (
        <li key={line.id} data-testid="song-source-item">
          <Link href={songbookHref(line.bookId, line.id)} className="inline-flex min-h-tap items-center hover:text-fg">
            <span>
              <span className="underline underline-offset-2">{line.name}</span>
              {line.rest ? ` · ${line.rest}` : ''}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
