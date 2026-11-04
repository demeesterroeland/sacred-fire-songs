'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Globe } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import type { Locale } from '@/lib/i18n';
import { keyToIndex, orderLocales, typeaheadIndex } from './languageListbox';

/**
 * Language picker (WAI-ARIA listbox). Every language is written in its own
 * name and script. Each option carries a small wick; the active language's
 * wick is a lit ember, and it ignites once when you choose it.
 *
 * The list is portalled to <body> with fixed positioning so it is never
 * clipped by the user menu (overflow-hidden, transformed) or the sidebar's
 * scroll container. Used in the sidebar footer (variant "full", reachable for
 * guests), the user menu and Account → Preferences (variant "compact").
 */

const LIST_GAP = 6;
const LIST_MIN_WIDTH = 208;
const CLOSE_AFTER_IGNITE_MS = 240;

type Position = { left: number; width: number; top?: number; bottom?: number };

function Wick({ lit, igniting }: { lit: boolean; igniting?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block w-2 h-2 rounded-full shrink-0 transition-colors ${
        lit
          ? `bg-[#f45d1a] shadow-[0_0_0_3px_rgba(244,93,26,0.18),0_0_10px_rgba(244,93,26,0.6)] ${igniting ? 'ember-ignite' : ''}`
          : 'border border-gray-400 dark:border-gray-600 group-data-[active=true]:border-[#f45d1a]/70'
      }`}
    />
  );
}

export function LanguageSwitcher({
  variant = 'compact',
  className = '',
}: {
  variant?: 'full' | 'compact';
  className?: string;
}) {
  const { locale, t, setLocaleAndPersist, supportedLocales, localeLabels } = useLocale();
  const ordered = useMemo(() => orderLocales(supportedLocales, localeLabels), [supportedLocales, localeLabels]);
  const labels = useMemo(() => ordered.map((l) => localeLabels[l]), [ordered, localeLabels]);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [igniting, setIgniting] = useState<Locale | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const listId = `${id}-languages`;
  const optionId = (loc: Locale) => `${id}-${loc}`;

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    setIgniting(null);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const openList = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.max(rect.width, LIST_MIN_WIDTH);
    // Full-width (sidebar) aligns left; compact triggers sit at the right edge of their row, so align right.
    const preferred = variant === 'full' ? rect.left : rect.right - width;
    const left = Math.max(8, Math.min(preferred, window.innerWidth - width - 8));
    const estimatedHeight = ordered.length * 38 + 16;
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < estimatedHeight + LIST_GAP && rect.top > spaceBelow;
    setPosition(
      above
        ? { left, width, bottom: window.innerHeight - rect.top + LIST_GAP }
        : { left, width, top: rect.bottom + LIST_GAP }
    );
    setActiveIndex(Math.max(0, ordered.indexOf(locale)));
    setOpen(true);
  };

  const choose = (loc: Locale) => {
    if (loc === locale) return close(true);
    setLocaleAndPersist(loc);
    setIgniting(loc);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    closeTimer.current = setTimeout(() => close(true), reduced ? 0 : CLOSE_AFTER_IGNITE_MS);
  };

  // While open: focus the list, close on outside press, resize or scroll.
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus({ preventScroll: true });
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!listRef.current?.contains(target) && !triggerRef.current?.contains(target)) close(false);
    };
    const onViewportChange = (e: Event) => {
      if (e.target instanceof Node && listRef.current?.contains(e.target)) return;
      close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [open, close]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      return close(true);
    }
    if (e.key === 'Tab') return close(false);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      return choose(ordered[activeIndex]);
    }
    const next = keyToIndex(e.key, activeIndex, ordered.length) ?? typeaheadIndex(labels, activeIndex, e.key);
    if (next !== null) {
      e.preventDefault();
      setActiveIndex(next);
      document.getElementById(optionId(ordered[next]))?.scrollIntoView({ block: 'nearest' });
    }
  };

  const triggerClass =
    variant === 'full'
      ? 'w-full gap-2.5 px-2.5 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
      : 'gap-2 pl-2.5 pr-2 py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-testid="language-switcher"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onTriggerKeyDown}
        className={`inline-flex items-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f45d1a]/60 ${triggerClass} ${className}`}
      >
        {variant === 'full' ? (
          <Globe className="w-4 h-4 shrink-0" aria-hidden="true" />
        ) : (
          <Wick lit />
        )}
        <span className="sr-only">{t('userMenu.language')}: </span>
        <span lang={locale} className={variant === 'full' ? 'flex-1 text-left truncate' : 'truncate'}>
          {localeLabels[locale]}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`w-3.5 h-3.5 shrink-0 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open &&
        position &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            data-language-listbox=""
            aria-label={t('userMenu.language')}
            aria-activedescendant={optionId(ordered[activeIndex])}
            onKeyDown={onListKeyDown}
            style={{ left: position.left, width: position.width, top: position.top, bottom: position.bottom }}
            className="fixed z-[70] p-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)] focus:outline-none"
          >
            {ordered.map((loc, index) => {
              const selected = loc === locale;
              return (
                <li
                  key={loc}
                  id={optionId(loc)}
                  role="option"
                  aria-selected={selected}
                  lang={loc}
                  data-active={index === activeIndex}
                  onPointerMove={() => setActiveIndex(index)}
                  onClick={() => choose(loc)}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer select-none ${
                    index === activeIndex ? 'bg-gray-100 dark:bg-gray-800' : ''
                  } ${
                    selected
                      ? 'font-semibold text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Wick lit={selected} igniting={igniting === loc} />
                  <span className="truncate">{localeLabels[loc]}</span>
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}
