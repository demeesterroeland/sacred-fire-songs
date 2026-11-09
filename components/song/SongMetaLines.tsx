'use client';

import { useId, useLayoutEffect, useRef, useState } from 'react';
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

/** Gap between the list items, in px: matches `gap-x-1`. */
const ITEM_GAP = 4;

/**
 * Validation 4 (owner): closed, the author and tag links stay on one line and show as many tags as fit; "…" marks
 * that the chevron opens more links (hidden tags, or Chords / Melody / Recordings: `alwaysMore`). `rights` are the
 * right edges of the items (authors first, then tags) laid out on one line, `moreWidth` the width of "…". Returns how
 * many tags to show. Pure, so it is unit tested.
 */
export function fitTagCount(
  rights: number[],
  authorCount: number,
  moreWidth: number,
  available: number,
  alwaysMore = false,
): number {
  const tagCount = rights.length - authorCount;
  if (tagCount <= 0) return 0;
  if (!alwaysMore && rights[rights.length - 1] <= available) return tagCount;
  for (let k = alwaysMore ? tagCount : tagCount - 1; k > 0; k--) {
    if (rights[authorCount + k - 1] + ITEM_GAP + moreWidth <= available) return k;
  }
  return 0;
}

/**
 * Story 6.1.7 / G2.2 (#391), Validation 3 and 4: grey lines above the lyrics.
 * Line 1: author and tags, always as links; closed, as many tags as fit on one line (validation 4). The chevron at the end opens the rest: Chords · Melody · Recordings links and
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

  const links: { label: string; href: string; tag?: number }[] = [
    ...authors.map((a) => ({ label: a, href: `/songs?artist=${encodeURIComponent(a)}` })),
    ...categories.map((c, i) => ({ label: c.name, href: `/songs?tag=${encodeURIComponent(c.slug)}`, tag: i })),
    ...(open && hasChords ? [{ label: t('song.technical.chords'), href: '/songs?chords=true' }] : []),
    ...(open && hasMelody ? [{ label: t('song.technical.melody'), href: '/songs?melody=true' }] : []),
    ...(open && hasPersonalRecording ? [{ label: t('song.technical.takes'), href: '/songs?myRecordings=true' }] : []),
  ];
  // Validation 4 (owner): measure an invisible one-line copy and show as many tags as fit. Until it is measured
  // (server render, no ResizeObserver) every tag renders and the closed list clips.
  const [fit, setFit] = useState(categories.length);
  const boxRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLUListElement>(null);
  const tagKey = categories.map((c) => c.slug).join('|');
  // Owner (validation 4): "…" also when the chevron opens Chords / Melody / Recordings links.
  const hasExtraLinks = Boolean(hasChords || hasMelody || hasPersonalRecording);
  useLayoutEffect(() => {
    const box = boxRef.current;
    const measure = measureRef.current;
    if (!box || !measure) return;
    const update = () => {
      const items = [...measure.children] as HTMLElement[];
      const moreItem = items.pop();
      const rights = items.map((li) => li.offsetLeft + li.offsetWidth);
      setFit(fitTagCount(rights, authors.length, moreItem?.offsetWidth ?? 0, box.clientWidth, hasExtraLinks));
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(box);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [tagKey, authors.length, open, hasExtraLinks]);
  const showMore = !open && (fit < categories.length || hasExtraLinks);

  const handleToggle = () => {
    if (onToggleExpanded) onToggleExpanded();
    else setInternalOpen((o) => !o);
  };

  return (
    <div className={cn('text-meta text-fg-muted', className)} data-testid="song-meta-lines" data-has-extra-links={hasExtraLinks}>
      {/* One button for both states, so keyboard focus stays on it when it toggles. */}
      <div className="flex items-start gap-1">
        {links.length > 0 ? (
        <div ref={boxRef} className="relative min-w-0 flex-1 overflow-hidden">
        <ul
          id={listId}
          className={cn('flex min-w-0 gap-x-1', open ? 'flex-wrap' : 'flex-nowrap')}
        >
          {links.map(({ label, href, tag }, i) => (
            <li key={`${href}-${i}`} className={cn('shrink-0', !open && tag !== undefined && tag >= fit && 'hidden')}>
              {i > 0 && <span aria-hidden>· </span>}
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
        {/* Invisible one-line copy of the author and tag links, only to measure them while closed. */}
        {!open && (
        <ul
          ref={measureRef}
          aria-hidden
          className="pointer-events-none invisible absolute left-0 top-0 flex w-max flex-nowrap gap-x-1"
        >
          {[...authors, ...categories.map((c) => c.name)].map((label, i) => (
            <li key={i} className="shrink-0">
              {i > 0 && <span>· </span>}
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
