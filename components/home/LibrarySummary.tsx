import Link from 'next/link';

import { getServerT } from '@/lib/i18n/server';
import { MY_DRAFTS_HREF } from '@/lib/songs/draftsLink';
interface LibrarySummaryProps {
  favoritesCount: number;
  draftsCount: number;
  mySongsCount: number;
  newSongsCount: number;
}

const stats = [
  {
    key: 'favorites',
    labelKey: 'nav.favorites',
    href: '/songs?favorites=true',
  },
  {
    key: 'drafts',
    labelKey: 'nav.drafts',
    href: MY_DRAFTS_HREF,
  },
  {
    key: 'mySongs',
    labelKey: 'librarySummary.mySongs.title',
    href: '/songs?mine=true',
  },
  {
    key: 'newSongs',
    labelKey: 'librarySummary.newSongs.title',
    href: '/songs?new=true',
  },
] as const;

const countMap: Record<string, keyof LibrarySummaryProps> = {
  favorites: 'favoritesCount',
  drafts: 'draftsCount',
  mySongs: 'mySongsCount',
  newSongs: 'newSongsCount',
};

export default async function LibrarySummary(props: LibrarySummaryProps) {
  const t = await getServerT();
  return (
    <div>
      <p className="text-meta font-semibold text-fg-muted mb-4">{t('library.heading')}</p>
      <div className="grid grid-cols-4 divide-x divide-line">
        {stats.map((stat) => {
          const count = props[countMap[stat.key]];
          return (
            <Link
              key={stat.key}
              href={stat.href}
              className="block min-h-tap min-w-0 px-2 py-1 transition-colors first:ps-0 hover:bg-surface md:px-4"
            >
              <p className="text-lg font-bold text-fg leading-tight">{count}</p>
              <p className="text-caption text-fg-muted break-words hyphens-auto">{t(stat.labelKey)}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
