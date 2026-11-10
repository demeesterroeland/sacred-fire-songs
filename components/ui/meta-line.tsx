import * as React from "react";
import { cn } from "@/lib/utils";

/** Join meta items with " · ", dropping empty values (Story 6.1.1 / G1.1). */
export function joinMeta(items: ReadonlyArray<string | null | undefined | false>): string {
  return items.filter((i): i is string => typeof i === "string" && i.trim().length > 0).map((i) => i.trim()).join(" · ");
}

export interface MetaLineProps extends React.HTMLAttributes<HTMLParagraphElement> {
  items: ReadonlyArray<string | null | undefined | false>;
  /** Show at most this many items (cards use 2); the rest is dropped. */
  max?: number;
}

/**
 * One grey meta line — "Herbert Quinteros · Fire · Healing · Spanish" — that
 * replaces coloured tag chips. Truncates at the end, never at the start.
 */
export function MetaLine({ items, max, className, ...props }: MetaLineProps) {
  const visible = items.filter((i): i is string => typeof i === "string" && i.trim().length > 0);
  const text = joinMeta(max ? visible.slice(0, max) : visible);
  if (!text) return null;
  return (
    <p className={cn("truncate text-meta text-fg-muted", className)} {...props}>
      {text}
    </p>
  );
}
