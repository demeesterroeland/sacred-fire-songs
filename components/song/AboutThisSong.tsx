'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { songNoteParagraphs } from '@/lib/songs/songNote';
import { cn } from '@/lib/utils';

interface AboutThisSongProps {
  /** The selected version's printed note (`song_versions.song_note`). */
  note?: string | null;
  className?: string;
  /**
   * Extra rows shown inside the panel under the note. The source line (#513) can move in here once it lands;
   * the panel is shown for them even when the note is empty.
   */
  children?: ReactNode;
}

/**
 * Story 6.2.8 / G1.3 (#511): "About this song" under the meta line. Collapsed by default, so the background
 * never pushes the lyrics down. Renders nothing when there is no note (and no extra rows).
 * The disclosure is a button with aria-expanded and aria-controls; the note is plain text, paragraph by paragraph.
 */
export function AboutThisSong({ note, className, children }: AboutThisSongProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const paragraphs = songNoteParagraphs(note);
  const hasExtraRows = children !== undefined && children !== null && children !== false;
  if (paragraphs.length === 0 && !hasExtraRows) return null;

  return (
    <div className={cn('text-fg', className)} data-testid="about-this-song">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        data-testid="about-this-song-toggle"
        className="flex min-h-tap w-full items-center gap-1 text-start text-meta text-fg-muted transition-colors hover:text-fg"
      >
        <span>{t('song.about.title')}</span>
        <ChevronDown
          aria-hidden
          className={cn('size-4 shrink-0 transition-transform motion-reduce:transition-none', open && 'rotate-180')}
        />
      </button>
      <div id={panelId} hidden={!open} className="space-y-2 pb-2 text-body text-fg">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
        {children}
      </div>
    </div>
  );
}
