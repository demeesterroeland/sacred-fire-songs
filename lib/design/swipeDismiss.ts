/**
 * Swipe-to-dismiss for the bottom sheet (Story 6.1.17 / G4.4, #401). Pure rules,
 * so the gesture is testable without a browser. The drag handle is 32 px tall
 * (the touch target above the 4 px grabber).
 */
export const SHEET_HANDLE_PX = 32;

/** A swipe this far down always closes the sheet. */
export const DISMISS_DISTANCE_PX = 80;
/** A shorter flick closes it when it is at least this fast (px per ms)... */
export const DISMISS_FLICK_SPEED = 0.5;
/** ...and has moved at least this far. */
export const DISMISS_FLICK_MIN_PX = 30;

/** The sheet follows the finger downwards and never moves above its rest position. */
export function clampSwipe(deltaY: number): number {
  return Math.max(0, deltaY);
}

/** Close after a long swipe down, or a short fast flick; a tap or small slow drag keeps it open. */
export function shouldDismissSheet(deltaY: number, elapsedMs: number): boolean {
  if (deltaY >= DISMISS_DISTANCE_PX) return true;
  if (deltaY < DISMISS_FLICK_MIN_PX) return false;
  return deltaY / Math.max(elapsedMs, 1) >= DISMISS_FLICK_SPEED;
}
