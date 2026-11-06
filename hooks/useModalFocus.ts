'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { tabbablesIn, wrapFocusIndex } from '@/lib/a11y/focusTrap';

interface UseModalFocusOptions {
  open: boolean;
  /** The dialog element (it should have `tabIndex={-1}` so it can take focus itself). */
  containerRef: RefObject<HTMLElement | null>;
  onEscape: () => void;
  /**
   * Other regions that count as part of the dialog for Tab (e.g. a bar floating above it).
   * Their controls follow the dialog's own in the Tab order.
   */
  extraScope?: () => HTMLElement[];
  /** Where focus goes on close when the opener is gone (e.g. a tap that never focused a button). */
  fallbackSelector?: string;
}

/**
 * Focus management for a hand-built modal (the Practice drawer; Radix dialogs do this themselves):
 * focus moves into the dialog when it opens, Tab and Shift+Tab stay inside, Escape closes it,
 * and focus returns to whatever opened it. Other open layers (Radix sheets and dialogs) keep
 * their own focus handling: this hook ignores events that happen while one of them is open.
 */
export function useModalFocus({ open, containerRef, onEscape, extraScope, fallbackSelector }: UseModalFocusOptions) {
  const opener = useRef<HTMLElement | null>(null);
  const onEscapeRef = useRef(onEscape);
  const extraRef = useRef(extraScope);
  useEffect(() => {
    onEscapeRef.current = onEscape;
    extraRef.current = extraScope;
  });

  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    const active = document.activeElement;
    opener.current = active instanceof HTMLElement && active !== document.body && !container?.contains(active) ? active : null;

    // After the frame in which the dialog becomes visible: an element that is not shown cannot take focus.
    const raf = requestAnimationFrame(() => {
      if (container && !container.contains(document.activeElement)) container.focus({ preventScroll: true });
    });

    const scope = () => [containerRef.current, ...(extraRef.current?.() ?? [])].filter((el): el is HTMLElement => !!el);
    const inScope = (node: Node | null) => !!node && scope().some((el) => el.contains(node));

    // Another modal layer (a Radix sheet or dialog opened from the panel) has its own focus guards in the page.
    const otherLayerOpen = () => !!document.querySelector('[data-radix-focus-guard]');

    // Focus that lands outside the dialog without a Tab key press we can see: Tab leaving a cross-origin
    // player iframe (its keys go to the iframe, not to this page) or coming back from the browser's own toolbar.
    // Pull it back in, to the end the user was heading for.
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (!(target instanceof Node) || inScope(target) || otherLayerOpen()) return;
      if (target instanceof Element && target.closest('[data-sonner-toaster]')) return;
      const list = scope().flatMap((el) => tabbablesIn(el));
      if (list.length === 0) return;
      const from = e.relatedTarget;
      const backwards = from instanceof Node && !!(from.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_PRECEDING);
      list[backwards ? list.length - 1 : 0].focus();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return; // a Radix layer or an inline editor already took the key
      if (e.key === 'Escape') {
        if (!inScope(document.activeElement) && document.activeElement !== document.body) return;
        e.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (e.key !== 'Tab' || e.ctrlKey || e.altKey || e.metaKey) return;
      const current = document.activeElement;
      // Focus inside another layer (a Radix sheet): that layer traps its own focus.
      if (current && current !== document.body && !inScope(current) && otherLayerOpen()) return;

      const list = scope().flatMap((el) => tabbablesIn(el));
      const index = current ? list.indexOf(current as HTMLElement) : -1;
      if (list.length === 0) {
        e.preventDefault();
        containerRef.current?.focus({ preventScroll: true });
        return;
      }
      const target = wrapFocusIndex(list.length, index, e.shiftKey);
      if (target !== null) {
        e.preventDefault();
        list[target].focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
      // Closing: the dialog turns hidden, so focus would fall to <body>. Give it back to the opener.
      const restore = () => {
        const target =
          opener.current && opener.current.isConnected
            ? opener.current
            : fallbackSelector
              ? Array.from(document.querySelectorAll<HTMLElement>(fallbackSelector)).find((el) => el.getClientRects().length > 0) ?? null
              : null;
        const now = document.activeElement;
        // Do not steal focus the user (or a later dialog) already moved elsewhere.
        if (target && (!now || now === document.body || container?.contains(now))) target.focus({ preventScroll: true });
        opener.current = null;
      };
      // After the dialog's own close render, so `inert`/hidden state is applied first.
      setTimeout(restore, 0);
    };
  }, [open, containerRef, fallbackSelector]);
}
