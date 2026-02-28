'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
import { renamePlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function usePlaylistRename(id: string, initialTitle: string) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [draftTitle, setDraftTitle] = useState(initialTitle);
    const [optimisticTitle, setOptimisticTitle] = useState(initialTitle);
    const isSavingRef = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [, startTransition] = useTransition();
    const router = useRouter();

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
            const result = await renamePlaylist(id, trimmed);
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

    return {
        optimisticTitle,
        isRenaming,
        setIsRenaming,
        draftTitle,
        setDraftTitle,
        inputRef,
        handleRenameStart,
        handleRenameSave,
    };
}
