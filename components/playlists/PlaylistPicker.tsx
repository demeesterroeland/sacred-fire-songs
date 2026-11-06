// components/playlists/PlaylistPicker.tsx
'use client';

import { useRef, useState, useTransition } from 'react';
import { Plus, Check, ListPlus, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BottomSheet, BottomSheetClose, BottomSheetContent, BottomSheetTrigger } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { addSongToPlaylist, createPlaylist } from '@/app/actions/playlistActions';
import { fetchContainingPlaylists, fetchUserPlaylists } from '@/lib/playlists/pickerQueries';
import { buildPickerRows, toggleMembership } from '@/lib/playlists/pickerModel';
import { PLAYLIST_KEYS } from '@/lib/songs/queryKeys';
import { cn } from '@/lib/utils';
import { useLocale } from '@/context/LocaleContext';
import { actionErrorMessage } from '@/lib/errors/actionError';

interface PlaylistPickerProps {
    compositionId: string;
    userId: string;
    /** className for the trigger button */
    triggerClassName?: string;
    /** className for the ListPlus icon — defaults to w-3.5 h-3.5 */
    iconClassName?: string;
    label?: string;
    /** className for the icon + label wrapper (only when `label` is set) */
    contentClassName?: string;
    /** className for the label text */
    labelClassName?: string;
    triggerTestId?: string;
    /** Called when the sheet opens or closes (e.g. to close a parent menu once the sheet is dismissed) */
    onOpenChange?: (open: boolean) => void;
}

const ROW = 'flex min-h-tap w-full items-center gap-3 px-4 py-3 text-left text-body text-fg transition-colors hover:bg-surface-2 disabled:opacity-50';
const TOAST_ACTION = { actionButton: 'ml-2 text-meta font-semibold text-accent' };

/**
 * Add to playlist as a bottom sheet (Story 6.1.30 / G8.1, #414): "New playlist"
 * is the first row, every playlist is a check row (checked = the song is in it),
 * and tapping a row adds or removes the song. Creation goes through the same
 * `createPlaylist` action as the Add playlist page (Story 3.1.4.6).
 */
