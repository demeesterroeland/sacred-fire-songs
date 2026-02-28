// components/playlists/PlaylistCard.tsx
'use client';

import { useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import { ListMusic } from 'lucide-react';
import { PlaylistContextMenu } from './PlaylistContextMenu';
import { renamePlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PlaylistCardProps {
    id: string;
    title: string;
    subtitle: React.ReactNode;
}

export function PlaylistCard({ id, title, subtitle }: PlaylistCardProps) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [draftTitle, setDraftTitle] = useState(title);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    const isSavingRef = useRef(false);
    const router = useRouter();

    const handleRenameStart = () => {
        setDraftTitle(title);
        setIsRenaming(true);
        setTimeout(() => inputRef.current?.select(), 50);
    };

    const handleRenameSave = () => {
        if (isSavingRef.current) return;
        const trimmed = draftTitle.trim();
        setIsRenaming(false);
        if (!trimmed || trimmed === title) return;

        isSavingRef.current = true;
        startTransition(async () => {
            const result = await renamePlaylist(id, trimmed);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Renamed');
                router.refresh();
            }
            isSavingRef.current = false;
        });
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
                        <h3 className="font-bold text-gray-100 group-hover:text-white transition-colors truncate">
                            {title}
                        </h3>
                    )}
                    <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
                </div>
            </Link>

            {/* Context menu — absolutely positioned to avoid nesting inside <Link> */}
            <div className="absolute top-3 right-3 z-10">
                <PlaylistContextMenu
                    playlistId={id}
                    playlistTitle={title}
                    onRenameStart={handleRenameStart}
                />
            </div>
        </div>
    );
}
