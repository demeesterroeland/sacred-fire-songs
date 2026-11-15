'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';
import { Minus, Pause, Play, Plus, Sun } from 'lucide-react';
import { Toolbar, ToolbarButton } from '@/components/ui/toolbar';
import { useLocale } from '@/context/LocaleContext';
import { LYRIC_STEPS } from '@/lib/design/tokens';
import { AUTOSCROLL_KEEP_ATTR } from '@/hooks/useAutoScroll';
import { stepBy, type ReaderPrefs } from '@/lib/reader/readerPrefs';
import { MAX_SEMITONES, MIN_SEMITONES, formatSemitones } from '@/lib/reader/transpose';
import { cn } from '@/lib/utils';

/** The transpose stepper (#566): shown next to the Chords switch, only while chords are on. */
export interface ReaderTranspose {
  semitones: number;
  onShift: (delta: -1 | 1) => void;
  onReset: () => void;
}

interface ReaderToolbarProps extends ReaderPrefs {
  /** Song has a chord layer; without it the Chords switch is not shown. */
  hasChords: boolean;
  onChange: (next: ReaderPrefs) => void;
  /**
   * Readers who may transpose (and whose text on screen has chords) pass this. The stepper then follows the Chords
   * switch: it shows while `chords` is on and goes when it is off (#566).
   */
  transpose?: ReaderTranspose;
  /** Auto-scroll is running (Story 6.1.10, #394). The play button shows when `onToggleScroll` is given. */
  scrolling?: boolean;
  onToggleScroll?: () => void;
  /** The screen wake lock is held: show the stay-awake indicator. */
  awake?: boolean;
  /**
   * The A+ button. When a focused ▶ disappears (the window grew and the song fits), focus moves here
   * instead of falling to <body>.
   */
  fallbackFocusRef?: RefObject<HTMLButtonElement | null>;
  className?: string;
}

/**
 * Story 6.1.6 / G2.1 (#390): `Chords · A− · A+` under the song title.
 * Story 6.1.10 / G2.5 (#394): `▶ Auto-scroll` joins the same row. Scroll speed and the screen switch live in the song
 * page's one ⋮ menu (validation 2, item 11).
 * #566: `Chords [switch] · [− n +] transpose · A− · A+`: the transpose stepper sits right after the Chords switch and
 * shows only while chords are on (it used to be in the ⋮ menu). The row wraps on a narrow phone (every control is 44 px).
 * Reference: docs/ux-research/references/font-size-control.png.
 */
export function ReaderToolbar({
  step,
  chords,
  speed,
  hasChords,
  onChange,
  transpose,
  scrolling = false,
  onToggleScroll,
  awake = false,
  fallbackFocusRef,
  className,
}: ReaderToolbarProps) {
  const { t } = useLocale();
  const ownLargerRef = useRef<HTMLButtonElement>(null);
  const largerRef = fallbackFocusRef ?? ownLargerRef;
  // Validation 1 review, M1: a button that had focus can leave the toolbar (▶ only shows while the lyrics
  // run below the fold). The browser would drop focus to <body>; hand it to A+ instead.
  const lastFocused = useRef<Element | null>(null);
  useLayoutEffect(() => {
    const last = lastFocused.current;
    if (!last || last.isConnected) return;
    lastFocused.current = null;
    const active = document.activeElement;
    if (!active || active === document.body) largerRef.current?.focus();
  });
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
      onFocusCapture={(e) => {
        lastFocused.current = e.target as Element;
      }}
      {...{ [AUTOSCROLL_KEEP_ATTR]: '' }}
    >
      {hasChords && (
        <button
          type="button"
          role="switch"
          aria-checked={chords}
          onClick={() => onChange({ step, chords: !chords, speed })}
          className="-ms-2 inline-flex min-h-tap items-center gap-2 rounded-control px-2 text-meta font-medium text-fg hover:bg-surface-2 transition-colors"
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
      {hasChords && chords && transpose && <TransposeStepper {...transpose} />}
      <ToolbarButton
        aria-disabled={atMin}
        onClick={() => !atMin && onChange({ step: stepBy(step, -1), chords, speed })}
        className={cn('border border-line', ends)}
      >
        <span aria-hidden>A−</span>
        <span className="sr-only">{t('viewer.fontSmaller')}</span>
      </ToolbarButton>
      <ToolbarButton
        ref={largerRef}
        aria-disabled={atMax}
        onClick={() => !atMax && onChange({ step: stepBy(step, 1), chords, speed })}
        className={cn('border border-line', ends)}
      >
        <span aria-hidden>A+</span>
        <span className="sr-only">{t('viewer.fontLarger')}</span>
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

/** `− n +`: one semitone a tap; the value is a sign in text ("+2"), and tapping it after a change goes back to the original key. */
function TransposeStepper({ semitones, onShift, onReset }: ReaderTranspose) {
  const { t } = useLocale();
  const atMin = semitones <= MIN_SEMITONES;
  const atMax = semitones >= MAX_SEMITONES;
  const ends = 'aria-disabled:opacity-40 aria-disabled:cursor-default aria-disabled:hover:bg-transparent';
  const value = formatSemitones(semitones);
  const resetLabel = `${value} — ${t('viewer.transpose.reset')}`;
  return (
    <div role="group" aria-label={t('viewer.transpose')} className="inline-flex items-center" data-testid="transpose-stepper">
      <ToolbarButton
        aria-label={t('viewer.transpose.down')}
        title={t('viewer.transpose.down')}
        aria-disabled={atMin}
        onClick={() => !atMin && onShift(-1)}
        className={cn('border border-line', ends)}
        data-testid="transpose-down"
      >
        <Minus className="size-5" aria-hidden />
      </ToolbarButton>
      {semitones === 0 ? (
        <span data-testid="transpose-value" className="inline-flex min-h-tap min-w-tap items-center justify-center text-meta font-semibold tabular-nums text-fg">
          {value}
        </span>
      ) : (
        <ToolbarButton
          aria-label={resetLabel}
          title={resetLabel}
          onClick={onReset}
          data-testid="transpose-value"
          className="font-semibold tabular-nums text-fg"
        >
          <span aria-hidden>{value}</span>
        </ToolbarButton>
      )}
      <span className="sr-only" aria-live="polite" data-testid="transpose-live">
        {t('viewer.transpose.state', { n: value })}
      </span>
      <ToolbarButton
        aria-label={t('viewer.transpose.up')}
        title={t('viewer.transpose.up')}
        aria-disabled={atMax}
        onClick={() => !atMax && onShift(1)}
        className={cn('border border-line', ends)}
        data-testid="transpose-up"
      >
        <Plus className="size-5" aria-hidden />
      </ToolbarButton>
    </div>
  );
}