export function PlaylistPicker({ compositionId, userId, triggerClassName, iconClassName, label, contentClassName, labelClassName, triggerTestId, onOpenChange }: PlaylistPickerProps) {
    const { t } = useLocale();
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [isCreating, startCreateTransition] = useTransition();
    const queryClient = useQueryClient();
    const containingKey = PLAYLIST_KEYS.containingComposition(compositionId);

    const { data: playlists = [], isLoading: loadingPlaylists } = useQuery({
        queryKey: PLAYLIST_KEYS.list(userId),
        queryFn: () => fetchUserPlaylists(userId),
        enabled: open,
    });

    const { data: containingIds = new Set<string>(), isLoading: loadingContaining } = useQuery({
        queryKey: containingKey,
        queryFn: () => fetchContainingPlaylists(compositionId),
        enabled: open,
        // Playlists change elsewhere (playlist page, other tabs): check marks are fetched fresh on open.
        staleTime: 0,
        refetchOnMount: 'always',
    });

    const isLoading = loadingPlaylists || loadingContaining;
    const pendingRef = useRef(new Set<string>());

    const openAction = (playlistId: string) => ({
        label: t('playlists.openPlaylist'),
        onClick: () => { window.location.href = `/library/playlists/${playlistId}`; },
    });

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        onOpenChange?.(next);
        if (!next) {
            setCreating(false);
            setNewTitle('');
        }
    };

    const handleToggle = async (playlistId: string, playlistTitle: string) => {
        if (pendingRef.current.has(playlistId)) return;
        pendingRef.current.add(playlistId);

        // Optimistic update
        queryClient.setQueryData<Set<string>>(containingKey, prev => toggleMembership(prev ?? new Set(), playlistId));

        try {
            const result = await addSongToPlaylist(playlistId, compositionId);
            if (result.error) {
                toast.error(actionErrorMessage(result.error, t));
                queryClient.invalidateQueries({ queryKey: containingKey }); // revert
            } else {
                // The server decides: keep the check mark in line with what it did.
                queryClient.setQueryData<Set<string>>(containingKey, prev => {
                    const next = new Set(prev ?? []);
                    if (result.added) next.add(playlistId); else next.delete(playlistId);
                    return next;
                });
                toast.success(
                    t(result.added ? 'playlists.picker.added' : 'playlists.picker.removed', { playlist: playlistTitle }),
                    { action: openAction(playlistId), classNames: TOAST_ACTION },
                );
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
                toast.error(actionErrorMessage(result.error, t));
                return;
            }
            const addResult = await addSongToPlaylist(result.id, compositionId);
            if (addResult.error) {
                toast.error(t('playlists.picker.createdButNotAdded'));
                // The playlist exists now: a second Create would make a duplicate.
                setNewTitle('');
                setCreating(false);
            } else {
                toast.success(t('playlists.picker.addedToNew', { name: trimmed }), {
                    action: openAction(result.id),
                    classNames: TOAST_ACTION,
                });
                setNewTitle('');
                setCreating(false);
            }
            queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.list(userId) });
            queryClient.invalidateQueries({ queryKey: containingKey });
        });
    };

    return (
        <BottomSheet open={open} onOpenChange={handleOpenChange}>
            <BottomSheetTrigger asChild>
                <button
                    type="button"
                    data-testid={triggerTestId}
                    aria-label={t('playlists.picker.addToPlaylist')}
                    className={cn(
                        'rounded-pill p-1 text-fg-muted transition-colors hover:text-fg',
                        triggerClassName
                    )}
                >
                    {label ? (
                        <div className={contentClassName ?? 'flex w-full items-center gap-4'}>
                            <ListPlus className={iconClassName ?? 'w-3.5 h-3.5'} aria-hidden />
                            <span className={labelClassName ?? 'text-body font-semibold'}>{label}</span>
                        </div>
                    ) : (
                        <ListPlus className={iconClassName ?? 'w-3.5 h-3.5'} />
                    )}
                </button>
            </BottomSheetTrigger>
            <BottomSheetContent
                title={t('playlists.picker.addToPlaylist')}
                // Escape in the name field cancels the field, not the whole sheet.
                onEscapeKeyDown={e => {
                    if (creating) {
                        e.preventDefault();
                        setCreating(false);
                    }
                }}
            >
                <div role="group" aria-label={t('playlists.picker.addToPlaylist')}>
                    {buildPickerRows(isLoading ? [] : playlists, containingIds).map(row => {
                        if (row.kind === 'new') {
                            // First row: create a new playlist
                            return creating ? (
                                <div key="new">
                                    <div data-testid="picker-row" className="flex min-h-tap items-center gap-2 px-4 py-2">
                                        <input
                                            autoFocus
                                            value={newTitle}
                                            onChange={e => setNewTitle(e.target.value)}
                                            onKeyDown={e => {
                                                e.stopPropagation();
                                                if (e.key === 'Enter') handleCreate();
                                                if (e.key === 'Escape') setCreating(false);
                                            }}
                                            aria-label={t('playlists.picker.newPlaylistName')}
                                            placeholder={t('playlists.picker.newPlaylistPlaceholder')}
                                            disabled={isCreating}
                                            className="h-tap min-w-0 flex-1 rounded-control border border-line-strong bg-bg px-3 text-body text-fg placeholder:text-fg-subtle"
                                        />
                                        <Button type="button" onClick={handleCreate} disabled={!newTitle.trim() || isCreating}>
                                            {isCreating ? <Loader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" /> : null}
                                            {t('playlists.picker.create')}
                                        </Button>
                                    </div>
                                    <p className="px-4 pb-2 text-meta text-fg-muted">{t('playlists.picker.newPrivateHint')}</p>
                                </div>
                            ) : (
                                <button key="new" type="button" data-testid="picker-row" onClick={() => setCreating(true)} className={ROW}>
                                    <Plus aria-hidden="true" className="size-5 shrink-0" />
                                    <span className="min-w-0 flex-1 font-semibold">{t('playlists.picker.newPlaylist')}</span>
                                </button>
                            );
                        }
                        return (
                            <button
                                key={row.id}
                                type="button"
                                role="checkbox"
                                aria-checked={row.checked}
                                data-testid="picker-row"
                                onClick={() => handleToggle(row.id, row.title)}
                                className={ROW}
                            >
                                <span className="min-w-0 flex-1 truncate">{row.title}</span>
                                <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center">
                                    {row.checked && <Check className="size-5 text-accent" />}
                                </span>
                            </button>
                        );
                    })}

                    {isLoading && (
                        <div className="flex justify-center py-4">
                            <Loader2 aria-hidden="true" className="size-5 text-fg-subtle motion-safe:animate-spin" />
                        </div>
                    )}
                    {!isLoading && playlists.length === 0 && (
                        <p className="px-4 py-4 text-center text-meta text-fg-muted">{t('playlists.picker.empty')}</p>
                    )}
                </div>
                <div className="border-t border-line p-3">
                    <BottomSheetClose asChild>
                        <Button type="button" variant="outline" className="w-full">{t('playlists.picker.done')}</Button>
                    </BottomSheetClose>
                </div>
            </BottomSheetContent>
        </BottomSheet>
    );
}
