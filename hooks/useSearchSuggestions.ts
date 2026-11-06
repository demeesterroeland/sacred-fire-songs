'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategoryTree } from '@/lib/taxonomyUtils';
import { sortCategories } from '@/lib/categoryOrder';
import { readRecentSearches } from '@/lib/search/history';

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

  // A tap outside the field and the panel closes the panel.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!wrapperRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  /** Focus moved: tabbing out of the field and the panel closes the panel. */
  const closeIfFocusLeaves = useCallback((e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (!next) return; // a tap on something unfocusable: the pointerdown handler decides
    if (wrapperRef.current?.contains(next) || panelRef.current?.contains(next)) return;
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
