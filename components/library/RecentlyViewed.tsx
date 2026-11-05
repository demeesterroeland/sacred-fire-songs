import Link from 'next/link';
import { Clock } from 'lucide-react';
import { ListRow } from '@/components/ui/list-row';
import { songRowMeta } from '@/lib/songs/songMeta';
import type { Song } from '@/lib/songUtils';

import { getServerT } from '@/lib/i18n/server';
interface RecentlyViewedProps {
  songs: Song[];
  total?: number;
}

export default async function RecentlyViewed({ songs, total }: RecentlyViewedProps) {
  const t = await getServerT();
  if (songs.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5 text-fg-subtle" aria-hidden />
        <p className="text-caption font-semibold text-fg-muted uppercase tracking-widest">{t('recentlyViewed.section')}</p>
        {total !== undefined && total > 5 && (
          <Link
            href="/library/recently-viewed"
            className="ml-auto inline-flex min-h-tap items-center text-caption font-semibold text-fg hover:text-accent uppercase tracking-wider"
          >
            {t('common.viewAll')}
          </Link>
        )}
      </div>
      <div className="border-t border-line" data-testid="song-rows">
        {songs.map((song) => (
          <ListRow
            key={song.id}
            asChild
            title={song.title}
            meta={songRowMeta(song.author, song.categories, t)}
            className="px-0"
          >
            <Link href={`/songs/${song.id}`} data-testid="song-row" />
          </ListRow>
        ))}
      </div>
    </div>
  );
}
