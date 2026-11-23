// Mini player gating and reserved space (Story 6.1.12 / G3.1, #396, ADR 0005 / UXD-5).
// The bar shows only after the user pressed play; sheets and the drawer then
// pad their bottom by `--mini-player-h` so no content is covered.

export const MINI_PLAYER_CSS_VAR = '--mini-player-h';
/** Height of the bar itself (`h-bar` = 56 px). */
export const MINI_PLAYER_BAR_HEIGHT = '3.5rem';

export interface MiniPlayerState {
  /** A reference track (YouTube / SoundCloud / Spotify) was started and not stopped. */
  mediaSessionStarted: boolean;
  /** The take that is playing or paused in the shared audio provider, if any. */
  activePlaybackId: string | null;
  /** Ids of the takes that belong to the song this drawer shows. */
  songRecordingIds: readonly string[];
}

/**
 * `AudioProvider` is global (it survives navigation), so `activePlaybackId` can name a take of
 * another song. Only a take of this song counts as "started" here (UXD-5: the bar appears only
 * after play, on a fresh song page it must be hidden).
 */
export function ownsActiveTake(activePlaybackId: string | null, songRecordingIds: readonly string[]): boolean {
  return activePlaybackId !== null && songRecordingIds.includes(activePlaybackId);
}

export function isMiniPlayerVisible({ mediaSessionStarted, activePlaybackId, songRecordingIds }: MiniPlayerState): boolean {
  return mediaSessionStarted || ownsActiveTake(activePlaybackId, songRecordingIds);
}

/**
 * What ✕ on the bar stops: always the reference track, and the active take when it belongs to
 * this song. A paused take must not take over the bar after ✕ (UXD-5: ✕ stops and hides).
 */
export function miniPlayerClose(
  activePlaybackId: string | null,
  songRecordingIds: readonly string[],
): { stopTake: boolean; stopReference: true } {
  return { stopTake: ownsActiveTake(activePlaybackId, songRecordingIds), stopReference: true };
}

export type MediaSessionEvent = 'playing' | 'stopped' | 'take-started';

/** Pause keeps the bar (no event); `stopped` and a take taking over end the media session. */
export function mediaSessionReducer(started: boolean, event: MediaSessionEvent): boolean {
  switch (event) {
    case 'playing':
      return true;
    case 'stopped':
    case 'take-started':
      return false;
  }
}

interface StyleRoot {
  style: Pick<CSSStyleDeclaration, 'setProperty' | 'removeProperty'>;
}

/**
 * Space the bar occupies from the bottom of the viewport: its own height plus the
 * bottom nav it sits on. Sheets add the safe-area inset themselves.
 */
export function applyMiniPlayerHeight(visible: boolean, root: StyleRoot): void {
  if (visible) {
    root.style.setProperty(MINI_PLAYER_CSS_VAR, `calc(${MINI_PLAYER_BAR_HEIGHT} + var(--bottom-nav-height, 3.5rem))`);
  } else {
    root.style.removeProperty(MINI_PLAYER_CSS_VAR);
  }
}
