"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { clampSwipe, shouldDismissSheet } from "@/lib/design/swipeDismiss";

/**
 * Bottom sheet (component sheet, Story 6.1.1 / G1.1, #385). The one floating
 * layer for menus, pickers and action sheets: anchored to the bottom on phones,
 * a centred dialog from `sm` up. Surface + sheet radius + the only shadow.
 * Reserves room for the mini player via `--mini-player-h` (#396). On phones the
 * 32 px handle on top follows a swipe down and closes the sheet (Story 6.1.17 / G4.4, #401).
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
>(({ title, hideTitle, description, className, style, children, ...props }, ref) => {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const drag = React.useRef<{ startY: number; startT: number } | null>(null);
  const [dragY, setDragY] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
    setDragY(0);
  };
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // primary button / touch / pen only
    drag.current = { startY: e.clientY, startT: e.timeStamp };
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current) setDragY(clampSwipe(e.clientY - drag.current.startY));
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    endDrag();
    if (start && shouldDismissSheet(clampSwipe(e.clientY - start.startY), e.timeStamp - start.startT)) {
      closeRef.current?.click();
    }
  };

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay data-sheet-overlay="" className="fixed inset-0 z-50 bg-scrim" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-sheet border-t border-line bg-surface text-fg shadow-sheet outline-none",
          "pb-[calc(env(safe-area-inset-bottom,0px)+var(--mini-player-h,0px))]",
          "sm:inset-0 sm:m-auto sm:h-fit sm:w-full sm:max-w-md sm:rounded-panel sm:border sm:pb-0",
          !dragging && "motion-safe:transition-transform",
          className,
        )}
        style={dragY ? { ...style, transform: `translateY(${dragY}px)` } : style}
        {...(description ? {} : { "aria-describedby": undefined })}
        {...props}
      >
        {/* 32 px drag handle (phones): swipe down to close. */}
        <div
          data-sheet-handle
          className="flex h-8 shrink-0 cursor-grab touch-none items-center justify-center sm:hidden"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
        >
          <div aria-hidden="true" className="h-1 w-10 rounded-pill bg-line" />
        </div>
        <DialogPrimitive.Close ref={closeRef} tabIndex={-1} aria-hidden="true" className="sr-only" />
        <div className={cn("px-4 pb-2 pt-1 sm:pt-3", hideTitle && "sr-only")}>
          <DialogPrimitive.Title className="text-row font-semibold text-fg">{title}</DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="mt-1 text-meta text-fg-muted">{description}</DialogPrimitive.Description>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
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
