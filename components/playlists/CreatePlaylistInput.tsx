'use client';

import { useState, useTransition, useRef } from 'react';
import { Plus } from 'lucide-react';
import { createPlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';

export function CreatePlaylistInput() {
    const { t } = useLocale();
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
                toast.success(t('playlists.created', { name: trimmed }), {
                    action: {
                        label: t('playlists.viewPlaylist'),
                        onClick: () => { router.push(`/library/playlists/${result.id}`); },
                    },
                    classNames: {
                        actionButton: 'ml-2 text-meta font-bold text-fg underline underline-offset-4 transition-colors hover:text-fg-muted',
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
                className="flex items-center gap-1 text-meta font-semibold text-fg border border-line-strong bg-surface hover:bg-surface-2 rounded-pill px-3 py-1 transition-all"
            >
                <Plus className="w-3.5 h-3.5" />
                {t('playlists.newButton')}
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
                placeholder={t('playlists.new.placeholder')}
                disabled={isPending}
                className="min-h-tap w-40 min-w-0 flex-1 px-3 py-1 text-meta disabled:opacity-50 rounded-control border border-line-strong bg-surface text-fg placeholder:text-fg-subtle"
            />
            <button
                onClick={submit}
                disabled={isPending || !title.trim()}
                className="inline-flex min-h-tap shrink-0 items-center px-1 text-meta font-semibold text-fg underline underline-offset-4 transition-colors hover:text-fg-muted disabled:opacity-40"
            >
                {isPending ? '…' : t('playlists.create')}
            </button>
        </div>
    );
}
