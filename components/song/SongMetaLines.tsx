'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { joinMeta } from '@/components/ui/meta-line';
import { songAuthors, songMetaItems, technicalItems, type VersionTechnical } from '@/lib/songs/songMeta';
import { cn } from '@/lib/utils';

interface CategoryItem {
  name: string;
  slug: string;
}

interface SongMetaLinesProps {
  originalAuthor?: string | null;
  categories?: CategoryItem[];
  version?: VersionTechnical;
  hasChords?: boolean;
  hasMelody?: boolean;
  hasPersonalRecording?: boolean;
  className?: string;
}

/**
 * Story 6.1.7 / G2.2 (#391): two grey lines above the lyrics.
 * Line 1 "Author · Tag · Tag" (tap to expand into links), line 2 "Key E · Capo 3 · Standard".
 */
export function SongMetaLines({
  originalAuthor,
  categories = [],
  version,
  hasChords,
  hasMelody,
  hasPersonalRecording,
  className,
}: SongMetaLinesProps) {
  const { t } = useLocale();
  const tr = t as (key: string, vars?: Record<string, string | number>) => string;
  const [open, setOpen] = useState(false);
  const listId = useId();
  const authors = songAuthors(originalAuthor, tr);
  const meta = joinMeta(songMetaItems(originalAuthor, categories, tr));
  const technical = joinMeta(technicalItems(version, tr));

  const links: { label: string; href: string }[] = [
    ...authors.map((a) => ({ label: a, href: `/songs?artist=${encodeURIComponent(a)}` })),
    ...categories.map((c) => ({ label: c.name, href: `/songs?tag=${encodeURIComponent(c.slug)}` })),
    ...(hasChords ? [{ label: t('song.technical.chords'), href: '/songs?chords=true' }] : []),
    ...(hasMelody ? [{ label: t('song.technical.melody'), href: '/songs?melody=true' }] : []),
    ...(hasPersonalRecording ? [{ label: t('song.technical.recording'), href: '/songs?myRecordings=true' }] : []),
  ];

  return (
    <div className={cn('text-meta text-fg-muted', className)} data-testid="song-meta-lines">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={listId}
        className="flex w-full min-h-tap items-center gap-1 text-left hover:text-fg transition-colors"
        data-testid="song-meta-line"
      >
        <span className={cn('min-w-0 flex-1', open ? 'whitespace-normal' : 'truncate')}>{meta}</span>
        <span className="sr-only">{open ? t('song.meta.hideTags') : t('song.meta.showTags')}</span>
        <ChevronDown
          aria-hidden
          className={cn('size-4 shrink-0 transition-transform motion-reduce:transition-none', open && 'rotate-180')}
        />
      </button>
      {open && (
        <ul id={listId} className="flex flex-wrap gap-x-1 pb-2">
          {links.map(({ label, href }, i) => (
            <li key={`${href}-${i}`}>
              <Link href={href} className="inline-flex min-h-tap items-center px-1 text-fg underline-offset-4 hover:underline">
                {label}
              </Link>
              {i < links.length - 1 && <span aria-hidden> ·</span>}
            </li>
          ))}
        </ul>
      )}
      {technical && (
        <p className="truncate" data-testid="song-technical-line">
          {technical}
        </p>
      )}
    </div>
  );
}
