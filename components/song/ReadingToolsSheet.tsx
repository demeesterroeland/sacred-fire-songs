'use client';

import type { RefObject } from 'react';
import { Minus, Pause, Play, Plus, Sun } from 'lucide-react';
import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { ToolbarButton } from '@/components/ui/toolbar';
import { useLocale } from '@/context/LocaleContext';
import { AUTOSCROLL_KEEP_ATTR } from '@/hooks/useAutoScroll';
import { SCROLL_SPEEDS, clampSpeed } from '@/lib/reader/autoScroll';
import { MAX_SEMITONES, MIN_SEMITONES, formatSemitones, transposeKey } from '@/lib/reader/transpose';
import { cn } from '@/lib/utils';

export interface TransposeControls {
  semitones: number;
  /** The key written on the song, if any. */
  originalKey?: string | null;
  onShift: (delta: -1 | 1) => void;
  onReset: () => void;
}

interface ReadingToolsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Musicians only: omit for everyone else (and for songs without chords). */
  transpose?: TransposeControls;
  speed: number;
  onSpeed: (delta: -1 | 1) => void;
  scrolling: boolean;
  /** Omit when the whole song fits the screen: the Auto-scroll section is then not shown. */
  onToggleScroll?: () => void;
  /** The screen wake lock is held. */
  awake: boolean;
  /** The button that opened the sheet; it gets focus back when the sheet closes. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

const stepButton = 'border border-line aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:bg-transparent';

/**
 * Story 6.1.10 / G2.5 (#394): what does not fit the reader toolbar on a phone.
 * Transpose (musicians), auto-scroll start/pause and speed, and the stay-awake status.
 * Auto-scroll keeps running behind it; touches here do not pause it.
 */
export function ReadingToolsSheet({
  open,
  onOpenChange,
  transpose,
  speed,
  onSpeed,
  scrolling,
  onToggleScroll,
  awake,
  returnFocusRef,
}: ReadingToolsSheetProps) {
  const { t } = useLocale();
  const level = clampSpeed(speed);

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent
        title={t('viewer.tools.title')}
        data-testid="reader-tools-sheet"
        {...{ [AUTOSCROLL_KEEP_ATTR]: '' }}
        onCloseAutoFocus={(e) => {
          // No Radix trigger here (the ⋯ button lives in the toolbar): focus it ourselves, not <body>.
          if (returnFocusRef?.current) {
            e.preventDefault();
            returnFocusRef.current.focus();
          }
        }}
      >
        <div className="divide-y divide-line pb-2">
          {transpose && (
            <div role="group" aria-label={t('viewer.transpose')} className="flex flex-col gap-2 px-4 py-3" data-testid="transpose-group">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 text-body font-medium text-fg">{t('viewer.transpose')}</span>
                <ToolbarButton
                  aria-label={t('viewer.transpose.down')}
                  aria-disabled={transpose.semitones <= MIN_SEMITONES}
                  onClick={() => transpose.semitones > MIN_SEMITONES && transpose.onShift(-1)}
                  className={stepButton}
                  data-testid="transpose-down"
                >
                  <Minus className="size-5" aria-hidden />
                </ToolbarButton>
                <span
                  data-testid="transpose-value"
                  aria-live="polite"
                  className="min-w-[3ch] text-center text-row font-semibold tabular-nums text-fg"
                >
                  {formatSemitones(transpose.semitones)}
                </span>
                <ToolbarButton
                  aria-label={t('viewer.transpose.up')}
                  aria-disabled={transpose.semitones >= MAX_SEMITONES}
                  onClick={() => transpose.semitones < MAX_SEMITONES && transpose.onShift(1)}
                  className={stepButton}
                  data-testid="transpose-up"
                >
                  <Plus className="size-5" aria-hidden />
                </ToolbarButton>
              </div>
              <div className="flex items-center gap-2">
                <span data-testid="transpose-key" className="min-w-0 flex-1 text-meta text-fg-muted">
                  {transpose.originalKey
                    ? transpose.semitones === 0
                      ? t('song.meta.key', { key: transpose.originalKey })
                      : t('viewer.transpose.key', {
                          key: transposeKey(transpose.originalKey, transpose.semitones),
                          original: transpose.originalKey,
                        })
                    : ''}
                </span>
                {transpose.semitones !== 0 && (
                  <ToolbarButton onClick={transpose.onReset} className="border border-line">
                    {t('viewer.transpose.reset')}
                  </ToolbarButton>
                )}
              </div>
            </div>
          )}

          {onToggleScroll && (
          <div role="group" aria-label={t('viewer.autoScroll')} className="flex flex-col gap-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 text-body font-medium text-fg">{t('viewer.autoScroll')}</span>
              <ToolbarButton onClick={onToggleScroll} className="border border-line" data-testid="tools-scroll-toggle">
                {scrolling ? <Pause className="size-5 fill-current" aria-hidden /> : <Play className="size-5 fill-current" aria-hidden />}
                {scrolling ? t('viewer.scroll.pause') : t('viewer.scroll.start')}
              </ToolbarButton>
            </div>
            <div className="flex items-center gap-2">
              <span data-testid="scroll-speed" aria-live="polite" className="min-w-0 flex-1 text-meta text-fg-muted">
                {t('viewer.scroll.speed', { level, max: SCROLL_SPEEDS.length })}
              </span>
              <ToolbarButton
                aria-disabled={level <= 1}
                onClick={() => level > 1 && onSpeed(-1)}
                className={cn(stepButton)}
              >
                <Minus className="size-5" aria-hidden />
                <span>{t('viewer.scroll.slower')}</span>
              </ToolbarButton>
              <ToolbarButton
                aria-disabled={level >= SCROLL_SPEEDS.length}
                onClick={() => level < SCROLL_SPEEDS.length && onSpeed(1)}
                className={cn(stepButton)}
              >
                <Plus className="size-5" aria-hidden />
                <span>{t('viewer.scroll.faster')}</span>
              </ToolbarButton>
            </div>
          </div>
          )}

          {awake && (
            <div data-testid="stay-awake-row" className="flex items-center gap-3 px-4 py-3 text-meta text-fg-muted">
              <Sun className="size-5 shrink-0" aria-hidden />
              <span>{t('viewer.awake')}</span>
            </div>
          )}
        </div>
        <div className="px-4 pb-3">
          <BottomSheetClose className="inline-flex min-h-tap w-full items-center justify-center rounded-control bg-surface-2 text-body font-medium text-fg hover:bg-line">
            {t('common.close')}
          </BottomSheetClose>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
