// components/playlists/PlaylistContextMenu.tsx
'use client';

import { useState, useTransition } from 'react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, ListPlus, Settings, EyeOff } from 'lucide-react';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import { deletePlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PlaylistContextMenuProps {
    playlistId: string;
    playlistTitle: string;
    onRenameStart?: () => void;
}

export function PlaylistContextMenu({ playlistId, playlistTitle, onRenameStart }: PlaylistContextMenuProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, startDeleteTransition] = useTransition();
    const router = useRouter();

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
                <DropdownMenuContent align="end" className="w-52 bg-gray-900 border-gray-700">
                    {onRenameStart && (
                        <>
                            <DropdownMenuItem
                                onClick={e => { e.preventDefault(); onRenameStart(); }}
                                className="gap-2 text-gray-200 focus:bg-gray-800 cursor-pointer"
                            >
                                <Pencil className="w-4 h-4" />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-800" />
                        </>
                    )}

                    {[
                        { icon: Settings, label: 'Edit Playlist' },
                        { icon: ListPlus, label: 'Add to this Playlist' },
                        { icon: EyeOff, label: 'Make Private / Public' },
                    ].map(({ icon: Icon, label }) => (
                        <DropdownMenuItem
                            key={label}
                            disabled
                            className="gap-2 text-gray-600 cursor-not-allowed"
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            <span className="ml-auto text-[10px] text-gray-700 font-medium">Soon</span>
                        </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator className="bg-gray-800" />

                    <DropdownMenuItem
                        onClick={e => { e.preventDefault(); setShowDeleteModal(true); }}
                        className="gap-2 text-red-400 focus:bg-red-950/40 focus:text-red-300 cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Playlist
                    </DropdownMenuItem>
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
