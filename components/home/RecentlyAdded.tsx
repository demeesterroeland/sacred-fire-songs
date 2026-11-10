import Link from 'next/link';
import SongCard from '@/components/home/SongCard';
import { getServerT } from '@/lib/i18n/server';
import type { Song } from '@/lib/songUtils';
import { RECENTLY_ADDED_PHONE_LIMIT } from '@/lib/songs/queries';

/**
 * Story 6.1.28 (G6.3, #412): the newest public songs as compact rows (the G1.2 SongCard),
 * so a first-time visitor can open a song without searching. Hidden when there is nothing to show.
 * Story 6.1.36 (#488): the grid of /songs and the category grid (two columns from md, filled row
 * by row); one column with the first RECENTLY_ADDED_PHONE_LIMIT rows below md.
 */
export default async function RecentlyAdded({ songs }: { songs: Song[] }) {
  if (songs.length === 0) return null;
  const t = await getServerT();
  return (
    <section aria-labelledby="recently-added-heading" data-testid="recently-added">
      <div className="mb-1 flex min-h-tap items-center justify-between ps-4">
        <h2 id="recently-added-heading" className="text-meta font-semibold text-fg-muted">
          {t('home.recent.heading')}
        </h2>
        <Link
          href="/songs"
          className="-me-2 inline-flex min-h-tap items-center px-2 text-meta font-medium text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t('home.recent.viewAll')}
        </Link>
      </div>
      <div className="grid grid-cols-1 border-t border-line md:grid-cols-2 md:gap-x-6">
        {songs.map((song, i) => (
          <div key={song.id} className={i >= RECENTLY_ADDED_PHONE_LIMIT ? 'hidden md:block' : undefined}>
            <SongCard
              id={song.id}
              title={song.title}
              author={song.author}
              songKey={song.songKey}
              isPublic={song.isPublic}
              categories={song.categories}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
