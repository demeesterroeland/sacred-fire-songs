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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

interface Props {
    playlistId: string;
    initialTitle: string;
    initialIsPublic: boolean;
    initialDescription: string | null;
    songCount: number;
    isOwner: boolean;
    isCurator?: boolean;
    isLoggedIn?: boolean;
}

export function PlaylistDetailHeader({
    playlistId,
    initialTitle,
    initialIsPublic,
    initialDescription,
    songCount,
    isOwner,
    isCurator = false,
    isLoggedIn = false,
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
    const [showLoginModal, setShowLoginModal] = useState(false);

    const handleExportPdf = async () => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }

        if (songCount > 200) {
            toast.error('Export limit exceeded: maximum 200 songs can be exported.');
            return;
        }

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

            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const blob = await exportPlaylistToPdf({
                title: result.title || optimisticTitle,
                description: optimisticDesc || result.description,
                songs: result.songs,
                baseUrl,
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

            {/* Login Prompt Modal for PDF Export */}
            <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Log in to export PDF</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                            PDF songbook export is a member-only feature. Please log in or create an account to download this ceremony songbook.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setShowLoginModal(false)}
                            className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <Link
                            href={`/auth/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : `/library/playlists/${playlistId}`)}`}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors text-center"
                            onClick={() => setShowLoginModal(false)}
                        >
                            Log In
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
