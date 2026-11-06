import { describe, expect, it } from 'vitest';
import { nextTabIndex, wrapFocusIndex } from '@/lib/a11y/focusTrap';

/** Story 6.1.34 / G9.2 (#418): focus stays inside a modal and tabs follow the arrow-key pattern. */
describe('wrapFocusIndex', () => {
  it('lets the browser move focus inside the list', () => {
    expect(wrapFocusIndex(4, 1, false)).toBeNull();
    expect(wrapFocusIndex(4, 2, true)).toBeNull();
  });
  it('wraps Tab on the last element to the first', () => {
    expect(wrapFocusIndex(4, 3, false)).toBe(0);
  });
  it('wraps Shift+Tab on the first element to the last', () => {
    expect(wrapFocusIndex(4, 0, true)).toBe(3);
  });
  it('pulls focus in from the container or from outside', () => {
    expect(wrapFocusIndex(4, -1, false)).toBe(0);
    expect(wrapFocusIndex(4, -1, true)).toBe(3);
  });
  it('does nothing without tabbable elements', () => {
    expect(wrapFocusIndex(0, -1, false)).toBeNull();
  });
  it('a single element wraps onto itself', () => {
    expect(wrapFocusIndex(1, 0, false)).toBe(0);
    expect(wrapFocusIndex(1, 0, true)).toBe(0);
  });
});

describe('nextTabIndex', () => {
  it('moves with the arrow keys and wraps around', () => {
    expect(nextTabIndex('ArrowRight', 0, 2)).toBe(1);
    expect(nextTabIndex('ArrowRight', 1, 2)).toBe(0);
    expect(nextTabIndex('ArrowLeft', 0, 2)).toBe(1);
    expect(nextTabIndex('ArrowLeft', 1, 2)).toBe(0);
  });
  it('Home and End jump to the ends', () => {
    expect(nextTabIndex('Home', 1, 3)).toBe(0);
    expect(nextTabIndex('End', 0, 3)).toBe(2);
  });
  it('ignores other keys and empty lists', () => {
    expect(nextTabIndex('a', 0, 2)).toBeNull();
    expect(nextTabIndex('ArrowRight', 0, 0)).toBeNull();
  });
});
