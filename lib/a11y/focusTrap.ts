/**
 * Focus helpers for modal surfaces (Story 6.1.34 / G9.2, #418).
 * Pure logic lives here so it can be unit tested; the DOM wiring is `hooks/useModalFocus.ts`.
 */

/** Elements a keyboard user can reach with Tab (visibility is checked separately). */
export const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  'iframe:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

/**
 * The index Tab or Shift+Tab lands on inside a trapped list of `length` tabbable elements.
 * `current` is the index of the focused element, or -1 when focus is on the container itself
 * or outside the list. Returns null when the browser's own order is right (focus stays inside).
 */
export function wrapFocusIndex(length: number, current: number, backwards: boolean): number | null {
  if (length <= 0) return null;
  if (current < 0) return backwards ? length - 1 : 0;
  if (!backwards && current === length - 1) return 0;
  if (backwards && current === 0) return length - 1;
  return null;
}

/** True when the element is shown (not `display: none`, not `visibility: hidden`, not inert). */
export function isShown(el: HTMLElement): boolean {
  if (el.closest('[inert], [hidden]')) return false;
  const style = getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none') return false;
  // A box inside a `display: none` ancestor has no client rects; a fixed box has none through offsetParent.
  return el.getClientRects().length > 0;
}

export function tabbablesIn(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(isShown);
}

/** The next tab in a tablist for an arrow, Home or End key (wraps around); null for other keys. */
export function nextTabIndex(key: string, current: number, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
