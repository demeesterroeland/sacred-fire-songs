// components/playlists/PlaylistDetailHeader.tsx
'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PlaylistContextMenu } from './PlaylistContextMenu';
import { renamePlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
    playlistId: string;
    initialTitle: string;
    songCount: number;
}

export function PlaylistDetailHeader({ playlistId, initialTitle, songCount }: Props) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [draftTitle, setDraftTitle] = useState(initialTitle);
    const [optimisticTitle, setOptimisticTitle] = useState(initialTitle);
    const [, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    const isSavingRef = useRef(false);
    const router = useRouter();

    // Sync when server-refreshed prop arrives
    useEffect(() => { setOptimisticTitle(initialTitle); }, [initialTitle]);

    const handleRenameStart = () => {
        setDraftTitle(optimisticTitle);
        setIsRenaming(true);
        setTimeout(() => inputRef.current?.select(), 50);
    };

    const handleRenameSave = () => {
        if (isSavingRef.current) return;
        const trimmed = draftTitle.trim();
        setIsRenaming(false);
        if (!trimmed || trimmed === optimisticTitle) return;

        setOptimisticTitle(trimmed);
        isSavingRef.current = true;
        startTransition(async () => {
            const result = await renamePlaylist(playlistId, trimmed);
            if (result.error) {
                toast.error(result.error);
                setOptimisticTitle(initialTitle);
            } else {
                toast.success('Renamed');
                router.refresh();
            }
            isSavingRef.current = false;
        });
    };

    return (
        <div className="flex items-center gap-3">
            <Link
                href="/library/playlists"
                className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
                aria-label="Back to playlists"
            >
                <ArrowLeft className="w-5 h-5" />
            </Link>

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
                        autoFocus
                        className="w-full bg-gray-800 border border-amber-500/50 rounded-lg px-2 py-1 text-xl font-bold text-gray-100 outline-none focus:border-amber-500"
                    />
                ) : (
                    <h1 className="text-xl font-bold text-gray-100 truncate">{optimisticTitle}</h1>
                )}
                <p className="text-xs text-gray-500 mt-0.5">
                    {songCount} song{songCount !== 1 ? 's' : ''}
                </p>
            </div>

            <PlaylistContextMenu
                playlistId={playlistId}
                playlistTitle={optimisticTitle}
                onRenameStart={handleRenameStart}
            />
        </div>
    );
}
