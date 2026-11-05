'use client';

import type { Ref } from 'react';
import { MoreHorizontal, Pause, Play, Sun } from 'lucide-react';
import { Toolbar, ToolbarButton } from '@/components/ui/toolbar';
import { useLocale } from '@/context/LocaleContext';
import { LYRIC_STEPS } from '@/lib/design/tokens';
import { AUTOSCROLL_KEEP_ATTR } from '@/hooks/useAutoScroll';
import { stepBy, type ReaderPrefs } from '@/lib/reader/readerPrefs';
import { formatSemitones } from '@/lib/reader/transpose';
import { cn } from '@/lib/utils';

interface ReaderToolbarProps extends ReaderPrefs {
  /** Song has a chord layer; without it the Chords switch is not shown. */
  hasChords: boolean;
  onChange: (next: ReaderPrefs) => void;
  /** Auto-scroll is running (Story 6.1.10, #394). The play button shows when `onToggleScroll` is given. */
  scrolling?: boolean;
  onToggleScroll?: () => void;
  /** Opens the reading tools sheet (transpose, scroll speed). The ⋯ button shows when given. */
  onOpenTools?: () => void;
  /** The tools sheet is open; sets aria-expanded on the ⋯ button. */
  toolsOpen?: boolean;
  /** The ⋯ button, so the page can hand focus back to it when the sheet closes. */
  toolsButtonRef?: Ref<HTMLButtonElement>;
  /** Current transposition in semitones; shown as text on the ⋯ button when not 0. */
  semitones?: number;
  /** The screen wake lock is held: show the stay-awake indicator. */
  awake?: boolean;
  className?: string;
}

/**
 * Story 6.1.6 / G2.1 (#390): `Chords · A− · A+` under the song title.
 * Story 6.1.10 / G2.5 (#394): `▶ Auto-scroll` and `⋯` (transpose, scroll speed) join the same row.
 * Reference: docs/ux-research/references/font-size-control.png.
 */
export function ReaderToolbar({
  step,
  chords,
  speed,
  hasChords,
  onChange,
  scrolling = false,
  onToggleScroll,
  onOpenTools,
  toolsOpen = false,
  toolsButtonRef,
  semitones = 0,
  awake = false,
  className,
}: ReaderToolbarProps) {
  const { t } = useLocale();
  const last = LYRIC_STEPS.length - 1;
  const atMin = step <= 0;
  const atMax = step >= last;
  // aria-disabled (not disabled) keeps keyboard / screen-reader focus on the button at the ends.
  const ends = 'aria-disabled:opacity-40 aria-disabled:cursor-default aria-disabled:hover:bg-transparent';

  return (
    <Toolbar
      aria-label={t('viewer.toolbar')}
      className={cn('flex-wrap bg-transparent p-0', className)}
      data-testid="reader-toolbar"
      {...{ [AUTOSCROLL_KEEP_ATTR]: '' }}
    >
      {hasChords && (
        <button
          type="button"
          role="switch"
          aria-checked={chords}
          onClick={() => onChange({ step, chords: !chords, speed })}
          className="inline-flex min-h-tap items-center gap-2 rounded-control px-2 text-meta font-medium text-fg hover:bg-surface-2 transition-colors"
        >
          <span
            aria-hidden
            className={cn(
              'relative inline-block h-5 w-9 rounded-pill transition-colors motion-reduce:transition-none',
              chords ? 'bg-accent' : 'bg-line-strong'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 size-4 rounded-pill bg-bg transition-[left] motion-reduce:transition-none',
                chords ? 'left-[18px]' : 'left-0.5'
              )}
            />
          </span>
          {t('viewer.chords')}
        </button>
      )}
      <ToolbarButton
        aria-label={t('viewer.fontSmaller')}
        aria-disabled={atMin}
        onClick={() => !atMin && onChange({ step: stepBy(step, -1), chords, speed })}
        className={cn('border border-line', ends)}
      >
        A−
      </ToolbarButton>
      <ToolbarButton
        aria-label={t('viewer.fontLarger')}
        aria-disabled={atMax}
        onClick={() => !atMax && onChange({ step: stepBy(step, 1), chords, speed })}
        className={cn('border border-line', ends)}
      >
        A+
      </ToolbarButton>
      {onToggleScroll && (
        <ToolbarButton
          aria-label={t('viewer.autoScroll')}
          title={t('viewer.autoScroll')}
          aria-pressed={scrolling}
          onClick={onToggleScroll}
          data-testid="autoscroll-toggle"
          className={cn('border border-line', scrolling && 'bg-surface-2 text-fg')}
        >
          {scrolling ? <Pause className="size-5 fill-current" aria-hidden /> : <Play className="size-5 fill-current" aria-hidden />}
        </ToolbarButton>
      )}
      {onOpenTools && (
        <ToolbarButton
          ref={toolsButtonRef}
          title={t('viewer.tools')}
          aria-haspopup="dialog"
          aria-expanded={toolsOpen}
          onClick={onOpenTools}
          data-testid="reader-tools-button"
          className="border border-line"
        >
          <MoreHorizontal className="size-5" aria-hidden />
          <span className="sr-only">{t('viewer.tools')}</span>
          {semitones !== 0 && (
            <>
              <span aria-hidden className="text-caption font-semibold tabular-nums text-fg">
                {formatSemitones(semitones)}
              </span>
              <span className="sr-only">, {t('viewer.transpose.state', { n: formatSemitones(semitones) })}</span>
            </>
          )}
        </ToolbarButton>
      )}
      {awake && (
        <span
          role="img"
          aria-label={t('viewer.awake')}
          title={t('viewer.awake')}
          data-testid="stay-awake-indicator"
          className="inline-flex size-6 shrink-0 items-center justify-center text-fg-muted"
        >
          <Sun className="size-4" aria-hidden />
        </span>
      )}
    </Toolbar>
  );
}
