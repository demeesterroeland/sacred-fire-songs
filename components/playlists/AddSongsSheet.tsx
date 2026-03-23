// components/playlists/AddSongsSheet.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { X, Search, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { addSongToPlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Song {
    id: string;
    title: string;
    original_author: string | null;
    is_public: boolean;
}

interface AddSongsSheetProps {
    playlistId: string;
    existingCompositionIds: string[];
    open: boolean;
    onClose: () => void;
}

export function AddSongsSheet({ playlistId, existingCompositionIds, open, onClose }: AddSongsSheetProps) {
    const [query, setQuery] = useState('');
    const [songs, setSongs] = useState<Song[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [addedIds, setAddedIds] = useState(new Set(existingCompositionIds));
    const [, startTransition] = useTransition();
    const router = useRouter();

    // Sync checked state when the caller's list changes (e.g. after page refresh)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        setAddedIds(new Set(existingCompositionIds));
    }, [existingCompositionIds]);

    // Reset + initial search when sheet opens
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        if (!open) return;
        setQuery('');
        setAddedIds(new Set(existingCompositionIds));
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Debounced search
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        if (!open) return;
        setIsSearching(true);
        const timeout = setTimeout(async () => {
            const supabase = createClient();
            // Show all songs the user can access (RLS handles visibility)
            // No is_public filter — owner should see their own drafts too
            let q = supabase
                .from('compositions')
                .select('id, title, original_author, is_public')
                .order('title', { ascending: true })
                .limit(50);
            if (query.trim()) q = q.ilike('title', `%${query.trim()}%`);
            const { data } = await q;
            setSongs(data ?? []);
            setIsSearching(false);
        }, 200);
        return () => clearTimeout(timeout);
    }, [query, open]);

    const handleToggle = (compositionId: string, title: string) => {
        const wasAdded = addedIds.has(compositionId);
        setAddedIds(prev => {
            const next = new Set(prev);
            wasAdded ? next.delete(compositionId) : next.add(compositionId);
            return next;
        });

        startTransition(async () => {
            const result = await addSongToPlaylist(playlistId, compositionId);
            if (result.error) {
                toast.error(result.error);
                // revert optimistic
                setAddedIds(prev => {
                    const next = new Set(prev);
                    wasAdded ? next.add(compositionId) : next.delete(compositionId);
                    return next;
                });
            } else {
                toast.success(result.added ? `Added "${title}"` : `Removed "${title}"`);
                router.refresh();
            }
        });
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 rounded-t-2xl max-h-[80vh]">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 shrink-0">
                    <h2 className="font-bold text-gray-900 dark:text-gray-100">Add Songs</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search input */}
                <div className="px-4 pb-3 shrink-0">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2.5">
                        {isSearching
                            ? <Loader2 className="w-4 h-4 text-gray-500 animate-spin shrink-0" />
                            : <Search className="w-4 h-4 text-gray-500 shrink-0" />
                        }
                        <input
                            autoFocus
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search songs…"
                            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none"
                        />
                    </div>
                </div>

                {/* Song list */}
                <div className="overflow-y-auto flex-1 pb-6">
                    {!isSearching && songs.length === 0 && (
                        <p className="text-center text-sm text-gray-600 py-10">No songs found.</p>
                    )}
                    {songs.map(song => {
                        const inPlaylist = addedIds.has(song.id);
                        return (
                            <button
                                key={song.id}
                                onClick={() => handleToggle(song.id, song.title)}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition-colors text-left ${!song.is_public ? 'opacity-70 hover:opacity-100' : ''}`}
                            >
                                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                    {inPlaylist && <Check className="w-4 h-4 text-amber-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{song.title}</p>
                                        {!song.is_public && (
                                            <span className="text-[9px] font-black bg-gray-200 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-700 uppercase tracking-tighter shrink-0">
                                                Draft
                                            </span>
                                        )}
                                    </div>
                                    {song.original_author && (
                                        <p className="text-xs text-gray-500 truncate">{song.original_author}</p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
