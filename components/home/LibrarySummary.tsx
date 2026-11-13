import Link from 'next/link';

import { getServerT } from '@/lib/i18n/server';
import type { TranslationKey } from '@/lib/i18n';
import { MY_DRAFTS_HREF } from '@/lib/songs/draftsLink';
import type { LibrarySummary as LibrarySummaryCounts } from '@/lib/songs/serverQueries';

type Stat = { key: string; labelKey: TranslationKey; href: string; count: keyof LibrarySummaryCounts };

/**
 * Story 6.1.36 (#488): personal items only, in two groups of three that sit on the two columns of
 * "Recently added" and the category grid below (one row of six from md, two rows of three on a phone).
 * The first count of each group starts at the song titles' x.
 */
const groups: ReadonlyArray<ReadonlyArray<Stat>> = [
  [
    { key: 'favorites', labelKey: 'nav.favorites', href: '/songs?favorites=true', count: 'favoritesCount' },
    { key: 'drafts', labelKey: 'nav.drafts', href: MY_DRAFTS_HREF, count: 'draftsCount' },
    { key: 'mySongs', labelKey: 'librarySummary.mySongs.title', href: '/songs?mine=true', count: 'mySongsCount' },
  ],
  [
    { key: 'recordings', labelKey: 'librarySummary.recordings.title', href: '/songs?myRecordings=true', count: 'recordingsCount' },
    { key: 'sharedWithMe', labelKey: 'sharedWithMe.title', href: '/library/shared', count: 'sharedWithMeCount' },
    { key: 'sharedByMe', labelKey: 'sharedByMe.title', href: '/library/shared-by-me', count: 'sharedByMeCount' },
  ],
];

export default async function LibrarySummary(props: LibrarySummaryCounts) {
  const t = await getServerT();
  return (
    <section aria-labelledby="library-summary-heading" data-testid="library-summary">
      <p id="library-summary-heading" className="text-meta font-semibold text-fg-muted mb-4">
        {t('library.heading')}
      </p>
      <div className="grid grid-cols-1 gap-y-2 md:grid-cols-2 md:gap-x-6">
        {groups.map((group, g) => (
          <div key={g} className="grid grid-cols-3 divide-x divide-line">
            {group.map((stat) => (
              <Link
                key={stat.key}
                href={stat.href}
                data-testid="library-stat"
                data-key={stat.key}
                className="block min-h-tap min-w-0 px-2 py-1 transition-colors first:ps-4 hover:bg-surface md:px-4"
              >
                <p className="text-lg font-bold text-fg leading-tight">{props[stat.count]}</p>
                <p className="text-caption text-fg-muted break-words hyphens-auto">{t(stat.labelKey)}</p>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
