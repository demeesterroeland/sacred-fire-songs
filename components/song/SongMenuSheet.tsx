'use client';

import Link from 'next/link';
import { Edit2, Globe, Link2, Minus, Pause, Play, Plus, Share2, Trash2 } from 'lucide-react';
import { BottomSheet, BottomSheetClose, BottomSheetContent, SheetAction } from '@/components/ui/bottom-sheet';
import { Switch } from '@/components/ui/switch';
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

export interface SongMenuActions {
  onShare: () => void;
  /** Owner or admin: the link to the editor (it opens the version being read). */
  edit?: { href: string };
  /** Owner or admin: asks for the delete confirmation (the page closes the menu). */
  onDelete?: () => void;
  /** Owner or admin, private song only (validation 4): make the song public from the menu. */
  onPublish?: () => void;
  /** Gatekeeper or admin (Story 6.2.9, #512): link this song as a version of another song (the page opens the sheet). */
  onLinkAsVersion?: () => void;
}

interface SongMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The song's title and its "by …" line: they name the dialog. */
  title: string;
  description?: string;
  actions: SongMenuActions;
  /** Musicians only: omit for everyone else (and for versions without chords). */
  transpose?: TransposeControls;
  speed: number;
  onSpeed: (delta: -1 | 1) => void;
  scrolling: boolean;
  /** Omit when the whole song fits the screen: the Auto-scroll section is then not shown. */
  onToggleScroll?: () => void;
  /** The "Screen stays on" preference (per device, on by default). */
  keepAwake: boolean;
  onKeepAwakeChange: (value: boolean) => void;
  /** The browser can hold a screen wake lock; without it the switch is off and disabled. */
  awakeSupported: boolean;
}

const stepButton = 'border border-line aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:bg-transparent';
const actionRow = 'flex min-h-tap w-full items-center gap-3 px-4 py-3 text-left text-body text-fg transition-colors hover:bg-surface-2';

/**
 * The song page's one menu (validation 2, item 11; it replaces the ⋮ sheet and the toolbar's ⋯ sheet).
 * It holds the song actions (Share, Edit, Delete: from lg the header shows them as buttons), transpose
 * (musicians), auto-scroll start/pause and speed, and the "Screen stays on" switch. Share and the switch are
 * always there, so the menu is never empty. Auto-scroll keeps running behind it; touches here do not pause it.
 * Focus returns to the button that opened it (BottomSheet remembers it).
 */
export function SongMenuSheet({
  open,
  onOpenChange,
  title,
  description,
  actions,
  transpose,
  speed,
  onSpeed,
  scrolling,
  onToggleScroll,
  keepAwake,
  onKeepAwakeChange,
  awakeSupported,
}: SongMenuSheetProps) {
  const { t } = useLocale();
  const level = clampSpeed(speed);

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent
        title={title}
        description={description}
        data-testid="song-menu-sheet"
        {...{ [AUTOSCROLL_KEEP_ATTR]: '' }}
      >
        <div className="divide-y divide-line pb-2">
          <div role="group" aria-label={t('song.menu.actions')} className="pb-2 lg:hidden">
            <SheetAction icon={<Share2 />} onClick={actions.onShare}>
              {t('song.share')}
            </SheetAction>
            {actions.edit && (
              <Link href={actions.edit.href} onClick={() => onOpenChange(false)} className={actionRow}>
                <span aria-hidden="true" className="shrink-0 [&_svg]:size-5"><Edit2 /></span>
                <span className="min-w-0 flex-1">{t('song.edit')}</span>
              </Link>
            )}
            {actions.onDelete && (
              <SheetAction icon={<Trash2 />} onClick={actions.onDelete}>
                {t('song.delete')}
              </SheetAction>
            )}
          </div>

          {/* On every width: the desktop header has no publish button. */}
          {actions.onPublish && (
            <div className="py-2">
              <SheetAction icon={<Globe />} onClick={actions.onPublish}>
                {t('song.menu.publish')}
              </SheetAction>
            </div>
          )}

          {/* Story 6.2.9 (#512): on every width, gatekeepers and admins only. */}
          {actions.onLinkAsVersion && (
            <div className="py-2">
              <SheetAction icon={<Link2 />} onClick={actions.onLinkAsVersion} data-testid="song-menu-link-version">
                {t('song.menu.linkAsVersion')}
              </SheetAction>
            </div>
          )}

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
                <ToolbarButton aria-disabled={level <= 1} onClick={() => level > 1 && onSpeed(-1)} className={cn(stepButton)}>
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

          <div data-testid="keep-awake-row" className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <label htmlFor="keep-awake-switch" className="block text-body font-medium text-fg">
                {t('viewer.awake')}
              </label>
              <p id="keep-awake-hint" className="text-meta text-fg-muted">
                {awakeSupported ? t('viewer.awake.description') : t('settings.prefs.notSupported')}
              </p>
            </div>
            <Switch
              id="keep-awake-switch"
              aria-describedby="keep-awake-hint"
              checked={keepAwake && awakeSupported}
              disabled={!awakeSupported}
              onCheckedChange={onKeepAwakeChange}
            />
          </div>
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
