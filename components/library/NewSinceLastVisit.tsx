import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { ListRow } from '@/components/ui/list-row';
import { songRowMeta } from '@/lib/songs/songMeta';
import type { Song } from '@/lib/songUtils';

import { getServerT } from '@/lib/i18n/server';
interface NewSinceLastVisitProps {
  songs: Song[];
}

export default async function NewSinceLastVisit({ songs }: NewSinceLastVisitProps) {
  const t = await getServerT();
  if (songs.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-fg-subtle" aria-hidden />
          <p className="text-meta font-semibold text-fg-muted">{t('newSinceLastVisit.section')}</p>
        </div>
        <Link
          href="/songs?new=true"
          className="inline-flex min-h-tap items-center text-meta font-semibold text-fg hover:text-accent"
        >
          {t('common.viewAll')}
        </Link>
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
