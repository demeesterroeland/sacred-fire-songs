'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/context/LocaleContext';
import CreateSheet from '@/components/common/CreateSheet';

/**
 * "+" in the Library header (Story 6.1.24, #408, UXD-1): the phone's way to add
 * a song or playlist now that Create left the bottom bar. Signed-in users only;
 * from `lg` the header's Create menu does the same.
 */
export default function LibraryCreateButton() {
    const { t } = useLocale();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);

    if (!user) return null;

    return (
        <>
            <button
                type="button"
                aria-label={t('nav.create')}
                aria-haspopup="dialog"
                onClick={() => setOpen(true)}
                className="inline-flex size-tap shrink-0 items-center justify-center rounded-pill border border-line-strong text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus lg:hidden"
            >
                <Plus className="size-5" aria-hidden />
            </button>
            <CreateSheet isOpen={open} onClose={() => setOpen(false)} />
        </>
    );
}
