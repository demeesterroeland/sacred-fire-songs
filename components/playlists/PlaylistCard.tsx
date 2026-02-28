// components/playlists/PlaylistCard.tsx
'use client';

import Link from 'next/link';
import { ListMusic } from 'lucide-react';
import { PlaylistContextMenu } from './PlaylistContextMenu';
import { toast } from 'sonner';
import { usePlaylistRename } from '@/hooks/usePlaylistRename';

interface PlaylistCardProps {
    id: string;
    title: string;
    subtitle: React.ReactNode;
    isPublic?: boolean;
    description?: string | null;
}

export function PlaylistCard({ id, title, subtitle, isPublic = false, description }: PlaylistCardProps) {
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
                className="flex items-center gap-4 p-4 bg-gray-900/40 border border-gray-800 rounded-2xl group hover:bg-gray-800/60 hover:border-gray-700 transition-all hover:-translate-y-0.5"
                onClick={e => isRenaming && e.preventDefault()}
            >
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-gray-700 transition-colors shrink-0">
                    <ListMusic className="w-6 h-6 text-gray-400" />
                </div>

                <div className="flex-1 min-w-0">
                    {isRenaming ? (
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
                        <p className="truncate">
                            <span className="font-bold text-gray-100 group-hover:text-white transition-colors">{optimisticTitle}</span>
                            {description && <span className="ml-2 text-xs font-normal text-gray-500">· {description}</span>}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
                </div>
            </Link>

            {/* Context menu — absolutely positioned to avoid nesting inside <Link> */}
            <div className="absolute top-3 right-3 z-10">
                <PlaylistContextMenu
                    playlistId={id}
                    playlistTitle={optimisticTitle}
                    isOwner
                    isPublic={isPublic}
                    onRenameStart={handleRenameStart}
                    onGetLink={handleCopyLink}
                    isLinkAvailable={isPublic}
                />
            </div>
        </div>
    );
}
