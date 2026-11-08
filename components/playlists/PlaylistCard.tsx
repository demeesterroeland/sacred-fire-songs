// components/playlists/PlaylistCard.tsx
'use client';

import Link from 'next/link';
import { PlaylistContextMenu } from './PlaylistContextMenu';
import { CardContent } from '@/components/common/CardContent';
import { VisibilityIcon } from '@/components/common/VisibilityIcon';
import { toast } from 'sonner';
import { usePlaylistRename } from '@/hooks/usePlaylistRename';
import { PLAYLIST_ICON, PLAYLIST_MENU, PLAYLIST_ROW } from './playlistRow';

import { useLocale } from '@/context/LocaleContext';
interface PlaylistCardProps {
    id: string;
    title: string;
    subtitle: React.ReactNode;
    isPublic?: boolean;
    description?: string | null;
    songTitles?: string[];
}

export function PlaylistCard({ id, title, subtitle, isPublic = false, description, songTitles = [] }: PlaylistCardProps) {
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

    const handleCopyLink = () => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        navigator.clipboard.writeText(`${origin}/library/playlists/${id}`);
        toast.success(t('playlists.toast.linkCopied'));
    };

    return (
        <div className="relative">
            <Link
                href={`/library/playlists/${id}`}
                className={`${PLAYLIST_ROW} pr-12`}
                onClick={e => isRenaming && e.preventDefault()}
            >
                <VisibilityIcon isPublic={isPublic} className={PLAYLIST_ICON} />

                {isRenaming ? (
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
                        subtitle={subtitle}
                        songTitles={songTitles}
                    />
                )}
            </Link>

            {/* Context menu — absolutely positioned to avoid nesting inside <Link> */}
            <div className={PLAYLIST_MENU}>
                <PlaylistContextMenu
                    playlistId={id}
                    playlistTitle={optimisticTitle}
                    isOwner
                    isPublic={isPublic}
                    onRenameStart={handleRenameStart}
                    onGetLink={handleCopyLink}
                    isLinkAvailable={isPublic}
                />
            </div>
        </div>
    );
}
