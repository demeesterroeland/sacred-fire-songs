import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { MetaLine } from "./meta-line";

export interface ListRowProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  /** Meta items rendered as one grey line under the title. */
  meta?: ReadonlyArray<string | null | undefined | false>;
  metaMax?: number;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Render the row as its child (e.g. a Next.js <Link>) so the whole row is the target. */
  asChild?: boolean;
  children?: React.ReactNode;
}

/**
 * List row (component sheet, Story 6.1.1 / G1.1): title + one grey meta line,
 * divider between rows, no card, no glow. The whole row is a ≥ 44 px target.
 * With `asChild`, pass exactly one element (e.g. <Link>) as `children`; it
 * receives the row classes and the title/meta/leading/trailing content. Then
 * `trailing` must NOT be interactive (no nested buttons inside a link); put a
 * row action next to the row instead. With `onClick` (no `asChild`) the row
 * renders as a <button>.
 */
export function ListRow({ title, meta, metaMax, leading, trailing, asChild, className, children, ...props }: ListRowProps) {
  const content = (
    <>
      {leading ? <span className="shrink-0 text-fg-muted">{leading}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block line-clamp-2 text-row font-medium text-fg">{title}</span>
        {meta ? <MetaLine items={meta} max={metaMax} className="mt-0.5" /> : null}
      </span>
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </>
  );
  const classes = cn(
    "flex min-h-tap w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors hover:bg-surface last:border-b-0",
    className,
  );
  if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return (
      <Slot className={classes} {...props}>
        {React.cloneElement(children, undefined, content)}
      </Slot>
    );
  }
  if (props.onClick) {
    return (
      <button type="button" className={classes} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {content}
      </button>
    );
  }
  return (
    <div className={classes} {...props}>
      {content}
    </div>
  );
}
