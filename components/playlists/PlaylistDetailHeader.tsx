// components/playlists/PlaylistDetailHeader.tsx
'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Lock, Printer } from 'lucide-react';
import { PlaylistContextMenu } from './PlaylistContextMenu';
import {
    togglePlaylistVisibility,
    updatePlaylistDescription,
    getPlaylistSongsForExport,
} from '@/app/actions/playlistActions';
import { exportPlaylistToPdf, downloadPdf } from '@/lib/export/pdfExport';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { usePlaylistRename } from '@/hooks/usePlaylistRename';

interface Props {
    playlistId: string;
    initialTitle: string;
    initialIsPublic: boolean;
    initialDescription: string | null;
    songCount: number;
    isOwner: boolean;
    isCurator?: boolean;
}

export function PlaylistDetailHeader({
    playlistId,
    initialTitle,
    initialIsPublic,
    initialDescription,
    songCount,
    isOwner,
    isCurator = false,
}: Props) {
    const canEdit = isOwner || isCurator;
    // ─── Title ────────────────────────────────────────────────────────────────
    const {
        optimisticTitle,
        isRenaming,
        setIsRenaming,
        draftTitle,
        setDraftTitle,
        inputRef,
        handleRenameStart,
        handleRenameSave,
    } = usePlaylistRename(playlistId, initialTitle);

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
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied');
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

    // ─── Export PDF ───────────────────────────────────────────────────────────
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const handleExportPdf = async () => {
        if (songCount === 0) {
            toast.info('Cannot export an empty playlist. Add songs first.');
            return;
        }

        setIsExportingPdf(true);
        const toastId = toast.loading('Generating PDF...');

        try {
            const result = await getPlaylistSongsForExport(playlistId);
            if (result.error) {
                toast.error(result.error, { id: toastId });
                return;
            }

            if (!result.songs || result.songs.length === 0) {
                toast.info('Cannot export an empty playlist. Add songs first.', { id: toastId });
                return;
            }

            const blob = await exportPlaylistToPdf({
                title: result.title || optimisticTitle,
                description: optimisticDesc || result.description,
                songs: result.songs,
            });

            downloadPdf(blob, result.title || optimisticTitle);
            toast.success('PDF downloaded', { id: toastId });
        } catch (error) {
            console.error('Failed to export PDF:', error);
            toast.error('Failed to generate PDF', { id: toastId });
        } finally {
            setIsExportingPdf(false);
        }
    };

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
                            className="w-full bg-gray-100 dark:bg-gray-800 border border-amber-500/50 rounded-lg px-2 py-1 text-xl font-bold text-gray-900 dark:text-gray-100 outline-none focus:border-amber-500"
                        />
                    ) : (
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{optimisticTitle}</h1>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                        {songCount} song{songCount !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-0.5 shrink-0">
                    {isOwner && (
                        <button
                            onClick={handleToggleVisibility}
                            aria-label={isPublic ? 'Make private' : 'Make public'}
                            title={isPublic ? 'Public — click to make private' : 'Private — click to make public'}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors"
                        >
                            {isPublic
                                ? <Globe className="w-4 h-4 text-emerald-400" />
                                : <Lock className="w-4 h-4" />
                            }
                        </button>
                    )}
                    <button
                        onClick={handleExportPdf}
                        disabled={isExportingPdf}
                        aria-label="Export PDF"
                        title={songCount === 0 ? 'Add songs to export PDF' : 'Export PDF'}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors disabled:opacity-40"
                    >
                        <Printer className="w-4 h-4" />
                    </button>
                    <PlaylistContextMenu
                        playlistId={playlistId}
                        playlistTitle={optimisticTitle}
                        isOwner={isOwner}
                        isPublic={isOwner ? isPublic : undefined}
                        onRenameStart={canEdit ? handleRenameStart : undefined}
                        onGetLink={handleCopyLink}
                        isLinkAvailable={isPublic}
                        onExportPdf={handleExportPdf}
                        isExportingPdf={isExportingPdf}
                    />
                </div>
            </div>

            {/* Description */}
            {canEdit ? (
                isEditingDesc ? (
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
                        className="w-full bg-gray-100 dark:bg-gray-800 border border-amber-500/50 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-amber-500 resize-none"
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
                )
            ) : (
                optimisticDesc
                    ? <p className="text-sm text-gray-400">{optimisticDesc}</p>
                    : null
            )}
        </div>
    );
}
