import Link from 'next/link';
import { Heart, PenLine, Music, Sparkles } from 'lucide-react';

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
    icon: Heart,
    labelKey: 'nav.favorites',
    href: '/songs?favorites=true',
  },
  {
    key: 'drafts',
    icon: PenLine,
    labelKey: 'nav.drafts',
    href: MY_DRAFTS_HREF,
  },
  {
    key: 'mySongs',
    icon: Music,
    labelKey: 'librarySummary.mySongs.title',
    href: '/songs?mine=true',
  },
  {
    key: 'newSongs',
    icon: Sparkles,
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const count = props[countMap[stat.key]];
          return (
            <Link
              key={stat.key}
              href={stat.href}
              className="flex items-center gap-3 p-3 md:p-4 rounded-panel border border-line bg-surface hover:bg-surface-2 transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-9 h-9 rounded-control flex items-center justify-center shrink-0 bg-surface-2 text-fg-muted group-hover:text-fg transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-fg leading-tight">{count}</p>
                <p className="text-caption text-fg-muted truncate">{t(stat.labelKey)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
