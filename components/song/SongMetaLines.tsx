'use client';

import { useId, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { joinMeta } from '@/components/ui/meta-line';
import { authorSeparators, songAuthors } from '@/lib/songs/authors';
import { technicalItems, type VersionTechnical } from '@/lib/songs/songMeta';
import { cn } from '@/lib/utils';

interface CategoryItem {
  name: string;
  slug: string;
}

interface SongMetaLinesProps {
  /** Every credit of the song (`compositions.authors`); each one links to its author filter. */
  authors?: ReadonlyArray<string | null | undefined> | null;
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

/** Gap between the list items, in px: matches `gap-x-1`. */
const ITEM_GAP = 4;

/**
 * Validation 4 (owner): closed, the links stay on one line: authors always, then tags and Chords / Melody / Recordings
 * as many as fit; "…" only when one is hidden. `rights` are the right edges of the items laid out on one line
 * (authors first), `moreWidth` the width of "…". Returns how many items after the authors to show. Pure, unit tested.
 */
export function fitLinkCount(rights: number[], authorCount: number, moreWidth: number, available: number): number {
  const count = rights.length - authorCount;
  if (count <= 0) return 0;
  if (rights[rights.length - 1] <= available) return count;
  for (let k = count - 1; k > 0; k--) {
    if (rights[authorCount + k - 1] + ITEM_GAP + moreWidth <= available) return k;
  }
  return 0;
}

/**
 * Story 6.1.7 / G2.2 (#391), Validation 3 and 4: grey lines above the lyrics.
 * Line 1: author, tags and Chords · Melody · Recordings, always as links; closed, as many as fit on one line
 * (validation 4). The chevron at the end opens the rest and the technical line "Key E · Capo 3 · Standard · Beats 8".
 * Closed by default.
 */
export function SongMetaLines({
  authors: authorCredits,
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
  const { t, locale } = useLocale();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = expanded !== undefined ? expanded : internalOpen;
  const listId = useId();
  const detailsId = useId();
  const authors = songAuthors({ authors: authorCredits, originalAuthor }, t);
  // The text between the author links ("and", "y", ","), so each name stays its own link.
  const authorJoiners = authorSeparators(authors, locale);
  const technical = joinMeta(technicalItems(version, t));

  // Authors always show; tags and Chords / Melody / Recordings (`fitIndex`) only as far as they fit while closed.
  const optional = [
    ...categories.map((c) => ({ label: c.name, href: `/songs?tag=${encodeURIComponent(c.slug)}` })),
    ...(hasChords ? [{ label: t('song.technical.chords'), href: '/songs?chords=true' }] : []),
    ...(hasMelody ? [{ label: t('song.technical.melody'), href: '/songs?melody=true' }] : []),
    ...(hasPersonalRecording ? [{ label: t('song.technical.takes'), href: '/songs?myRecordings=true' }] : []),
  ];
  const links: { label: string; href: string; fitIndex?: number; joiner?: string }[] = [
    ...authors.map((a, i) => ({
      label: a,
      href: `/songs?artist=${encodeURIComponent(a)}`,
      joiner: i > 0 ? authorJoiners[i - 1] : undefined,
    })),
    ...optional.map((l, i) => ({ ...l, fitIndex: i })),
  ];
  // Validation 4 (owner): measure an invisible one-line copy and show as many links as fit. Until it is measured
  // (server render, no ResizeObserver) every link renders and the closed list clips.
  const [fit, setFit] = useState(optional.length);
  const boxRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLUListElement>(null);
  const linkKey = links.map((l) => l.label).join('|');
  useLayoutEffect(() => {
    const box = boxRef.current;
    const measure = measureRef.current;
    if (!box || !measure) return;
    const update = () => {
      const items = [...measure.children] as HTMLElement[];
      const moreItem = items.pop();
      const rights = items.map((li) => li.offsetLeft + li.offsetWidth);
      setFit(fitLinkCount(rights, authors.length, moreItem?.offsetWidth ?? 0, box.clientWidth));
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(box);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [linkKey, authors.length, open]);
  const showMore = !open && fit < optional.length;

  const handleToggle = () => {
    if (onToggleExpanded) onToggleExpanded();
    else setInternalOpen((o) => !o);
  };

  return (
    <div className={cn('text-meta text-fg-muted', className)} data-testid="song-meta-lines">
      {/* One button for both states, so keyboard focus stays on it when it toggles. */}
      <div className="flex items-start gap-1">
        {links.length > 0 ? (
        <div ref={boxRef} className="relative min-w-0 flex-1 overflow-hidden">
        <ul
          id={listId}
          className={cn('flex min-w-0 gap-x-1', open ? 'flex-wrap' : 'flex-nowrap')}
        >
          {links.map(({ label, href, fitIndex, joiner }, i) => (
            <li key={`${href}-${i}`} className={cn('shrink-0', !open && fitIndex !== undefined && fitIndex >= fit && 'hidden')}>
              {i > 0 && (joiner !== undefined ? <span>{joiner}</span> : <span aria-hidden>· </span>)}
              <Link href={href} className="inline-flex min-h-tap items-center px-1 text-fg underline underline-offset-4">
                {label}
              </Link>
            </li>
          ))}
          {showMore && (
            <li aria-hidden className="flex min-h-tap shrink-0 items-center px-1" data-testid="song-meta-more">
              …
            </li>
          )}
        </ul>
        {/* Invisible one-line copy of the links, only to measure them while closed. */}
        {!open && (
        <ul
          ref={measureRef}
          aria-hidden
          className="pointer-events-none invisible absolute left-0 top-0 flex w-max flex-nowrap gap-x-1"
        >
          {links.map(({ label, joiner }, i) => (
            <li key={i} className="shrink-0">
              {i > 0 && <span>{joiner ?? '· '}</span>}
              <span className="inline-flex px-1">{label}</span>
            </li>
          ))}
          <li className="shrink-0 px-1">…</li>
        </ul>
        )}
        </div>
        ) : (
          <div className="flex-1" />
        )}
        <button
          ref={toggleRef}
          type="button"
          onClick={handleToggle}
          aria-expanded={open}
          aria-controls={links.length > 0 ? `${listId} ${detailsId}` : detailsId}
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
