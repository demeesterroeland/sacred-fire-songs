'use client';

import Link from 'next/link';
import { Globe } from 'lucide-react';
import { PlaylistContextMenu } from './PlaylistContextMenu';
import { CardContent } from '@/components/common/CardContent';
import { toast } from 'sonner';
import { usePlaylistRename } from '@/hooks/usePlaylistRename';

interface PublicPlaylistCardProps {
    id: string;
    title: string;
    description: string | null;
    isOwner?: boolean;
    songCount?: number;
    songTitles?: string[];
}

export function PublicPlaylistCard({ id, title, description, isOwner, songCount = 0, songTitles = [] }: PublicPlaylistCardProps) {
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

    const songCountLabel = `${songCount} song${songCount !== 1 ? 's' : ''}`;

    return (
        <div className="relative">
            <Link
                href={`/library/playlists/${id}`}
                onClick={e => isRenaming && e.preventDefault()}
            >
                <div className="bg-white/60 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-0.5 transition-all flex items-center gap-4 group pr-12">
                    <div className="w-12 h-12 bg-emerald-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <Globe className="w-6 h-6 text-emerald-400" />
                    </div>
                    {isOwner && isRenaming ? (
                        <div className="flex-1 min-w-0">
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
                                className="w-[95%] bg-gray-100 dark:bg-gray-800 border border-amber-500/50 rounded-lg px-2 py-1 text-sm font-bold text-gray-900 dark:text-gray-100 outline-none focus:border-amber-500"
                            />
                        </div>
                    ) : (
                        <CardContent
                            title={optimisticTitle}
                            description={description}
                            subtitle={<span className="whitespace-nowrap">{songCountLabel}</span>}
                            songTitles={songTitles}
                        />
                    )}
                </div>
            </Link>

            <div className="absolute top-3 right-3 z-10">
                <PlaylistContextMenu
                    playlistId={id}
                    playlistTitle={optimisticTitle}
                    isOwner={isOwner}
                    isPublic={isOwner ? true : undefined}
                    onRenameStart={isOwner ? handleRenameStart : undefined}
                    onGetLink={handleCopyLink}
                    isLinkAvailable
                />
            </div>
        </div>
    );
}
