// components/playlists/PlaylistContextMenu.tsx
'use client';

import { useState, useTransition, useRef } from 'react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Link2, Copy, Globe, Lock, Printer } from 'lucide-react';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import { deletePlaylist, togglePlaylistVisibility } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { actionErrorMessage } from '@/lib/errors/actionError';

interface PlaylistContextMenuProps {
    playlistId: string;
    playlistTitle: string;
    isOwner?: boolean;
    /** When provided and isOwner, shows Make Public / Make Private item. */
    isPublic?: boolean;
    onRenameStart?: () => void;
    onGetLink?: () => void;
    /** When false, Get Link is shown grayed-out with an explanation. Defaults to true. */
    isLinkAvailable?: boolean;
    onExportPdf?: () => void;
    isExportingPdf?: boolean;
}

export function PlaylistContextMenu({
    playlistId,
    playlistTitle,
    isOwner,
    isPublic,
    onRenameStart,
    onGetLink,
    isLinkAvailable = true,
    onExportPdf,
    isExportingPdf = false,
}: PlaylistContextMenuProps) {
    const { t } = useLocale();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, startDeleteTransition] = useTransition();
    const [, startVisibilityTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();
    const preventFocusReturn = useRef(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const handleToggleVisibility = () => {
        const next = !isPublic;
        startVisibilityTransition(async () => {
            const result = await togglePlaylistVisibility(playlistId, next);
            if (result.error) {
                toast.error(actionErrorMessage(result.error, t));
            } else {
                toast.success(next ? t('playlists.toast.nowPublic') : t('playlists.toast.nowPrivate'));
                router.refresh();
            }
        });
    };

    const handleDelete = () => {
        startDeleteTransition(async () => {
            const result = await deletePlaylist(playlistId);
            if (result.error) {
                toast.error(actionErrorMessage(result.error, t));
            } else {
                toast.success(t('playlists.toast.deleted', { title: playlistTitle }));
                setShowDeleteModal(false);
                if (pathname?.includes(`/library/playlists/${playlistId}`)) {
                    router.push('/library/playlists');
                } else {
                    router.refresh();
                }
            }
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        ref={triggerRef}
                        onClick={e => e.stopPropagation()}
                        className="flex size-tap items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                        aria-label={t('playlists.optionsAria')}
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-52 rounded-panel border-line bg-surface text-fg"
                    onCloseAutoFocus={e => {
                        if (preventFocusReturn.current) {
                            e.preventDefault();
                            preventFocusReturn.current = false;
                        }
                    }}
                >
                    {onRenameStart && (
                        <>
                            <DropdownMenuItem
                                onSelect={() => { preventFocusReturn.current = true; onRenameStart(); }}
                                className="min-h-tap gap-2 rounded-control text-fg focus:bg-surface-2 focus:text-fg cursor-pointer"
                            >
                                <Pencil className="w-4 h-4" />
                                {t('playlists.context.rename')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-line" />
                        </>
                    )}

                    {onGetLink && (
                        <DropdownMenuItem
                            onSelect={() => {
                                if (isLinkAvailable) {
                                    onGetLink();
                                } else {
                                    toast.info(t('playlists.context.sharePrivateHint'));
                                }
                            }}
                            title={isLinkAvailable ? undefined : t('playlists.context.sharePrivateHint')}
                            className={`gap-2 cursor-pointer ${
                                isLinkAvailable
                                    ? 'min-h-tap rounded-control text-fg focus:bg-surface-2 focus:text-fg'
                                    : 'min-h-tap rounded-control text-fg-muted focus:bg-surface-2 focus:text-fg'
                            }`}
                        >
                            <Link2 className="w-4 h-4" />
                            {t('playlists.context.getLink')}
                            {!isLinkAvailable && (
                                <span className="ml-auto text-caption text-fg-muted">{t('playlists.context.privateBadge')}</span>
                            )}
                        </DropdownMenuItem>
                    )}

                    {onExportPdf && (
                        <DropdownMenuItem
                            onSelect={onExportPdf}
                            disabled={isExportingPdf}
                            className="min-h-tap gap-2 rounded-control text-fg focus:bg-surface-2 focus:text-fg cursor-pointer disabled:opacity-50"
                        >
                            <Printer aria-hidden className="w-4 h-4" /> {/* same icon as the playlist page */}
                            {isExportingPdf ? t('playlists.export.exporting') : t('playlists.export.menu')}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        disabled
                        className="min-h-tap gap-2 rounded-control text-fg-subtle cursor-not-allowed"
                    >
                        <Copy className="w-4 h-4" />
                        {t('playlists.context.duplicate')}
                        <span className="ml-auto text-caption text-fg-muted">{t('playlists.context.soonBadge')}</span>
                    </DropdownMenuItem>

                    {isOwner && isPublic !== undefined && (
                        <DropdownMenuItem
                            onSelect={handleToggleVisibility}
                            className="min-h-tap gap-2 rounded-control text-fg focus:bg-surface-2 focus:text-fg cursor-pointer"
                        >
                            {isPublic
                                ? <Lock className="w-4 h-4" />
                                : <Globe className="w-4 h-4" />
                            }
                            {isPublic ? t('playlists.context.makePrivate') : t('playlists.context.makePublic')}
                        </DropdownMenuItem>
                    )}

                    {isOwner && (
                        <>
                            <DropdownMenuSeparator className="bg-line" />
                            <DropdownMenuItem
                                onSelect={() => setShowDeleteModal(true)}
                                className="min-h-tap gap-2 rounded-control text-danger focus:bg-danger/10 focus:text-danger cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t('playlists.context.delete')}
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title={t('playlists.deleteModal.title')}
                message={t('playlists.deleteModal.message', { title: playlistTitle })}
                isDeleting={isDeleting}
                // The menu that opened this closed with its Delete item: focus goes back to its trigger.
                fallbackFocus={() => triggerRef.current}
            />
        </>
    );
}
