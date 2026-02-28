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
                toast.success(next ? 'Playlist is now public' : 'Playlist is now private');
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
                toast.success(`"${playlistTitle}" deleted`);
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
                        className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-700/60 transition-colors"
                        aria-label="Playlist options"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-52 bg-gray-900 border-gray-700"
                    onCloseAutoFocus={e => {
                        if (preventFocusReturn.current) {
                            e.preventDefault();
                            preventFocusReturn.current = false;
                        }
                    }}
                >
                    {isOwner && onRenameStart && (
                        <>
                            <DropdownMenuItem
                                onSelect={() => { preventFocusReturn.current = true; onRenameStart(); }}
                                className="gap-2 text-gray-200 focus:bg-gray-800 cursor-pointer"
                            >
                                <Pencil className="w-4 h-4" />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-800" />
                        </>
                    )}

                    {onGetLink && (
                        <DropdownMenuItem
                            onSelect={() => {
                                if (isLinkAvailable) {
                                    onGetLink();
                                } else {
                                    toast.info('Make this playlist public to share the link');
                                }
                            }}
                            title={isLinkAvailable ? undefined : 'Make this playlist public to share the link'}
                            className={`gap-2 cursor-pointer ${
                                isLinkAvailable
                                    ? 'text-gray-200 focus:bg-gray-800'
                                    : 'text-gray-500 focus:bg-gray-800/50'
                            }`}
                        >
                            <Link2 className="w-4 h-4" />
                            Get Link
                            {!isLinkAvailable && (
                                <span className="ml-auto text-xs text-gray-600">private</span>
                            )}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        disabled
                        className="gap-2 text-gray-500 cursor-not-allowed"
                    >
                        <Copy className="w-4 h-4" />
                        Duplicate Playlist
                        <span className="ml-auto text-xs text-gray-600">soon</span>
                    </DropdownMenuItem>

                    {isOwner && isPublic !== undefined && (
                        <DropdownMenuItem
                            onSelect={handleToggleVisibility}
                            className="gap-2 text-gray-200 focus:bg-gray-800 cursor-pointer"
                        >
                            {isPublic
                                ? <Lock className="w-4 h-4" />
                                : <Globe className="w-4 h-4" />
                            }
                            {isPublic ? 'Make Private' : 'Make Public'}
                        </DropdownMenuItem>
                    )}

                    {isOwner && (
                        <>
                            <DropdownMenuSeparator className="bg-gray-800" />
                            <DropdownMenuItem
                                onSelect={() => setShowDeleteModal(true)}
                                className="gap-2 text-red-400 focus:bg-red-950/40 focus:text-red-300 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Playlist
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Playlist"
                message={`Delete "${playlistTitle}"? All songs will be removed from this playlist. This cannot be undone.`}
                isDeleting={isDeleting}
            />
        </>
    );
}
