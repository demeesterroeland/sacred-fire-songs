'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Validation 1 (fix 4): where the search suggestions panel lives. The header owns the search field and its
 * state, but the panel is rendered into this slot, at the top of the main column, so it is part of the page
 * flow and pushes the song list (or Home) down instead of floating over the first rows.
 *
 * Review round, H1: when the column is scrolled down the panel has to be seen without scrolling the column
 * (that lost the reader's place). So the slot sticks to the top of the column: still in the flow (it takes its
 * own room, pushes the rows down), but visible wherever the column is scrolled to. The layout turns scroll
 * anchoring off on the column, so the scroll position stays exactly where it was. z-40: above the bars fixed to
 * the bottom of the window (z-30), which would otherwise cover the panel's last rows on a low window.
 */
let slotEl: HTMLElement | null = null;
const listeners = new Set<() => void>();

function setSlot(el: HTMLElement | null) {
  slotEl = el;
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => slotEl;
const getServerSnapshot = () => null;

/** Put once at the top of the main column. Takes no room while the panel is closed. */
export function SuggestionsSlot() {
  return (
    <div
      ref={setSlot}
      data-testid="search-suggestions-slot"
      className="sticky top-0 z-40 border-b border-line bg-bg empty:hidden"
    />
  );
}

/** Renders its children into the slot (nothing when the page has no slot). */
export function SuggestionsPortal({ children }: { children: ReactNode }) {
  const slot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return slot ? createPortal(children, slot) : null;
}
