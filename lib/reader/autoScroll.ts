/**
 * Auto-scroll maths for the reader toolbar (Epic 6.1, Story 6.1.10 / G2.5, #394).
 * Five speed levels in pixels per second; whole pixels are scrolled each frame and
 * the fraction is carried over, so the slowest level still moves smoothly.
 */
export const SCROLL_SPEEDS = [10, 18, 28, 42, 60] as const;
export const DEFAULT_SCROLL_SPEED = 3;
/** Longest time one frame may count for; a backgrounded tab must not make the page jump. */
export const MAX_FRAME_MS = 100;

const MIN = 1;
const MAX = SCROLL_SPEEDS.length;

/** Speed level as a whole number 1..5. */
export function clampSpeed(level: number): number {
  if (!Number.isFinite(level)) return DEFAULT_SCROLL_SPEED;
  return Math.min(MAX, Math.max(MIN, Math.round(level)));
}

/** Next level after pressing Slower (−1) or Faster (+1). */
export function speedBy(level: number, delta: -1 | 1): number {
  return clampSpeed(level + delta);
}

/** Pixels per second for a level. */
export function speedPx(level: number): number {
  return SCROLL_SPEEDS[clampSpeed(level) - 1];
}

/** One animation frame: whole pixels to scroll now, and the fraction carried to the next frame. */
export function stepScroll(carry: number, dtMs: number, level: number): { px: number; carry: number } {
  if (!(dtMs > 0)) return { px: 0, carry };
  const total = carry + (speedPx(level) * Math.min(dtMs, MAX_FRAME_MS)) / 1000;
  const px = Math.floor(total);
  return { px, carry: total - px };
}

/** True when the page cannot scroll any further (within a pixel). */
export function isAtBottom(scrollY: number, viewportHeight: number, scrollHeight: number): boolean {
  return scrollY + viewportHeight >= scrollHeight - 1;
}
