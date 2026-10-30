// components/playlists/PlaylistContextMenu.tsx
'use client';

import { useState, useTransition, useRef } from 'react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Link2, Copy, Globe, Lock } from 'lucide-react';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import { deletePlaylist, togglePlaylistVisibility } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/i18n';

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
}

export function PlaylistContextMenu({ playlistId, playlistTitle, isOwner, isPublic, onRenameStart, onGetLink, isLinkAvailable = true }: PlaylistContextMenuProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, startDeleteTransition] = useTransition();
    const [, startVisibilityTransition] = useTransition();
    const router = useRouter();
    const preventFocusReturn = useRef(false);

    const handleToggleVisibility = () => {
        const next = !isPublic;
        startVisibilityTransition(async () => {
            const result = await togglePlaylistVisibility(playlistId, next);
            if (result.error) {
                toast.error(result.error);
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
                toast.error(result.error);
            } else {
                toast.success(t('playlists.toast.deleted', { title: playlistTitle }));
                setShowDeleteModal(false);
                router.refresh();
            }
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        onClick={e => e.preventDefault()}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors"
                        aria-label={t('playlists.optionsAria')}
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-52 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
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
                                className="gap-2 text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-200 dark:bg-gray-800 cursor-pointer"
                            >
                                <Pencil className="w-4 h-4" />
                                {t('playlists.context.rename')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
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
                                    ? 'text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-200 dark:bg-gray-800'
                                    : 'text-gray-500 focus:bg-gray-200 dark:bg-gray-800/50'
                            }`}
                        >
                            <Link2 className="w-4 h-4" />
                            {t('playlists.context.getLink')}
                            {!isLinkAvailable && (
                                <span className="ml-auto text-xs text-gray-600">{t('playlists.context.privateBadge')}</span>
                            )}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        disabled
                        className="gap-2 text-gray-500 cursor-not-allowed"
                    >
                        <Copy className="w-4 h-4" />
                        {t('playlists.context.duplicate')}
                        <span className="ml-auto text-xs text-gray-600">{t('playlists.context.soonBadge')}</span>
                    </DropdownMenuItem>

                    {isOwner && isPublic !== undefined && (
                        <DropdownMenuItem
                            onSelect={handleToggleVisibility}
                            className="gap-2 text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-200 dark:bg-gray-800 cursor-pointer"
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
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
                            <DropdownMenuItem
                                onSelect={() => setShowDeleteModal(true)}
                                className="gap-2 text-red-400 focus:bg-red-950/40 focus:text-red-300 cursor-pointer"
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
            />
        </>
    );
}
