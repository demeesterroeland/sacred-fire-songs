// Sticky action bar on the song page: Practice · Playlist · ♥ (Story 6.1.9 / G2.4, #393).
// Phone only. The bar sits above the bottom nav and the mini player (#396) and reserves its own
// height on the page via `--action-bar-h`, so content is never covered.

export type PracticeTab = 'media' | 'recorder';

/** Practice opens on Listen when the song has reference media, otherwise straight on Record. */
export function practiceTab(hasMedia: boolean): PracticeTab {
  return hasMedia ? 'media' : 'recorder';
}

export const ACTION_BAR_CSS_VAR = '--action-bar-h';
/** Height of the bar itself (`h-bar` = 56 px). */
export const ACTION_BAR_HEIGHT = '3.5rem';

/**
 * Distance from the bottom of the viewport: above the bottom nav, or above the mini player when it
 * shows (`--mini-player-h` already includes the nav), plus the home-indicator inset.
 */
export const ACTION_BAR_BOTTOM =
  'calc(max(var(--mini-player-h, 0px), var(--bottom-nav-height, 0rem)) + env(safe-area-inset-bottom, 0px))';

interface StyleRoot {
  style: Pick<CSSStyleDeclaration, 'setProperty' | 'removeProperty'>;
}

/** Reserve the bar's height on the page while it is mounted (independent of scroll hiding). */
export function applyActionBarHeight(mounted: boolean, root: StyleRoot): void {
  if (mounted) root.style.setProperty(ACTION_BAR_CSS_VAR, ACTION_BAR_HEIGHT);
  else root.style.removeProperty(ACTION_BAR_CSS_VAR);
}

/** Height the bottom nav occupies: its own height while on screen, 0 while slid away. */
export function bottomNavHeight(navVisible: boolean): string {
  return navVisible ? '3.5rem' : '0rem';
}

/** Scroll distance (px) that counts as a direction change; smaller moves are jitter. */
export const SCROLL_THRESHOLD_PX = 8;
/** Within this distance of the top the bar is always visible. */
export const TOP_ZONE_PX = 48;

export interface BarScroll {
  visible: boolean;
  /** Scroll position the last direction was measured from. */
  anchorY: number;
}

export function initialBarScroll(y: number): BarScroll {
  return { visible: true, anchorY: y };
}

/**
 * Hide on scroll down, show on scroll up. With the auto-hide preference off the bar never hides.
 * `anchorY` only moves when the threshold is passed, so slow scrolling still accumulates.
 */
export function nextBarScroll(state: BarScroll, y: number, autoHide: boolean): BarScroll {
  if (!autoHide || y <= TOP_ZONE_PX) return { visible: true, anchorY: y };
  const delta = y - state.anchorY;
  if (Math.abs(delta) < SCROLL_THRESHOLD_PX) return state;
  return { visible: delta < 0, anchorY: y };
}
