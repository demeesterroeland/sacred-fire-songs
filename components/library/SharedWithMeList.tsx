'use client';

import Link from 'next/link';
import { Dot } from 'lucide-react';
import { ListRow } from '@/components/ui/list-row';
import { useLocale } from '@/context/LocaleContext';
import { recordingPermalink } from '@/lib/songs/recordingLink';
import type { SharedTake } from '@/lib/notifications/sharedWithMe';

/**
 * Story 6.1.19 / G4.6 (#403), UXD-3: the takes others shared with me. One 44 px row per take:
 * song title, "Shared by <name> · <take>", and the word "New" (with an icon) while it is unread,
 * so the state never rests on colour. A row opens the take's deep link.
 */
export function SharedWithMeList({ items }: { items: ReadonlyArray<SharedTake> }) {
  const { t } = useLocale();

  if (items.length === 0) {
    return (
      <p data-testid="shared-with-me-empty" className="py-8 text-center text-meta text-fg-muted">
        {t('sharedWithMe.empty')}
      </p>
    );
  }

  return (
    <div className="border-t border-line" data-testid="shared-with-me-list">
      {items.map((item) => (
        <ListRow
          key={item.recordingId}
          asChild
          title={item.songTitle}
          meta={[
            item.sharedBy ? t('recording.sharing.sharedBy', { name: item.sharedBy }) : t('recording.sharing.badge'),
            item.takeName,
          ]}
          trailing={
            item.unread ? (
              <span
                data-testid="shared-with-me-unread"
                className="inline-flex items-center rounded-pill bg-chip py-0.5 pe-2.5 ps-1 text-caption font-semibold text-on-chip"
              >
                <Dot className="size-4 text-accent" aria-hidden="true" />
                {t('sharedWithMe.new')}
              </span>
            ) : null
          }
          className="ps-4 pe-1"
        >
          <Link href={recordingPermalink(item.recordingId)} data-testid="shared-with-me-row" />
        </ListRow>
      ))}
    </div>
  );
}
