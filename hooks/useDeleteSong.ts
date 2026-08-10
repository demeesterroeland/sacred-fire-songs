'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SONG_KEYS } from '@/lib/songs/queryKeys';

/**
 * Handles song deletion from any page.
 * Owns: supabase delete, ['songs'] cache invalidation, router refresh, optional redirect.
 * Usage: const { isDeleting, deleteSong } = useDeleteSong();
 */
export function useDeleteSong() {
    const [isDeleting, setIsDeleting] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();

    const deleteSong = async (id: string, options?: { redirectTo?: string }): Promise<boolean> => {
        setIsDeleting(true);
        const supabase = createClient();
        const { error } = await supabase.from('compositions').delete().eq('id', id);

        if (error) {
            alert('Failed to delete song: ' + error.message);
            setIsDeleting(false);
            return false;
        }

        // Invalidate all song lists so every page refetches
        await queryClient.invalidateQueries({ queryKey: SONG_KEYS.all() });
        // Bust the global filter counts (chords/melody/mine may have changed)
        queryClient.invalidateQueries({ queryKey: SONG_KEYS.globalFilterCounts() });
        router.refresh(); // also bust Next.js Router Cache for Server Components

        if (options?.redirectTo) {
            router.push(options.redirectTo);
        }

        setIsDeleting(false);
        return true;
    };

    return { isDeleting, deleteSong };
}
