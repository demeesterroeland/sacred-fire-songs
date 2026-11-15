'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/context/LocaleContext';
import { LOCALE_DATE_TAGS } from '@/lib/i18n';
import { useNotificationsQuery } from '@/hooks/useNotificationsQuery';
import {
  markNotificationsRead,
  notificationsKey,
  type AppNotification,
} from '@/lib/notifications/queries';
import { recordingPermalink } from '@/lib/songs/recordingLink';

function relativeTime(iso: string, localeTag: string): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(localeTag, { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(seconds, 'second');
}

/** Header bell with unread badge and the latest notifications (Story 4.6.6). */
export function NotificationBell({ userId }: { userId: string }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = notificationsKey(userId);

  const { data: notifications = [] } = useNotificationsQuery(userId);

  const unread = notifications.filter((n) => !n.read_at);

  const markRead = async (ids: string[]) => {
    if (ids.length === 0) return;
    const now = new Date().toISOString();
    queryClient.setQueryData<AppNotification[]>(queryKey, (prev = []) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read_at: n.read_at ?? now } : n)),
    );
    try {
      await markNotificationsRead(ids);
    } catch (e) {
      console.warn('[notifications] Mark read failed:', e);
      queryClient.invalidateQueries({ queryKey });
    }
  };

  const openNotification = (n: AppNotification) => {
    void markRead(n.read_at ? [] : [n.id]);
    if (n.recording_id) router.push(recordingPermalink(n.recording_id));
    else if (n.composition_id) router.push(`/songs/${n.composition_id}`);
  };

  const label = unread.length > 0
    ? t('notifications.bell.labelUnread', { count: unread.length })
    : t('notifications.bell.label');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          title={label}
          className="relative size-tap inline-flex items-center justify-center rounded-full text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          {unread.length > 0 && (
            <span aria-hidden="true" data-testid="notification-badge" className="absolute top-1 right-1 min-w-5 h-5 px-1 rounded-full bg-accent text-on-accent ring-2 ring-bg text-caption font-semibold leading-5 text-center">
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-panel bg-surface text-fg border-line shadow-sheet">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <span className="text-sm font-bold text-fg">{t('notifications.title')}</span>
          {unread.length > 0 && (
            <button
              type="button"
              onClick={() => void markRead(unread.map((n) => n.id))}
              // -my-3 cancels the header's py-3, so the 44 px target does not make the header taller.
              className="inline-flex min-h-tap -my-3 items-center text-xs font-semibold text-fg underline-offset-4 hover:underline"
            >
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-sm text-center text-fg-muted">{t('notifications.empty')}</p>
        ) : (
          <div className="max-h-96 overflow-y-auto py-1">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onSelect={() => openNotification(n)}
                className="flex items-start gap-3 px-4 py-3 rounded-none cursor-pointer focus:bg-surface-2"
              >
                <span className="mt-0.5 p-1.5 rounded-full bg-surface-2 text-fg-muted shrink-0">
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`block text-sm leading-snug ${n.read_at ? 'text-fg-muted' : 'font-semibold text-fg'}`}>
                    {t('notifications.recordingShared', {
                      actor: n.metadata.actor_name || t('user.unnamed'),
                      recording: n.metadata.recording_name ?? '',
                      song: n.metadata.song_title ?? '',
                    })}
                  </span>
                  <span className="block mt-0.5 text-xs text-fg-subtle">
                    {relativeTime(n.created_at, LOCALE_DATE_TAGS[locale])}
                  </span>
                </span>
                {!n.read_at && (
                  <>
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-fg shrink-0" aria-hidden />
                    <span className="sr-only">{t('notifications.unread')}</span>
                  </>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
