'use client';

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Validation 1 (fix 4): where the search suggestions panel lives. The header owns the search field and its
 * state, but the panel is rendered into this slot, at the top of the main column, so it is part of the page
 * flow and pushes the song list (or Home) down instead of floating over the first rows.
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
  return <div ref={setSlot} data-testid="search-suggestions-slot" className="relative empty:hidden" />;
}

/** Renders its children into the slot (nothing when the page has no slot). */
export function SuggestionsPortal({ children }: { children: ReactNode }) {
  const slot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // The panel opens at the top of the column: bring it into view if the column was scrolled down (desktop).
  useEffect(() => {
    slot?.scrollIntoView?.({ block: 'nearest' });
  }, [slot]);
  return slot ? createPortal(children, slot) : null;
}
