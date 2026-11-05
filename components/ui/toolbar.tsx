import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Toolbar (component sheet, Story 6.1.1 / G1.1): a calm grey strip of 44 px
 * buttons, e.g. the viewer's `Chords · A− · A+`.
 */
export function Toolbar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="toolbar"
      className={cn("inline-flex items-center gap-1 rounded-panel bg-surface p-1", className)}
      {...props}
    />
  );
}

export interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Toggle state; sets aria-pressed. Leave undefined for plain actions. */
  pressed?: boolean;
}

export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ pressed, className, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={pressed}
      className={cn(
        "inline-flex min-h-tap min-w-tap items-center justify-center gap-1.5 rounded-control px-3 text-meta font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:pointer-events-none disabled:opacity-40",
        pressed && "bg-bg text-fg",
        className,
      )}
      {...props}
    />
  ),
);
ToolbarButton.displayName = "ToolbarButton";
