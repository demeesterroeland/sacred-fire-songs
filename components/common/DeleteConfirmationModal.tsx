'use client';

import { useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isDeleting?: boolean;
    /**
     * Where focus goes when the opener is gone (e.g. the deleted row's menu button) so it does not
     * fall to <body>. Called on close; return null to leave it to the browser.
     */
    fallbackFocus?: () => HTMLElement | null;
}

/**
 * "Are you sure?" before a destructive action (Story 6.1.34 / G9.2, #418).
 * A real alert dialog (Radix): focus moves to Cancel when it opens, Tab stays inside, Escape closes only
 * this dialog, and focus returns to what opened it. Whatever sits behind it (a page, the Practice panel)
 * is hidden from assistive technology while it is open.
 */
export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isDeleting = false,
    fallbackFocus,
}: DeleteConfirmationModalProps) {
    const { t } = useLocale();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const opener = useRef<HTMLElement | null>(null);

    return (
        <DialogPrimitive.Root
            open={isOpen}
            onOpenChange={(open) => {
                // Not while the delete is running: the dialog stays until it finishes.
                if (!open && !isDeleting) onClose();
            }}
        >
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    data-testid="delete-confirmation-overlay"
                    className="fixed inset-0 z-[70] bg-scrim motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=open]:fade-in-0"
                />
                <DialogPrimitive.Content
                    role="alertdialog"
                    data-testid="delete-confirmation"
                    onOpenAutoFocus={(e) => {
                        // Cancel is the safe default for a destructive question.
                        e.preventDefault();
                        const active = document.activeElement;
                        opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
                        cancelRef.current?.focus({ preventScroll: true });
                    }}
                    onCloseAutoFocus={(e) => {
                        const target = opener.current?.isConnected ? opener.current : (fallbackFocus?.() ?? null);
                        opener.current = null;
                        if (target) {
                            e.preventDefault();
                            target.focus({ preventScroll: true });
                        }
                    }}
                    className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-panel border border-line-strong bg-surface p-6 text-fg shadow-sheet outline-none motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=open]:fade-in-0"
                >
                    <div className="mb-4 flex items-start gap-4">
                        <div className="shrink-0 rounded-pill bg-danger/10 p-3 text-danger">
                            <AlertTriangle aria-hidden="true" className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <DialogPrimitive.Title className="text-title font-semibold text-fg">{title}</DialogPrimitive.Title>
                            <p className="text-meta text-danger">{t('feedback.delete.body')}</p>
                        </div>
                    </div>

                    <DialogPrimitive.Description className="mb-6 text-body text-fg-muted">
                        {message}
                    </DialogPrimitive.Description>

                    <div className="grid grid-cols-2 gap-3">
                        <Button ref={cancelRef} type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <span aria-hidden="true" className="size-4 animate-spin rounded-pill border-2 border-on-danger/30 border-t-on-danger motion-reduce:animate-none" />
                                    {t('common.deleting')}
                                </>
                            ) : (
                                <>
                                    <Trash2 aria-hidden="true" />
                                    {t('common.yesDelete')}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
