// components/playlists/PlaylistDetailHeader.tsx
'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Lock, Link2, Check } from 'lucide-react';
import { PlaylistContextMenu } from './PlaylistContextMenu';
import {
    renamePlaylist,
    togglePlaylistVisibility,
    updatePlaylistDescription,
} from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
    playlistId: string;
    initialTitle: string;
    initialIsPublic: boolean;
    initialDescription: string | null;
    songCount: number;
}

export function PlaylistDetailHeader({
    playlistId,
    initialTitle,
    initialIsPublic,
    initialDescription,
    songCount,
}: Props) {
    // ─── Title ────────────────────────────────────────────────────────────────
    const [isRenaming, setIsRenaming] = useState(false);
    const [draftTitle, setDraftTitle] = useState(initialTitle);
    const [optimisticTitle, setOptimisticTitle] = useState(initialTitle);
    const isSavingRef = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);

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

    // ─── Visibility ───────────────────────────────────────────────────────────
    const [isPublic, setIsPublic] = useState(initialIsPublic);

    useEffect(() => { setIsPublic(initialIsPublic); }, [initialIsPublic]);

    const handleToggleVisibility = () => {
        const next = !isPublic;
        setIsPublic(next);
        startTransition(async () => {
            const result = await togglePlaylistVisibility(playlistId, next);
            if (result.error) {
                toast.error(result.error);
                setIsPublic(!next);
            } else {
                toast.success(next ? 'Playlist is now public' : 'Playlist is now private');
                router.refresh();
            }
        });
    };

    // ─── Copy link ────────────────────────────────────────────────────────────
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success('Link copied');
        setTimeout(() => setCopied(false), 2000);
    };

    // ─── Description ──────────────────────────────────────────────────────────
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [draftDesc, setDraftDesc] = useState(initialDescription ?? '');
    const [optimisticDesc, setOptimisticDesc] = useState(initialDescription ?? '');
    const descRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { setOptimisticDesc(initialDescription ?? ''); }, [initialDescription]);

    const handleDescSave = () => {
        setIsEditingDesc(false);
        const trimmed = draftDesc.trim();
        if (trimmed === optimisticDesc) return;
        setOptimisticDesc(trimmed);
        startTransition(async () => {
            const result = await updatePlaylistDescription(playlistId, trimmed);
            if (result.error) {
                toast.error(result.error);
                setOptimisticDesc(initialDescription ?? '');
            }
        });
    };

    const [, startTransition] = useTransition();
    const router = useRouter();

    return (
        <div className="space-y-2">
            {/* Title row */}
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

                {/* Action buttons */}
                <div className="flex items-center gap-0.5 shrink-0">
                    {isPublic && (
                        <button
                            onClick={handleCopyLink}
                            aria-label="Copy shareable link"
                            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-700/60 transition-colors"
                        >
                            {copied
                                ? <Check className="w-4 h-4 text-emerald-400" />
                                : <Link2 className="w-4 h-4" />
                            }
                        </button>
                    )}
                    <button
                        onClick={handleToggleVisibility}
                        aria-label={isPublic ? 'Make private' : 'Make public'}
                        title={isPublic ? 'Public — click to make private' : 'Private — click to make public'}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-700/60 transition-colors"
                    >
                        {isPublic
                            ? <Globe className="w-4 h-4 text-emerald-400" />
                            : <Lock className="w-4 h-4" />
                        }
                    </button>
                    <PlaylistContextMenu
                        playlistId={playlistId}
                        playlistTitle={optimisticTitle}
                        onRenameStart={handleRenameStart}
                    />
                </div>
            </div>

            {/* Description */}
            {isEditingDesc ? (
                <textarea
                    ref={descRef}
                    value={draftDesc}
                    onChange={e => setDraftDesc(e.target.value)}
                    onBlur={handleDescSave}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleDescSave(); }
                        if (e.key === 'Escape') { setDraftDesc(optimisticDesc); setIsEditingDesc(false); }
                    }}
                    autoFocus
                    rows={2}
                    placeholder="Add a description…"
                    className="w-full bg-gray-800 border border-amber-500/50 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-amber-500 resize-none"
                />
            ) : (
                <button
                    onClick={() => {
                        setDraftDesc(optimisticDesc);
                        setIsEditingDesc(true);
                        setTimeout(() => descRef.current?.focus(), 50);
                    }}
                    className="text-sm text-left w-full"
                >
                    {optimisticDesc
                        ? <span className="text-gray-400">{optimisticDesc}</span>
                        : <span className="italic text-gray-700 hover:text-gray-600 transition-colors">Add a description…</span>
                    }
                </button>
            )}
        </div>
    );
}
