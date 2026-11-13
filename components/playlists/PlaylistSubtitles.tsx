import Link from 'next/link';
import { CardContent } from '@/components/common/CardContent';
import { PLAYLIST_ROW } from '@/components/playlists/playlistRow';
import { getServerT } from '@/lib/i18n/server';
import type { RecordingCounts, SongCounts } from '@/lib/library/summary';

export async function SongCountSubtitle({ counts, emptyLabel }: { counts: SongCounts; emptyLabel: string }) {
    const t = await getServerT();
    if (counts.total === 0) return <span className="text-caption text-fg-muted">{emptyLabel}</span>;
    return (
        <span className="text-caption text-fg-muted whitespace-nowrap">
            {counts.total === 1 ? t('playlists.songCountSingle') : t('playlists.songCount', { count: counts.total })}
            {' · '}
            <span>{t('playlists.countPublic', { count: counts.public })}</span>
            {' · '}
            <span>{t('playlists.countDraft', { count: counts.draft })}</span>
        </span>
    );
}

/** The Your recordings card counts recordings, not songs, and says which are public and which stay private. */
export async function RecordingCountSubtitle({ counts, emptyLabel }: { counts: RecordingCounts; emptyLabel: string }) {
    const t = await getServerT();
    if (counts.total === 0) return <span className="text-caption text-fg-muted">{emptyLabel}</span>;
    return (
        <span className="text-caption text-fg-muted whitespace-nowrap">
            {counts.total === 1 ? t('librarySummary.recordings.countSingle') : t('librarySummary.recordings.count', { count: counts.total })}
            {' · '}
            <span>{t('librarySummary.recordings.public', { count: counts.public })}</span>
            {' · '}
            <span>{t('librarySummary.recordings.private', { count: counts.private })}</span>
        </span>
    );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

export interface SmartPlaylistCardProps {
    title: string;
    description?: string;
    subtitle: React.ReactNode;
    songTitles?: string[];
    accent?: string;
    href: string;
}

export async function SmartPlaylistCard({ title, description, subtitle, songTitles = [], href }: SmartPlaylistCardProps) {
    return (
        <Link href={href} className={PLAYLIST_ROW}>
            <CardContent
                title={title}
                description={description}
                subtitle={subtitle}
                songTitles={songTitles}
            />
        </Link>
    );
}

