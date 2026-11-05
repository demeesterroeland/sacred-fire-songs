'use client';

import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import { ListRow } from '@/components/ui/list-row';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/context/LocaleContext';
import { useNotificationsQuery } from '@/hooks/useNotificationsQuery';
import { unreadSharedCount } from '@/lib/notifications/sharedWithMe';

function Row({ userId }: { userId: string }) {
  const { t } = useLocale();
  const { data } = useNotificationsQuery(userId);
  const unread = unreadSharedCount(data);
  return (
    <ListRow
      asChild
      leading={<Users className="size-5" aria-hidden="true" />}
      title={t('sharedWithMe.title')}
      trailing={
        <span className="inline-flex items-center gap-1.5 text-meta text-fg-muted">
          {unread > 0 ? (
            <span data-testid="library-shared-unread" className="rounded-pill bg-chip px-2 py-0.5 text-caption font-semibold text-on-chip">
              {t('sharedWithMe.unreadCount', { count: unread })}
            </span>
          ) : null}
          <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      }
      className="px-0"
    >
      <Link href="/library/shared" data-testid="library-shared-link" />
    </ListRow>
  );
}

/**
 * Library entry to "Shared with me" (Story 6.1.19 / G4.6, UXD-3): one 44 px row under the tabs,
 * with the unread count in words. Members only; guests reach the page through the sign-in gate.
 */
export function SharedWithMeLink() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="mb-6 border-y border-line">
      <Row userId={user.id} />
    </div>
  );
}
