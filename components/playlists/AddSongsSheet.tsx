// components/playlists/AddSongsSheet.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { X, Search, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { addSongToPlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { actionErrorMessage } from '@/lib/errors/actionError';

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
    const { t } = useLocale();
    const [query, setQuery] = useState('');
    const [songs, setSongs] = useState<Song[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [addedIds, setAddedIds] = useState(new Set(existingCompositionIds));
    const [, startTransition] = useTransition();
    const router = useRouter();

    // Sync checked state when the caller's list changes (e.g. after page refresh)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional sync of local state with props/route; refactor tracked separately (Epic 5.1 lint ratchet)
        setAddedIds(new Set(existingCompositionIds));
    }, [existingCompositionIds]);

    // Reset + initial search when sheet opens
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        if (!open) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional sync of local state with props/route; refactor tracked separately (Epic 5.1 lint ratchet)
        setQuery('');
        setAddedIds(new Set(existingCompositionIds));
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Debounced search
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        if (!open) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional sync of local state with props/route; refactor tracked separately (Epic 5.1 lint ratchet)
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
                toast.error(actionErrorMessage(result.error, t));
                // revert optimistic
                setAddedIds(prev => {
                    const next = new Set(prev);
                    wasAdded ? next.add(compositionId) : next.delete(compositionId);
                    return next;
                });
            } else {
                toast.success(t(result.added ? 'playlists.addSongs.added' : 'playlists.addSongs.removed', { title }));
                router.refresh();
            }
        });
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-scrim backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-sheet border-t border-line bg-surface">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="h-1 w-10 rounded-pill bg-line-strong" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 shrink-0">
                    <h2 className="font-bold text-fg">{t('playlists.addSongs.title')}</h2>
                    <button
                        onClick={onClose}
                        className="size-tap rounded-control text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                        aria-label={t('common.close')}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search input */}
                <div className="px-4 pb-3 shrink-0">
                    <div className="flex items-center gap-2 rounded-control bg-surface-2 px-3 py-2.5">
                        {isSearching
                            ? <Loader2 className="w-4 h-4 shrink-0 animate-spin text-fg-muted" />
                            : <Search className="w-4 h-4 shrink-0 text-fg-muted" />
                        }
                        <input
                            autoFocus
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder={t('playlists.addSongs.search')}
                            className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-fg-subtle"
                        />
                    </div>
                </div>

                {/* Song list */}
                <div className="overflow-y-auto flex-1 pb-6">
                    {!isSearching && songs.length === 0 && (
                        <p className="py-10 text-center text-sm text-fg-muted">{t('playlists.addSongs.empty')}</p>
                    )}
                    {songs.map(song => {
                        const inPlaylist = addedIds.has(song.id);
                        return (
                            <button
                                key={song.id}
                                onClick={() => handleToggle(song.id, song.title)}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2 ${!song.is_public ? 'opacity-70 hover:opacity-100' : ''}`}
                            >
                                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                    {inPlaylist && <Check className="w-4 h-4 text-accent" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-medium text-fg">{song.title}</p>
                                        {!song.is_public && (
                                            <span className="text-caption font-semibold bg-surface-2 text-fg-muted px-1.5 py-0.5 rounded border border-line shrink-0">
                                                {t('search.status.draft')}
                                            </span>
                                        )}
                                    </div>
                                    {song.original_author && (
                                        <p className="truncate text-xs text-fg-muted">{song.original_author}</p>
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
