'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { toggleFavorite } from '@/app/actions/toggleFavorite';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import { useLocale } from '@/context/LocaleContext';

/**
 * Handles heart-button state for a single song.
 * Owns: optimistic update, server action call, and ['favorites'] cache invalidation.
 * Guests: a rejected toggle reverts the heart and opens `signInGate`; render
 * `<GuestGateSheet feature="favourites" {...signInGate} />` next to the heart.
 * Usage: const { isFav, handleToggle, signInGate } = useToggleFavorite(id, isFavorite);
 */
export function useToggleFavorite(id: string, initialIsFavorite: boolean = false) {
    const [isFav, setIsFav] = useState(initialIsFavorite);
    const [signInGateOpen, setSignInGateOpen] = useState(false);
    const queryClient = useQueryClient();
    const { t } = useLocale();

    // Sync when the parent re-derives the value (e.g. after a React Query refetch)
    useEffect(() => {
        setIsFav(initialIsFavorite);
    }, [initialIsFavorite]);

    const handleToggle = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        const optimistic = !isFav;
        setIsFav(optimistic);

        const result = await toggleFavorite(id);

        if ('error' in result) {
            setIsFav(isFav); // revert on failure
            // Guests get the GuestGate sheet (i18n, sign-in link keeps the query string in next=).
            if (result.error === 'Not authenticated') setSignInGateOpen(true);
        } else {
            toast.success(t(result.isFavorite ? 'favorites.toast.added' : 'favorites.toast.removed'), {
                action: {
                    label: t('favorites.toast.view'),
                    onClick: () => { window.location.href = '/songs?favorites=true'; },
                },
            });
            // Invalidate the shared favorites cache so every consumer sees fresh data
            queryClient.invalidateQueries({ queryKey: SONG_KEYS.allFavorites() });
            // Bust the global filter counts so the favoritesCount badge refreshes
            queryClient.invalidateQueries({ queryKey: SONG_KEYS.globalFilterCounts() });
        }
    };

    return { isFav, handleToggle, signInGate: { open: signInGateOpen, onOpenChange: setSignInGateOpen } };
}
