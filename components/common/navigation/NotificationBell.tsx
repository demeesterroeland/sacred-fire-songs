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
          className="relative p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unread.length > 0 && (
            <span className="absolute top-1 right-1 min-w-5 h-5 px-1 rounded-full bg-[#f45d1a] text-white text-caption font-semibold leading-5 text-center">
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xl shadow-black/10 dark:shadow-black/40">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm font-bold text-gray-900 dark:text-white">{t('notifications.title')}</span>
          {unread.length > 0 && (
            <button
              type="button"
              onClick={() => void markRead(unread.map((n) => n.id))}
              className="text-xs font-semibold text-[#f45d1a] hover:underline"
            >
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-sm text-center text-gray-500 dark:text-gray-400">{t('notifications.empty')}</p>
        ) : (
          <div className="max-h-96 overflow-y-auto py-1">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onSelect={() => openNotification(n)}
                className="flex items-start gap-3 px-4 py-3 rounded-none cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800/70"
              >
                <span className="mt-0.5 p-1.5 rounded-full bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`block text-sm leading-snug ${n.read_at ? 'text-gray-600 dark:text-gray-400' : 'font-semibold text-gray-900 dark:text-white'}`}>
                    {t('notifications.recordingShared', {
                      actor: n.metadata.actor_name ?? '',
                      recording: n.metadata.recording_name ?? '',
                      song: n.metadata.song_title ?? '',
                    })}
                  </span>
                  <span className="block mt-0.5 text-xs text-gray-400">
                    {relativeTime(n.created_at, LOCALE_DATE_TAGS[locale])}
                  </span>
                </span>
                {!n.read_at && <span className="mt-1.5 w-2 h-2 rounded-full bg-[#f45d1a] shrink-0" aria-hidden />}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
