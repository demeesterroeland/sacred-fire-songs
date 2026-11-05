"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet (component sheet, Story 6.1.1 / G1.1, #385). The one floating
 * layer for menus, pickers and action sheets: anchored to the bottom on phones,
 * a centred dialog from `sm` up. Surface + sheet radius + the only shadow.
 * Reserves room for the mini player via `--mini-player-h` (#396).
 */
export const BottomSheet = DialogPrimitive.Root;
export const BottomSheetTrigger = DialogPrimitive.Trigger;
export const BottomSheetClose = DialogPrimitive.Close;

export interface BottomSheetContentProps extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, "title"> {
  title: React.ReactNode;
  /** Visually hide the title (it stays for screen readers). */
  hideTitle?: boolean;
  description?: React.ReactNode;
}

export const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  BottomSheetContentProps
>(({ title, hideTitle, description, className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-scrim motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-sheet border-t border-line bg-surface text-fg shadow-sheet outline-none",
        "pb-[calc(env(safe-area-inset-bottom,0px)+var(--mini-player-h,0px))]",
        "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-panel sm:border sm:pb-0",
        "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:slide-in-from-bottom-4",
        className,
      )}
      {...(description ? {} : { "aria-describedby": undefined })}
      {...props}
    >
      <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-pill bg-line sm:hidden" />
      <div className={cn("px-4 pb-2 pt-3", hideTitle && "sr-only")}>
        <DialogPrimitive.Title className="text-row font-semibold text-fg">{title}</DialogPrimitive.Title>
        {description ? (
          <DialogPrimitive.Description className="mt-1 text-meta text-fg-muted">{description}</DialogPrimitive.Description>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
BottomSheetContent.displayName = "BottomSheetContent";

export interface SheetActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  tone?: "default" | "danger";
}

/** One row in an action sheet: 44 px+, icon + label; danger rows are red text, never red alone. */
export const SheetAction = React.forwardRef<HTMLButtonElement, SheetActionProps>(
  ({ icon, tone = "default", className, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "flex min-h-tap w-full items-center gap-3 px-4 py-3 text-left text-body transition-colors hover:bg-surface-2 disabled:opacity-50",
        tone === "danger" ? "text-danger" : "text-fg",
        className,
      )}
      {...props}
    >
      {icon ? <span aria-hidden="true" className="shrink-0 [&_svg]:size-5">{icon}</span> : null}
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  ),
);
SheetAction.displayName = "SheetAction";

/** Divider between action groups (e.g. before Delete). */
export function SheetSeparator({ className }: { className?: string }) {
  return <div role="separator" className={cn("my-1 h-px bg-line", className)} />;
}
