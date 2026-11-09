'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { joinMeta } from '@/components/ui/meta-line';
import { songAuthors, technicalItems, type VersionTechnical } from '@/lib/songs/songMeta';
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
  expanded?: boolean;
  toggleRef?: React.Ref<HTMLButtonElement>;
  onToggleExpanded?: () => void;
}

/**
 * Story 6.1.7 / G2.2 (#391), Validation 3 and 4: grey lines above the lyrics.
 * Line 1: author and tags, always as links (validation 4: production songs have at most 7 tags, p95 55 characters,
 * so they fit on one or two lines). The chevron at the end opens the rest: Chords · Melody · Recordings links and
 * the technical line "Key E · Capo 3 · Standard". Closed by default.
 */
export function SongMetaLines({
  originalAuthor,
  categories = [],
  version,
  hasChords,
  hasMelody,
  hasPersonalRecording,
  className,
  expanded,
  onToggleExpanded,
  toggleRef,
}: SongMetaLinesProps) {
  const { t } = useLocale();
  const tr = t as (key: string, vars?: Record<string, string | number>) => string;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = expanded !== undefined ? expanded : internalOpen;
  const listId = useId();
  const detailsId = useId();
  const authors = songAuthors(originalAuthor, tr);
  const technical = joinMeta(technicalItems(version, tr));

  const links: { label: string; href: string }[] = [
    ...authors.map((a) => ({ label: a, href: `/songs?artist=${encodeURIComponent(a)}` })),
    ...categories.map((c) => ({ label: c.name, href: `/songs?tag=${encodeURIComponent(c.slug)}` })),
    ...(open && hasChords ? [{ label: t('song.technical.chords'), href: '/songs?chords=true' }] : []),
    ...(open && hasMelody ? [{ label: t('song.technical.melody'), href: '/songs?melody=true' }] : []),
    ...(open && hasPersonalRecording ? [{ label: t('song.technical.takes'), href: '/songs?myRecordings=true' }] : []),
  ];

  const handleToggle = () => {
    if (onToggleExpanded) onToggleExpanded();
    else setInternalOpen((o) => !o);
  };

  return (
    <div className={cn('text-meta text-fg-muted', className)} data-testid="song-meta-lines">
      {/* One button for both states, so keyboard focus stays on it when it toggles. */}
      <div className="flex items-start gap-1">
        <ul id={listId} className="flex min-w-0 flex-1 flex-wrap gap-x-1">
          {links.map(({ label, href }, i) => (
            <li key={`${href}-${i}`}>
              <Link href={href} className="inline-flex min-h-tap items-center px-1 text-fg underline underline-offset-4">
                {label}
              </Link>
              {i < links.length - 1 && <span aria-hidden> ·</span>}
            </li>
          ))}
        </ul>
        <button
          ref={toggleRef}
          type="button"
          onClick={handleToggle}
          aria-expanded={open}
          aria-controls={`${listId} ${detailsId}`}
          aria-label={open ? t('song.meta.hideDetails') : t('song.meta.showDetails')}
          className="flex size-tap shrink-0 items-center justify-center rounded-control hover:text-fg transition-colors"
          data-testid="song-meta-line"
        >
          <ChevronDown
            aria-hidden
            className={cn('size-4 shrink-0 transition-transform motion-reduce:transition-none', open && 'rotate-180')}
          />
        </button>
      </div>
      <div id={detailsId} hidden={!open}>
        {open && technical && (
          <p className="truncate mt-1" data-testid="song-technical-line">
            {technical}
          </p>
        )}
      </div>
    </div>
  );
}
