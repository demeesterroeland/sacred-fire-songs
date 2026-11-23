'use client';

import Link from 'next/link';
import { PlaylistContextMenu } from './PlaylistContextMenu';
import { CardContent } from '@/components/common/CardContent';
import { toast } from 'sonner';
import { PLAYLIST_MENU, PLAYLIST_ROW } from './playlistRow';
import { useLocale } from '@/context/LocaleContext';

interface PublicPlaylistCardProps {
    id: string;
    title: string;
    description: string | null;
    songCount?: number;
    songTitles?: string[];
}

/**
 * A public playlist of another member (validation 4: your own public playlists are `PlaylistCard` rows in their
 * own section). Read-only: open it or copy its link.
 */
export function PublicPlaylistCard({ id, title, description, songCount = 0, songTitles = [] }: PublicPlaylistCardProps) {
    const { t } = useLocale();

    const handleCopyLink = () => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        navigator.clipboard.writeText(`${origin}/library/playlists/${id}`);
        toast.success(t('playlists.toast.linkCopied'));
    };

    const songCountLabel = songCount === 1 ? t('playlists.songCountSingle') : t('playlists.songCount', { count: songCount });

    return (
        <div className="relative">
            <Link href={`/library/playlists/${id}`} className={`${PLAYLIST_ROW} pr-12`}>
                <CardContent
                    title={title}
                    description={description}
                    subtitle={<span className="whitespace-nowrap">{songCountLabel}</span>}
                    songTitles={songTitles}
                />
            </Link>

            <div className={PLAYLIST_MENU}>
                <PlaylistContextMenu playlistId={id} playlistTitle={title} onGetLink={handleCopyLink} isLinkAvailable />
            </div>
        </div>
    );
}
