'use client';

import Link from 'next/link';
import { ListRow } from '@/components/ui/list-row';
import { useLocale } from '@/context/LocaleContext';
import { recordingPermalink } from '@/lib/songs/recordingLink';
import type { SharedByMeTake } from '@/lib/library/sharedByMe';

/**
 * Story 6.1.36 (#488): my takes that I shared. One 44 px row per take: song title, the take name and
 * "Shared with <names>" (names only, never an address). A row opens the take's deep link.
 */
export function SharedByMeList({ items }: { items: ReadonlyArray<SharedByMeTake> }) {
  const { t } = useLocale();

  if (items.length === 0) {
    return (
      <p data-testid="shared-by-me-empty" className="py-8 text-center text-meta text-fg-muted">
        {t('sharedByMe.empty')}
      </p>
    );
  }

  return (
    <div className="border-t border-line" data-testid="shared-by-me-list">
      {items.map((item) => (
        <ListRow
          key={item.recordingId}
          asChild
          title={item.songTitle}
          meta={[
            item.takeName,
            t('sharedByMe.with', { names: item.sharedWith.map((n) => n ?? t('user.unnamed')).join(', ') }),
          ]}
          className="px-0"
        >
          <Link href={recordingPermalink(item.recordingId)} data-testid="shared-by-me-row" />
        </ListRow>
      ))}
    </div>
  );
}
