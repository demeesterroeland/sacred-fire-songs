'use client';

import Link from 'next/link';
import { PlaylistContextMenu } from './PlaylistContextMenu';
import { CardContent } from '@/components/common/CardContent';
import { VisibilityIcon } from '@/components/common/VisibilityIcon';
import { toast } from 'sonner';
import { usePlaylistRename } from '@/hooks/usePlaylistRename';
import { usePlaylistPdfExport } from '@/hooks/usePlaylistPdfExport';
import { PLAYLIST_ICON, PLAYLIST_MENU, PLAYLIST_ROW } from './playlistRow';

import { useLocale } from '@/context/LocaleContext';
interface PublicPlaylistCardProps {
    id: string;
    title: string;
    description: string | null;
    isOwner?: boolean;
    songCount?: number;
    songTitles?: string[];
}

export function PublicPlaylistCard({ id, title, description, isOwner, songCount = 0, songTitles = [] }: PublicPlaylistCardProps) {
    const { t } = useLocale();
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

    const { exportPdf, isExportingPdf } = usePlaylistPdfExport({ playlistId: id, title: optimisticTitle, description }); // the server's list decides

    const handleCopyLink = () => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        navigator.clipboard.writeText(`${origin}/library/playlists/${id}`);
        toast.success(t('playlists.toast.linkCopied'));
    };

    const songCountLabel = songCount === 1 ? t('playlists.songCountSingle') : t('playlists.songCount', { count: songCount });

    return (
        <div className="relative">
            <Link
                href={`/library/playlists/${id}`}
                className={`${PLAYLIST_ROW} pr-12`}
                onClick={e => isRenaming && e.preventDefault()}
            >
                <VisibilityIcon isPublic className={PLAYLIST_ICON} />
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
                            className="min-h-tap w-[95%] rounded-control border border-line-strong bg-surface px-2 py-1 text-meta font-bold text-fg placeholder:text-fg-subtle"
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
            </Link>

            <div className={PLAYLIST_MENU}>
                <PlaylistContextMenu
                    playlistId={id}
                    playlistTitle={optimisticTitle}
                    isOwner={isOwner}
                    isPublic={isOwner ? true : undefined}
                    onRenameStart={isOwner ? handleRenameStart : undefined}
                    onGetLink={handleCopyLink}
                    isLinkAvailable
                    onExportPdf={isOwner ? exportPdf : undefined}
                    isExportingPdf={isExportingPdf}
                />
            </div>
        </div>
    );
}
