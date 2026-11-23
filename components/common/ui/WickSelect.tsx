'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { keyToIndex, typeaheadIndex } from '@/lib/ui/listbox';

/**
 * Single-choice picker in the style of the language picker (LanguageSwitcher):
 * a WAI-ARIA listbox where each option carries a small wick and the chosen
 * option's wick is a lit ember that ignites once when picked.
 *
 * The list is portalled to <body> with fixed positioning so scroll containers
 * and overflow never clip it.
 */

export interface WickSelectOption<T extends string> {
  value: T;
  label: string;
  /** Optional color for this option's wick, glow and selected label (defaults to the accent token). */
  accent?: string;
}

const EMBER = 'var(--accent)';

const LIST_GAP = 6;
const LIST_MIN_WIDTH = 208;
const OPTION_HEIGHT = 38;
const CLOSE_AFTER_IGNITE_MS = 240;

type Position = { left: number; width: number; top?: number; bottom?: number };

function Wick({ lit, igniting, accent }: { lit: boolean; igniting?: boolean; accent?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ '--wick': accent ?? EMBER } as React.CSSProperties}
      className={`inline-block w-2 h-2 rounded-full shrink-0 transition-colors ${
        lit
          ? `bg-[var(--wick)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--wick)_18%,transparent),0_0_10px_color-mix(in_srgb,var(--wick)_60%,transparent)] ${igniting ? 'wick-ignite' : ''}`
          : accent
            ? 'border border-[var(--wick)]'
            : 'border border-line-strong group-data-[active=true]:border-[color-mix(in_srgb,var(--wick)_70%,transparent)]'
      }`}
    />
  );
}

export function WickSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  prefix,
  className = '',
  testId,
}: {
  /** Accessible name of the picker, e.g. "Sort users". */
  label: string;
  value: T;
  options: readonly WickSelectOption<T>[];
  onChange: (value: T) => void;
  /** Visible text before the current label on the trigger, e.g. "Sort:". */
  prefix?: string;
  className?: string;
  testId?: string;
}) {
  const labels = useMemo(() => options.map((o) => o.label), [options]);
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [igniting, setIgniting] = useState<T | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    setIgniting(null);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const openList = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.max(rect.width, LIST_MIN_WIDTH);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    const estimatedHeight = options.length * OPTION_HEIGHT + 16;
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < estimatedHeight + LIST_GAP && rect.top > spaceBelow;
    setPosition(
      above
        ? { left, width, bottom: window.innerHeight - rect.top + LIST_GAP }
        : { left, width, top: rect.bottom + LIST_GAP }
    );
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const choose = (index: number) => {
    const next = options[index];
    if (!next || next.value === value) return close(true);
    onChange(next.value);
    setIgniting(next.value);
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

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

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
      return choose(activeIndex);
    }
    const next = keyToIndex(e.key, activeIndex, options.length) ?? typeaheadIndex(labels, activeIndex, e.key);
    if (next !== null) {
      e.preventDefault();
      setActiveIndex(next);
      document.getElementById(optionId(next))?.scrollIntoView({ block: 'nearest' });
    }
  };

  const current = options[selectedIndex];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-testid={testId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onTriggerKeyDown}
        className={`inline-flex min-h-tap items-center gap-2 pl-3.5 pr-3 rounded-control text-xs font-semibold text-fg bg-surface-2 border border-line hover:bg-line transition-colors ${className}`}
      >
        <Wick lit accent={current?.accent} />
        <span className="sr-only">{label}: </span>
        <span className="truncate">
          {prefix && <span className="text-fg-muted font-medium">{prefix} </span>}
          <span style={current?.accent ? { color: current.accent } : undefined}>{current?.label}</span>
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
            aria-label={label}
            aria-activedescendant={optionId(activeIndex)}
            onKeyDown={onListKeyDown}
            style={{ left: position.left, width: position.width, top: position.top, bottom: position.bottom }}
            className="fixed z-[70] p-1.5 rounded-panel bg-surface border border-line shadow-sheet focus:outline-none"
          >
            {options.map((option, index) => {
              const selected = option.value === value;
              return (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={selected}
                  data-active={index === activeIndex}
                  onPointerMove={() => setActiveIndex(index)}
                  onClick={() => choose(index)}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-control text-sm cursor-pointer select-none ${
                    index === activeIndex ? 'bg-surface-2' : ''
                  } ${selected ? 'font-semibold text-fg' : 'text-fg-muted'}`}
                >
                  <Wick lit={selected} igniting={igniting === option.value} accent={option.accent} />
                  <span className="truncate" style={selected && option.accent ? { color: option.accent } : undefined}>
                    {option.label}
                  </span>
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}
