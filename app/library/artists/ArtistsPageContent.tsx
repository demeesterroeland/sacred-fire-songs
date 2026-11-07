'use client';

import Link from 'next/link';
import { ListRow } from '@/components/ui/list-row';
import type { ArtistSummary } from '@/lib/songs/serverQueries';
import { useLocale } from '@/context/LocaleContext';

export default function ArtistsPageContent({ artists }: { artists: ArtistSummary[] }) {
    const { t } = useLocale();
    if (artists.length === 0) {
        return (
            <p className="text-meta text-fg-muted italic py-8 text-center">
                {t('artists.emptyHint')}
            </p>
        );
    }

    return (
        <div className="border-t border-line" data-testid="artist-rows">
            {artists.map((artist) => {
                const songLabel = artist.songCount === 1
                    ? t('playlists.songCountSingle')
                    : t('playlists.songCount', { count: artist.songCount });

                return (
                    <ListRow
                        key={artist.name}
                        asChild
                        title={artist.name}
                        meta={[songLabel, ...artist.songTitles]}
                        className="px-0"
                    >
                        <Link href={`/songs?artist=${encodeURIComponent(artist.name)}`} />
                    </ListRow>
                );
            })}
        </div>
    );
}
