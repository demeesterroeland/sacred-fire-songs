'use client';

import type { ReactNode } from 'react';
import { Heart, ListPlus, Mic } from 'lucide-react';
import { Toolbar, ToolbarButton } from '@/components/ui/toolbar';
import { useLocale } from '@/context/LocaleContext';
import { ACTION_BAR_BOTTOM } from '@/lib/song/actionBar';
import { cn } from '@/lib/utils';

interface SongActionBarProps {
  isFavorite: boolean;
  onPractice: () => void;
  onToggleFavorite: () => void;
  /** Guests: Playlist opens the sign-in gate. Members get `playlistSlot` instead. */
  onGuestPlaylist: () => void;
  /** Members: the existing playlist picker, rendered as the middle action. */
  playlistSlot?: ReactNode;
  /** Number of takes on this song; shown next to Practice when above 0. */
  takeCount?: number;
  /** Slid away while scrolling down (only when the auto-hide preference is on). */
  visible?: boolean;
  className?: string;
}

/** One third of the bar: icon + label side by side, 44 px high, label never below 12 px. */
export const ACTION_BUTTON_CLASS = 'min-w-0 flex-1 px-2 text-meta';

/**
 * Story 6.1.9 / G2.4 (#393): `Practice · Playlist · ♥` in thumb reach on phones.
 * Fixed above the bottom nav and the mini player; desktop keeps the header actions (`lg:hidden`).
 * Practice is the one accent action; the heart is shown filled when liked (shape, not colour alone).
 */
export function SongActionBar({
  isFavorite,
  onPractice,
  onToggleFavorite,
  onGuestPlaylist,
  playlistSlot,
  takeCount = 0,
  visible = true,
  className,
}: SongActionBarProps) {
  const { t } = useLocale();

  return (
    <Toolbar
      aria-label={t('songBar.toolbar')}
      data-testid="song-action-bar"
      data-visible={visible ? 'true' : 'false'}
      style={{ bottom: ACTION_BAR_BOTTOM }}
      className={cn(
        'fixed inset-x-0 z-30 flex h-bar w-full rounded-none border-t border-line bg-bg/95 p-0 backdrop-blur-md lg:hidden',
        'transition-[transform,visibility,bottom] duration-200 motion-reduce:transition-none',
        visible ? 'translate-y-0' : 'invisible translate-y-full',
        className,
      )}
    >
      <ToolbarButton
        data-testid="song-action-practice"
        onClick={onPractice}
        className={cn(ACTION_BUTTON_CLASS, 'font-semibold text-accent hover:text-accent')}
      >
        <Mic className="size-5 shrink-0" aria-hidden />
        <span className="truncate">{t('practice.title')}</span>
        {takeCount > 0 && (
          <span className="rounded-pill bg-chip px-1.5 text-caption font-medium text-on-chip">{takeCount}</span>
        )}
      </ToolbarButton>

      {playlistSlot ?? (
        <ToolbarButton
          data-testid="song-action-playlist"
          aria-label={t('song.addToPlaylist')}
          onClick={onGuestPlaylist}
          className={ACTION_BUTTON_CLASS}
        >
          <ListPlus className="size-5 shrink-0" aria-hidden />
          <span className="truncate">{t('songBar.playlist')}</span>
        </ToolbarButton>
      )}

      <ToolbarButton
        data-testid="song-action-favorite"
        aria-pressed={isFavorite}
        onClick={onToggleFavorite}
        className={cn(ACTION_BUTTON_CLASS, isFavorite && 'text-fg')}
      >
        <Heart className={cn('size-5 shrink-0', isFavorite && 'fill-current')} aria-hidden />
        <span className="truncate">{isFavorite ? t('songBar.liked') : t('songBar.like')}</span>
      </ToolbarButton>
    </Toolbar>
  );
}
