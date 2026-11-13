// components/playlists/AddSongsSheet.tsx
'use client';

import { useId, useMemo, useState, useTransition } from 'react';
import { Search, Check, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { addSongToPlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { actionErrorMessage } from '@/lib/errors/actionError';
import { fetchAllSongs } from '@/lib/songUtils';
import { SONG_KEYS, SONGS_STALE_TIME } from '@/lib/songs/queryKeys';
import { songMatchHintText } from '@/lib/songs/search';
import { addSongsResults } from '@/lib/playlists/addSongsSearch';
import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AddSongsSheetProps {
    playlistId: string;
    existingCompositionIds: string[];
    open: boolean;
    onClose: () => void;
}

/**
 * "+ Add Songs" (Story 6.2.22 / G5.5, #542). The songs are the song list's own (`fetchAllSongs`, the same react-query
 * entry, so aliases, authors and songbook titles are there) and are filtered in the browser with the list's matcher
 * and ranking; each row names why it matched, like the list does. The sheet has no select of its own.
 */
export function AddSongsSheet({ playlistId, existingCompositionIds, open, onClose }: AddSongsSheetProps) {
    const { t } = useLocale();
    return (
        <BottomSheet open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
            <BottomSheetContent title={t('playlists.addSongs.title')}>
                {/* Mounted only while the sheet is open, so the search and the pending toggles start empty each time. */}
                <AddSongsBody playlistId={playlistId} existingCompositionIds={existingCompositionIds} />
            </BottomSheetContent>
        </BottomSheet>
    );
}

function AddSongsBody({ playlistId, existingCompositionIds }: Pick<AddSongsSheetProps, 'playlistId' | 'existingCompositionIds'>) {
    const { t } = useLocale();
    const router = useRouter();
    const idBase = useId();
    const [query, setQuery] = useState('');
    // Toggles pressed here, ahead of the server (true = in the playlist); the rest follows the playlist the page holds.
    const [toggled, setToggled] = useState<ReadonlyMap<string, boolean>>(new Map());
    const [, startTransition] = useTransition();

    const { data: songs, isLoading, isError } = useQuery({
        queryKey: SONG_KEYS.list(),
        queryFn: fetchAllSongs,
        staleTime: SONGS_STALE_TIME,
    });

    // A failed background refetch keeps the songs already there; the banner is for when there is nothing to show.
    const showError = isError && !songs;

    const existing = useMemo(() => new Set(existingCompositionIds), [existingCompositionIds]);
    const isAdded = (id: string) => toggled.get(id) ?? existing.has(id);

    const results = useMemo(() => addSongsResults(songs ?? [], query), [songs, query]);
    // Why each row matched, worked out once per result list / query / language (the list does the same).
    const hints = useMemo(() => {
        const out = new Map<string, string>();
        if (!query.trim()) return out;
        for (const song of results) {
            const text = songMatchHintText(song, query, t);
            if (text) out.set(song.id, text);
        }
        return out;
    }, [results, query, t]);

    const setAdded = (id: string, value: boolean | null) =>
        setToggled((prev) => {
            const next = new Map(prev);
            if (value === null) next.delete(id);
            else next.set(id, value);
            return next;
        });

    const handleToggle = (compositionId: string, title: string) => {
        const wasAdded = isAdded(compositionId);
        setAdded(compositionId, !wasAdded);

        startTransition(async () => {
            const result = await addSongToPlaylist(playlistId, compositionId);
            if (result.error) {
                toast.error(actionErrorMessage(result.error, t));
                setAdded(compositionId, wasAdded); // revert optimistic
            } else {
                toast.success(t(result.added ? 'playlists.addSongs.added' : 'playlists.addSongs.removed', { title }));
                router.refresh();
            }
        });
    };

    return (
        <>
            {/* Search input: sticks to the top of the sheet's scroll area, so it stays in reach while the rows scroll. */}
            <div data-testid="add-songs-search" className="sticky top-0 z-10 bg-surface px-4 pb-3">
                <div className="field-composite flex min-h-tap items-center gap-2 rounded-control border border-line-strong bg-bg px-3">
                    {isLoading
                        ? <Loader2 aria-hidden="true" className="size-4 shrink-0 text-fg-subtle motion-safe:animate-spin" />
                        : <Search aria-hidden="true" className="size-4 shrink-0 text-fg-subtle" />}
                    <input
                        autoFocus
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('playlists.addSongs.search')}
                        aria-label={t('playlists.addSongs.search')}
                        className="h-tap min-w-0 flex-1 bg-transparent text-body text-fg placeholder:text-fg-subtle"
                    />
                </div>
                <span role="status" className="sr-only">{isLoading ? t('common.loading') : ''}</span>
            </div>

            {/* Song list */}
            <div className="pb-2" role="group" aria-label={t('playlists.addSongs.title')}>
                {showError && (
                    <p role="alert" className="px-4 py-10 text-center text-meta text-fg-muted">{t('playlists.addSongs.loadError')}</p>
                )}
                {!isLoading && !showError && results.length === 0 && (
                    <p className="px-4 py-10 text-center text-meta text-fg-muted">{t('playlists.addSongs.empty')}</p>
                )}
                {results.map((song) => {
                    const inPlaylist = isAdded(song.id);
                    const hint = hints.get(song.id);
                    const titleId = `${idBase}-title-${song.id}`;
                    const hintId = `${idBase}-hint-${song.id}`;
                    return (
                        <button
                            key={song.id}
                            type="button"
                            role="checkbox"
                            aria-checked={inPlaylist}
                            aria-labelledby={titleId}
                            aria-describedby={hint ? hintId : undefined}
                            data-testid="add-song-row"
                            onClick={() => handleToggle(song.id, song.title)}
                            className="flex min-h-tap w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-surface-2"
                        >
                            <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center">
                                {inPlaylist && <Check className="size-5 text-accent" />}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                    <span id={titleId} className={cn('truncate text-row font-medium', song.isPublic === false ? 'text-fg-subtle' : 'text-fg')}>
                                        {song.title}
                                    </span>
                                    {song.isPublic === false && (
                                        <span className="shrink-0 rounded-control border border-line bg-surface-2 px-1.5 py-0.5 text-caption font-semibold text-fg-muted">
                                            {t('search.status.draft')}
                                        </span>
                                    )}
                                </span>
                                {song.author && <span className="block truncate text-meta text-fg-muted">{song.author}</span>}
                                {hint && (
                                    <span id={hintId} data-testid="add-song-match" className="block truncate text-meta text-fg-muted">
                                        {hint}
                                    </span>
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Always-visible way out: the drag handle is phones only, so desktop would have only Escape. */}
            <div data-testid="add-songs-footer" className="sticky bottom-0 border-t border-line bg-surface p-3">
                <BottomSheetClose asChild>
                    <Button type="button" variant="outline" className="w-full">{t('playlists.addSongs.done')}</Button>
                </BottomSheetClose>
            </div>
        </>
    );
}
