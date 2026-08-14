'use client';

import { useState, useTransition, useRef } from 'react';
import { Plus } from 'lucide-react';
import { createPlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function CreatePlaylistInput() {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const open = () => {
        setTitle('');
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const submit = () => {
        const trimmed = title.trim();
        if (!trimmed) { setIsOpen(false); return; }

        startTransition(async () => {
            const result = await createPlaylist(trimmed);
            if ('error' in result) {
                toast.error(result.error);
            } else {
                toast.success(`"${trimmed}" created`, {
                    action: {
                        label: 'View Playlist →',
                        onClick: () => { router.push(`/library/playlists/${result.id}`); },
                    },
                    classNames: {
                        actionButton: 'text-amber-400 text-xs font-bold hover:text-amber-300 transition-colors ml-2',
                    },
                });
                router.refresh();
            }
            setIsOpen(false);
            setTitle('');
        });
    };

    if (!isOpen) {
        return (
            <button
                onClick={open}
                className="flex items-center gap-1 text-xs font-semibold text-red-500 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50 rounded-full px-3 py-1 transition-all"
            >
                <Plus className="w-3.5 h-3.5" />
                New Playlist
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <input
                ref={inputRef}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') submit();
                    if (e.key === 'Escape') { setIsOpen(false); }
                }}
                onBlur={submit}
                placeholder="Playlist name…"
                disabled={isPending}
                className="flex-1 bg-gray-100 dark:bg-gray-800 border border-amber-500/50 rounded-lg px-3 py-1 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-amber-500 disabled:opacity-50 min-w-0 w-40"
            />
            <button
                onClick={submit}
                disabled={isPending || !title.trim()}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-40 transition-colors px-1 shrink-0"
            >
                {isPending ? '…' : 'Create'}
            </button>
        </div>
    );
}
