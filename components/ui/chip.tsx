import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/**
 * Filter chip (component sheet, Story 6.1.1 / G1.1). Filter-only: chips are
 * actions, never decoration. Selected = inverted greys + check + aria-pressed,
 * so the state never depends on colour alone.
 */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ selected = false, className, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-tap items-center gap-1.5 rounded-pill px-3 text-meta font-medium transition-colors",
        selected ? "bg-chip-active text-on-chip-active" : "bg-chip text-on-chip hover:bg-surface",
        className,
      )}
      {...props}
    >
      {selected ? <Check aria-hidden="true" className="size-3.5" /> : null}
      {children}
    </button>
  ),
);
Chip.displayName = "Chip";
