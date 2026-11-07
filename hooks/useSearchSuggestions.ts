'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategoryTree } from '@/lib/taxonomyUtils';
import { sortCategories } from '@/lib/categoryOrder';
import { readRecentSearches } from '@/lib/search/history';

/** How long a press that never turns into a click (a drag, a cancelled touch) keeps the panel from closing on focus. */
const PRESS_GRACE_MS = 500;

/** A tap that moves further than this (px) between press and release is a drag or a scroll, not a tap. */
const TAP_SLOP_PX = 10;

/** Things a tap can land on that get a click and handle it themselves: the click path closes the panel for them. */
const INTERACTIVE =
  'a[href], button, input, select, textarea, summary, label, [role="button"], [role="link"], [role="menuitem"], [role="option"], [tabindex], [contenteditable="true"]';

/**
 * The behaviour both search fields (header and Home, Stories 6.1.28/6.1.29) share around the G7.1
 * suggestion panel: when it opens, which data it loads, and how it closes.
 *
 * Attach `inputRef` to the field, `wrapperRef` to the element holding the field (and any controls
 * that count as "inside"), and `panelRef` to the element holding the panel.
 */
export function useSearchSuggestions() {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Set when focus returns to the field after Escape: that focus must not reopen the panel.
  const skipOpenRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  // The taxonomy is only fetched once the panel has been opened.
  const { data: tree = [] } = useQuery({
    queryKey: ['taxonomy'],
    queryFn: fetchCategoryTree,
    staleTime: 1000 * 60 * 60,
    enabled: hasOpened,
  });
  const categories = sortCategories(tree);

  // History lives in localStorage, readable on the client only.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of an external store
    setRecent(readRecentSearches());
  }, []);

  const show = useCallback(() => {
    if (skipOpenRef.current) {
      skipOpenRef.current = false;
      return;
    }
    setRecent(readRecentSearches());
    setHasOpened(true);
    setOpen(true);
  }, []);

  /** Open even when focus has just come back from the panel (e.g. the bottom bar's Search tab). */
  const forceShow = useCallback(() => {
    skipOpenRef.current = false;
    show();
  }, [show]);

  const close = useCallback(() => setOpen(false), []);

  // True from the moment a pointer goes down until just after its click: a press must not move the page.
  const pressingRef = useRef(false);

  // A tap outside the field and the panel closes the panel. It closes on the CLICK, not on the press: the panel
  // sits in the page flow, so closing it moves the list up, and a press on a song would then release on
  // something else (validation 1 review, B1). The click lands on what was under the finger at press time.
  useEffect(() => {
    if (!open) return;
    const isOutside = (target: Node) => !wrapperRef.current?.contains(target) && !panelRef.current?.contains(target);
    let forget: ReturnType<typeof setTimeout> | undefined;
    let tapStart: { x: number; y: number; id: number } | null = null;
    // Where the last press landed: a press that never clicks (right button, long press) is judged by it.
    let pressTarget: Node | null = null;
    const onDown = (e: Event) => {
      clearTimeout(forget);
      pressingRef.current = true;
      pressTarget = e.target as Node | null;
      const p = e as PointerEvent;
      tapStart = p.button === 0 || p.button === undefined ? { x: p.clientX, y: p.clientY, id: p.pointerId } : null;
    };
    // iOS Safari fires no click for a tap on empty (non-interactive) space and leaves focus in the field, so the
    // click path below never runs. A still release (same pointer, no movement) on something that is not a link,
    // button or field closes the panel. A release on anything interactive is left to its click: closing here would
    // move the list before that click and open the wrong song (validation 1 review, B1).
    const onTapEnd = (e: Event) => {
      const start = tapStart;
      tapStart = null;
      const p = e as PointerEvent;
      if (!start || p.pointerId !== start.id) return;
      if (Math.hypot(p.clientX - start.x, p.clientY - start.y) > TAP_SLOP_PX) return;
      const target = e.target as Element | null;
      if (!target || !isOutside(target)) return;
      if (target.closest?.(INTERACTIVE)) return;
      setOpen(false);
    };
    const onUp = () => {
      // On a touch screen the browser moves focus to the pressed link AFTER the finger lifts, a moment before
      // the click: keep the press alive until that click (which ends it), or for a short while if none comes.
      clearTimeout(forget);
      forget = setTimeout(() => {
        pressingRef.current = false;
        // No click came (right button, long press, a drag). If the press landed outside the field and the panel and
        // left focus outside them too (on a link it pressed, or on <body> after a right-click on plain text), the blur
        // that would have closed the panel has passed already: close it now. A scroll gesture leaves focus in the
        // field, and a press inside the panel is never "outside", so both keep the panel open.
        const active = document.activeElement;
        const focusInside = !!active && active !== document.body && !isOutside(active);
        if (pressTarget && isOutside(pressTarget) && !focusInside) setOpen(false);
      }, PRESS_GRACE_MS);
    };
    const onClick = (e: MouseEvent) => {
      clearTimeout(forget);
      pressingRef.current = false;
      if (isOutside(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('pointerup', onTapEnd, true);
    document.addEventListener('pointerup', onUp, true);
    document.addEventListener('pointercancel', onUp, true);
    // With a context menu open the browser may never report the release.
    document.addEventListener('contextmenu', onUp, true);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('pointerup', onTapEnd, true);
      document.removeEventListener('pointerup', onUp, true);
      document.removeEventListener('pointercancel', onUp, true);
      document.removeEventListener('contextmenu', onUp, true);
      document.removeEventListener('click', onClick, true);
      clearTimeout(forget);
      pressingRef.current = false;
    };
  }, [open]);

  /** Focus moved: tabbing out of the field and the panel closes the panel. */
  const closeIfFocusLeaves = useCallback((e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (!next) return; // a tap on something unfocusable: the click handler decides
    if (wrapperRef.current?.contains(next) || panelRef.current?.contains(next)) return;
    // A browser focuses a link or button on press: the click that follows closes the panel, so that the
    // page holds still until the press is released.
    if (pressingRef.current) return;
    setOpen(false);
  }, []);

  /** Escape inside the panel: close it and give the field back its focus without reopening. */
  const closeFromPanel = useCallback(() => {
    setOpen(false);
    skipOpenRef.current = true;
    inputRef.current?.focus();
    // jsdom/old browsers that do not fire focus: do not leave the flag armed
    setTimeout(() => { skipOpenRef.current = false; }, 0);
  }, []);

  /** ArrowDown in the field while the panel is open: move into the first suggestion. */
  const focusFirstSuggestion = useCallback((e: React.KeyboardEvent) => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>('button:not([data-clear-all])');
    if (first) {
      e.preventDefault();
      first.focus();
    }
  }, [open]);

  return {
    inputRef,
    wrapperRef,
    panelRef,
    open,
    close,
    show,
    forceShow,
    recent,
    setRecent,
    categories,
    closeIfFocusLeaves,
    closeFromPanel,
    focusFirstSuggestion,
  };
}
