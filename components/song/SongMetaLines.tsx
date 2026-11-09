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
  expanded?: boolean;
  toggleRef?: React.Ref<HTMLButtonElement>;
  onToggleExpanded?: () => void;
}

/**
 * Story 6.1.7 / G2.2 (#391), Validation 3: two grey lines above the lyrics.
 * Line 1 "Author · Tag · Tag" (tap to expand into links), line 2 "Key E · Capo 3 · Standard"
 * moved inside expand/collapse, closed by default.
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
  const authors = songAuthors(originalAuthor, tr);
  const meta = joinMeta(songMetaItems(originalAuthor, categories, tr));
  const technical = joinMeta(technicalItems(version, tr));

  const links: { label: string; href: string }[] = [
    ...authors.map((a) => ({ label: a, href: `/songs?artist=${encodeURIComponent(a)}` })),
    ...categories.map((c) => ({ label: c.name, href: `/songs?tag=${encodeURIComponent(c.slug)}` })),
    ...(hasChords ? [{ label: t('song.technical.chords'), href: '/songs?chords=true' }] : []),
    ...(hasMelody ? [{ label: t('song.technical.melody'), href: '/songs?melody=true' }] : []),
    ...(hasPersonalRecording ? [{ label: t('song.technical.takes'), href: '/songs?myRecordings=true' }] : []),
  ];

  const handleToggle = () => {
    if (onToggleExpanded) onToggleExpanded();
    else setInternalOpen((o) => !o);
  };

  return (
    <div className={cn('text-meta text-fg-muted', className)} data-testid="song-meta-lines">
      {/* One row, one button for both states, so keyboard focus stays on it when it toggles.
          Expanded: only the links (they replace the summary line) and the chevron that collapses again. */}
      <div className="flex items-start gap-1">
        {open && (
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
        )}
        <button
          ref={toggleRef}
          type="button"
          onClick={handleToggle}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-label={open ? t('song.meta.hideDetails') : undefined}
          className={cn(
            'flex min-h-tap items-center gap-1 text-left hover:text-fg transition-colors',
            open ? 'size-tap shrink-0 justify-center rounded-control' : 'w-full',
          )}
          data-testid="song-meta-line"
        >
          {!open && <span className="min-w-0 flex-1 truncate">{meta}</span>}
          {!open && <span className="sr-only">{t('song.meta.showDetails')}</span>}
          <ChevronDown
            aria-hidden
            className={cn('size-4 shrink-0 transition-transform motion-reduce:transition-none', open && 'rotate-180')}
          />
        </button>
      </div>
      {open && technical && (
        <p className="truncate mt-1" data-testid="song-technical-line">
          {technical}
        </p>
      )}
    </div>
  );
}
