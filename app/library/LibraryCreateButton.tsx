'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/context/LocaleContext';
import CreateSheet from '@/components/common/CreateSheet';
import { ACTION_BAR_BOTTOM } from '@/lib/song/actionBar';

/**
 * "+" on the Library lists (Story 6.1.24, #408, UXD-1): the phone's way to add a song or playlist now that
 * Create left the bottom bar. It floats at the bottom right (validation 2, item 2), above the bottom bar,
 * or above the mini player when that shows, like the song action bar. Signed-in users only; from `lg` the
 * header's Create menu does the same.
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
                data-testid="library-create-fab"
                onClick={() => setOpen(true)}
                style={{ bottom: `calc(${ACTION_BAR_BOTTOM} + 1rem)` }}
                className="fixed right-4 z-30 inline-flex size-14 items-center justify-center rounded-panel bg-accent text-on-accent shadow-sheet transition-[colors,bottom] duration-200 hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none lg:hidden"
            >
                <Plus className="size-6" aria-hidden />
            </button>
            <CreateSheet isOpen={open} onClose={() => setOpen(false)} />
        </>
    );
}
