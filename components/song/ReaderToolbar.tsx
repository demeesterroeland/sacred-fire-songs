'use client';

import { Toolbar, ToolbarButton } from '@/components/ui/toolbar';
import { useLocale } from '@/context/LocaleContext';
import { LYRIC_STEPS } from '@/lib/design/tokens';
import { stepBy, type ReaderPrefs } from '@/lib/reader/readerPrefs';
import { cn } from '@/lib/utils';

interface ReaderToolbarProps extends ReaderPrefs {
  /** Song has a chord layer; without it the Chords switch is not shown. */
  hasChords: boolean;
  onChange: (next: ReaderPrefs) => void;
  className?: string;
}

/**
 * Story 6.1.6 / G2.1 (#390): `Chords · A− · A+` under the song title.
 * Reference: docs/ux-research/references/font-size-control.png.
 */
export function ReaderToolbar({ step, chords, hasChords, onChange, className }: ReaderToolbarProps) {
  const { t } = useLocale();
  const last = LYRIC_STEPS.length - 1;
  const atMin = step <= 0;
  const atMax = step >= last;
  // aria-disabled (not disabled) keeps keyboard / screen-reader focus on the button at the ends.
  const ends = 'aria-disabled:opacity-40 aria-disabled:cursor-default aria-disabled:hover:bg-transparent';

  return (
    <Toolbar aria-label={t('viewer.toolbar')} className={cn('bg-transparent p-0', className)} data-testid="reader-toolbar">
      {hasChords && (
        <button
          type="button"
          role="switch"
          aria-checked={chords}
          onClick={() => onChange({ step, chords: !chords })}
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
        onClick={() => !atMin && onChange({ step: stepBy(step, -1), chords })}
        className={cn('border border-line', ends)}
      >
        A−
      </ToolbarButton>
      <ToolbarButton
        aria-label={t('viewer.fontLarger')}
        aria-disabled={atMax}
        onClick={() => !atMax && onChange({ step: stepBy(step, 1), chords })}
        className={cn('border border-line', ends)}
      >
        A+
      </ToolbarButton>
    </Toolbar>
  );
}
