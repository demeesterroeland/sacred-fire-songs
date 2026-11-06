'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Accessible name of the group (translated), e.g. t('song.version.label'). */
  "aria-label": string;
  options: ReadonlyArray<SegmentedOption>;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Segmented control (component sheet, Story 6.1.11 / G2.6): a calm grey strip with one
 * checked segment, e.g. the song page's `Original · Simplified`. A radio group: one tab stop
 * (the checked segment), Arrow Left / Right move and select (wrapping), Home / End jump.
 * The checked segment is raised, ringed and underlined, so the state is never colour alone.
 * Long lists scroll sideways inside the strip instead of widening the page.
 */
export function Segmented({ options, value, onChange, className, ...props }: SegmentedProps) {
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const checkedIndex = Math.max(0, options.findIndex((o) => o.value === value));

  const move = (to: number) => {
    const next = options[to];
    if (!next) return;
    refs.current[to]?.focus();
    if (next.value !== value) onChange(next.value);
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = options.length - 1;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        move(index === last ? 0 : index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        move(index === 0 ? last : index - 1);
        break;
      case "Home":
        e.preventDefault();
        move(0);
        break;
      case "End":
        e.preventDefault();
        move(last);
        break;
    }
  };

  return (
    <div
      role="radiogroup"
      className={cn("flex max-w-full items-center gap-1 overflow-x-auto rounded-panel bg-surface p-1", className)}
      {...props}
    >
      {options.map((o, i) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={i === checkedIndex ? 0 : -1}
            onClick={() => {
              if (!checked) onChange(o.value);
            }}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "inline-flex min-h-tap min-w-tap shrink-0 items-center justify-center rounded-control px-3 text-meta font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg",
              checked && "bg-bg text-fg ring-1 ring-line",
            )}
          >
            {/* The underline sits on the label: text decoration does not reach a flex item's own text from the button. */}
            <span className={cn("max-w-[10rem] truncate py-1", checked && "underline decoration-2 underline-offset-4")}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
