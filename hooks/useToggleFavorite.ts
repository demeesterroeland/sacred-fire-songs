'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { toggleFavorite } from '@/app/actions/toggleFavorite';
import { SONG_KEYS } from '@/lib/songs/queryKeys';

/**
 * Handles heart-button state for a single song.
 * Owns: optimistic update, server action call, and ['favorites'] cache invalidation.
 * Usage: const { isFav, handleToggle } = useToggleFavorite(id, isFavorite);
 */
export function useToggleFavorite(id: string, initialIsFavorite: boolean = false) {
    const [isFav, setIsFav] = useState(initialIsFavorite);
    const queryClient = useQueryClient();

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
            if (result.error === 'Not authenticated') {
                toast('Sign in to save favorites', {
                    action: {
                        label: 'Sign in →',
                        onClick: () => { window.location.href = '/auth/login'; },
                    },
                    classNames: {
                        actionButton: 'text-amber-400 text-xs font-bold hover:text-amber-300 transition-colors ml-2',
                    },
                });
            }
        } else {
            // Invalidate the shared favorites cache so every consumer sees fresh data
            queryClient.invalidateQueries({ queryKey: SONG_KEYS.allFavorites() });
        }
    };

    return { isFav, handleToggle };
}
