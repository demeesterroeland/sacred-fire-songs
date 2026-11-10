// components/playlists/PlaylistDetailHeader.tsx
'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Lock, Printer } from 'lucide-react';
import { PlaylistContextMenu } from './PlaylistContextMenu';
import {
    togglePlaylistVisibility,
    updatePlaylistDescription,
} from '@/app/actions/playlistActions';
import { usePlaylistPdfExport } from '@/hooks/usePlaylistPdfExport';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { usePlaylistRename } from '@/hooks/usePlaylistRename';
import { useLocale } from '@/context/LocaleContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { actionErrorMessage } from '@/lib/errors/actionError';
import { SignInLink } from '@/components/auth/SignInLink';
import { Button } from '@/components/ui/button';

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
    const { t } = useLocale();
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
                toast.error(actionErrorMessage(result.error, t));
                setIsPublic(!next);
            } else {
                toast.success(next ? t('playlists.toast.nowPublic') : t('playlists.toast.nowPrivate'));
                router.refresh();
            }
        });
    };

    // ─── Copy link ────────────────────────────────────────────────────────────
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success(t('playlists.toast.linkCopied'));
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
                toast.error(actionErrorMessage(result.error, t));
                setOptimisticDesc(initialDescription ?? '');
            }
        });
    };

    const [, startTransition] = useTransition();
    const router = useRouter();

    // ─── Export PDF ───────────────────────────────────────────────────────────
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { exportPdf: handleExportPdf, isExportingPdf } = usePlaylistPdfExport({
        playlistId,
        title: optimisticTitle,
        description: optimisticDesc,
        songCount,
        isLoggedIn,
        onNeedLogin: () => setShowLoginModal(true),
    });

    return (
        <div className="space-y-2">
            {/* Title row */}
            <div className="flex items-center gap-3">
                <Link
                    href="/library/playlists"
                    className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
                    aria-label={t('playlists.detail.back')}
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
                            className="min-h-tap w-full px-2 py-1 text-title font-bold rounded-control border border-line-strong bg-surface text-fg placeholder:text-fg-subtle"
                        />
                    ) : (
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{optimisticTitle}</h1>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                        {songCount === 1 ? t('playlists.songCountSingle') : t('playlists.songCount', { count: songCount })}
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-0.5 shrink-0">
                    {isOwner && (
                        <button
                            onClick={handleToggleVisibility}
                            aria-label={isPublic ? t('playlists.context.makePrivate') : t('playlists.context.makePublic')}
                            title={isPublic ? 'Public — click to make private' : 'Private — click to make public'}
                            className="p-1.5 rounded-control text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
                        >
                            {isPublic
                                ? <Globe className="w-4 h-4 text-fg-muted" />
                                : <Lock className="w-4 h-4 text-fg-muted" />
                            }
                        </button>
                    )}
                    <button
                        onClick={handleExportPdf}
                        disabled={isExportingPdf}
                        aria-label={t('playlists.export.menu')}
                        title={songCount === 0 ? t('playlists.export.addSongsFirst') : t('playlists.export.menu')}
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
                        placeholder={t('playlists.detail.addDescription')}
                        className="w-full resize-none px-3 py-2 text-meta rounded-control border border-line-strong bg-surface text-fg placeholder:text-fg-subtle"
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
                            : <span className="italic text-gray-700 hover:text-gray-600 transition-colors">{t('playlists.detail.addDescription')}</span>
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
                        <DialogTitle className="text-xl font-bold">{t('playlists.export.login.title')}</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                            {t('playlists.export.login.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
                        <Button type="button" variant="ghost" onClick={() => setShowLoginModal(false)}>
                            {t('playlists.export.login.cancel')}
                        </Button>
                        <SignInLink
                            href={`/auth/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : `/library/playlists/${playlistId}`)}`}
                            onClick={() => setShowLoginModal(false)}
                        >
                            {t('playlists.export.login.submit')}
                        </SignInLink>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
