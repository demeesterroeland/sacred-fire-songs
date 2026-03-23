// components/playlists/PlaylistPicker.tsx
'use client';

import { useState, useRef, useTransition } from 'react';
import { Plus, Check, ListPlus, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { addSongToPlaylist, createPlaylist } from '@/app/actions/playlistActions';
import { PLAYLIST_KEYS } from '@/lib/songs/queryKeys';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PlaylistPickerProps {
    compositionId: string;
    userId: string;
    /** className for the trigger button */
    triggerClassName?: string;
    /** className for the ListPlus icon — defaults to w-3.5 h-3.5 */
    iconClassName?: string;
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchUserPlaylists(userId: string) {
    const supabase = createClient();
    const { data } = await supabase
        .from('setlists')
        .select('id, title')
        .eq('owner_id', userId)
        .not('title', 'in', '("My Favorites","My Songs","My Drafts")')
        .order('created_at', { ascending: false });
    return data ?? [];
}

async function fetchContainingPlaylists(compositionId: string) {
    const supabase = createClient();
    const { data } = await supabase
        .from('setlist_items')
        .select('setlist_id, song_versions!inner(composition_id)')
        .eq('song_versions.composition_id', compositionId);
    return new Set((data ?? []).map(d => d.setlist_id));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlaylistPicker({ compositionId, userId, triggerClassName, iconClassName }: PlaylistPickerProps) {
    const [open, setOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [isCreating, startCreateTransition] = useTransition();
    const queryClient = useQueryClient();

    const { data: playlists = [], isLoading: loadingPlaylists } = useQuery({
        queryKey: PLAYLIST_KEYS.list(userId),
        queryFn: () => fetchUserPlaylists(userId),
        enabled: open,
    });

    const { data: containingIds = new Set<string>(), isLoading: loadingContaining } = useQuery({
        queryKey: PLAYLIST_KEYS.containingComposition(compositionId),
        queryFn: () => fetchContainingPlaylists(compositionId),
        enabled: open,
    });

    const isLoading = loadingPlaylists || loadingContaining;

    const pendingRef = useRef(new Set<string>());

    const handleToggle = async (playlistId: string, playlistTitle: string) => {
        if (pendingRef.current.has(playlistId)) return;
        pendingRef.current.add(playlistId);

        const wasIn = containingIds.has(playlistId);

        // Optimistic update
        queryClient.setQueryData<Set<string>>(
            PLAYLIST_KEYS.containingComposition(compositionId),
            prev => {
                const next = new Set(prev);
                if (wasIn) next.delete(playlistId);
                else next.add(playlistId);
                return next;
            }
        );

        try {
            const result = await addSongToPlaylist(playlistId, compositionId);
            if (result.error) {
                toast.error(result.error);
                // revert
                queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.containingComposition(compositionId) });
            } else {
                toast.success(result.added ? `Added to "${playlistTitle}"` : `Removed from "${playlistTitle}"`);
            }
        } finally {
            pendingRef.current.delete(playlistId);
        }
    };

    const handleCreate = () => {
        const trimmed = newTitle.trim();
        if (!trimmed) return;

        startCreateTransition(async () => {
            const result = await createPlaylist(trimmed);
            if ('error' in result) {
                toast.error(result.error);
                return;
            }
            // Add the song to the new playlist
            const addResult = await addSongToPlaylist(result.id, compositionId);
            if (addResult.error) {
                toast.error(`Playlist created but song could not be added: ${addResult.error}`);
            } else {
                toast.success(`Added to new playlist "${trimmed}"`);
                setNewTitle('');
            }
            queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.list(userId) });
            queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.containingComposition(compositionId) });
        });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    aria-label="Add to playlist"
                    className={cn(
                        'p-1 rounded-full transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
                        triggerClassName
                    )}
                >
                    <ListPlus className={iconClassName ?? 'w-3.5 h-3.5'} />
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
                {/* New playlist input */}
                <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-800">
                    <input
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => {
                            e.stopPropagation();
                            if (e.key === 'Enter') handleCreate();
                            if (e.key === 'Escape') setOpen(false);
                        }}
                        placeholder="New playlist…"
                        disabled={isCreating}
                        className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={!newTitle.trim() || isCreating}
                        className="text-amber-400 hover:text-amber-300 disabled:opacity-30 transition-colors"
                    >
                        {isCreating
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Plus className="w-4 h-4" />
                        }
                    </button>
                </div>

                {/* Playlist list */}
                <div className="max-h-56 overflow-y-auto py-1">
                    {isLoading && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                        </div>
                    )}
                    {!isLoading && playlists.length === 0 && (
                        <p className="text-xs text-gray-600 text-center py-4 px-3">
                            No playlists yet — create one above.
                        </p>
                    )}
                    {!isLoading && playlists.map(pl => (
                        <button
                            key={pl.id}
                            onClick={() => handleToggle(pl.id, pl.title)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                            <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                {containingIds.has(pl.id) && (
                                    <Check className="w-3.5 h-3.5 text-amber-400" />
                                )}
                            </div>
                            <span className="truncate">{pl.title}</span>
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
