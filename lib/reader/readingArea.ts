/**
 * Review round, H2: what the reader can actually see. On phones the Practice bar, the mini player and the
 * bottom bar are fixed to the bottom of the window and cover the last lines of a page; the fold for
 * auto-scroll is the top of those bars, not the bottom of the window.
 */

/** Marks a bar fixed to the bottom edge of the window that covers the page behind it. */
export const READER_BAR_ATTR = 'data-reader-bar';

/**
 * Height taken by the full-width bars fixed to the bottom of the window. Layout heights, not what is on
 * screen right now: a bar that slid away while scrolling comes back, so the fold must not flicker with it.
 * Hidden bars (`lg:hidden` on desktop), bars that are not fixed and floating cards (the desktop mini player)
 * cover nothing the reader needs and count for 0.
 */
export function fixedBottomBarsHeight(doc: Document = document): number {
  const view = doc.defaultView;
  if (!view) return 0;
  let total = 0;
  doc.querySelectorAll<HTMLElement>(`[${READER_BAR_ATTR}]`).forEach((bar) => {
    const style = view.getComputedStyle(bar);
    if (style.display === 'none' || style.position !== 'fixed') return;
    if (bar.getBoundingClientRect().width < view.innerWidth * 0.9) return;
    total += bar.offsetHeight;
  });
  return total;
}
