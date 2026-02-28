'use client';

import Link from 'next/link';
import { Globe } from 'lucide-react';
import { PlaylistContextMenu } from './PlaylistContextMenu';
import { toast } from 'sonner';
import { usePlaylistRename } from '@/hooks/usePlaylistRename';

interface PublicPlaylistCardProps {
    id: string;
    title: string;
    description: string | null;
    isOwner?: boolean;
}

export function PublicPlaylistCard({ id, title, description, isOwner }: PublicPlaylistCardProps) {
    const {
        optimisticTitle,
        isRenaming,
        setIsRenaming,
        draftTitle,
        setDraftTitle,
        inputRef,
        handleRenameStart,
        handleRenameSave,
    } = usePlaylistRename(id, title);

    const handleCopyLink = () => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        navigator.clipboard.writeText(`${origin}/library/playlists/${id}`);
        toast.success('Link copied');
    };

    return (
        <div className="relative">
            <Link
                href={`/library/playlists/${id}`}
                onClick={e => isRenaming && e.preventDefault()}
            >
                <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 hover:bg-gray-800/60 hover:border-gray-700 hover:-translate-y-0.5 transition-all flex items-center gap-4 group pr-12">
                    <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        {isOwner && isRenaming ? (
                            <input
                                ref={inputRef}
                                value={draftTitle}
                                onChange={e => setDraftTitle(e.target.value)}
                                onBlur={handleRenameSave}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleRenameSave();
                                    if (e.key === 'Escape') setIsRenaming(false);
                                }}
                                onClick={e => e.preventDefault()}
                                autoFocus
                                className="w-[95%] bg-gray-800 border border-amber-500/50 rounded-lg px-2 py-1 text-sm font-bold text-gray-100 outline-none focus:border-amber-500"
                            />
                        ) : (
                            <h3 className="font-bold text-gray-100 group-hover:text-white transition-colors truncate">
                                {optimisticTitle}
                            </h3>
                        )}
                        {description && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p>
                        )}
                    </div>
                </div>
            </Link>

            <div className="absolute top-3 right-3 z-10">
                <PlaylistContextMenu
                    playlistId={id}
                    playlistTitle={optimisticTitle}
                    isOwner={isOwner}
                    onRenameStart={isOwner ? handleRenameStart : undefined}
                    onGetLink={handleCopyLink}
                    isLinkAvailable
                />
            </div>
        </div>
    );
}
