// Story 6.1.17 / G4.4 (#401): swiping a bottom sheet down by its handle closes it.
import { describe, expect, it } from 'vitest';
import { SHEET_HANDLE_PX, clampSwipe, shouldDismissSheet } from '@/lib/design/swipeDismiss';

describe('clampSwipe', () => {
  it('follows the finger down and ignores upward movement', () => {
    expect(clampSwipe(40)).toBe(40);
    expect(clampSwipe(-25)).toBe(0);
  });
});

describe('shouldDismissSheet', () => {
  it('dismisses after a long swipe down', () => {
    expect(shouldDismissSheet(120, 600)).toBe(true);
  });

  it('dismisses after a short but fast flick down', () => {
    expect(shouldDismissSheet(48, 80)).toBe(true);
  });

  it('keeps the sheet for a small, slow drag or a tap', () => {
    expect(shouldDismissSheet(30, 900)).toBe(false);
    expect(shouldDismissSheet(0, 50)).toBe(false);
    expect(shouldDismissSheet(-90, 100)).toBe(false);
  });

  it('keeps a drag handle of 32 px', () => {
    expect(SHEET_HANDLE_PX).toBe(32);
  });
});
