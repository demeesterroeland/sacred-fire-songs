'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  NOTIFICATION_LIMIT,
  markSongNotificationsRead,
  notificationsKey,
  type AppNotification,
} from '@/lib/notifications/queries';
import { markSongNotificationsReadInCache, songHasUnread } from '@/lib/notifications/sharedWithMe';

/**
 * Story 6.1.19 / G4.6 (#403): when the song's Practice drawer opens, every unread notification
 * about that song is marked read and the bell's cache is updated at once, so its badge drops
 * without waiting for the next poll. Runs once per opening (and again if the song changes).
 * The server is skipped only when the bell's cache holds every notification (fewer than
 * NOTIFICATION_LIMIT) and none of them is an unread one for this song; otherwise an older
 * unread row could sit beyond the cache. The update only touches unread rows.
 */
export function useMarkSongNotificationsRead({
  userId,
  compositionId,
  isOpen,
}: {
  userId: string | null | undefined;
  compositionId: string | null | undefined;
  isOpen: boolean;
}) {
  const queryClient = useQueryClient();
  const handledFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      handledFor.current = null;
      return;
    }
    if (!userId || !compositionId || handledFor.current === compositionId) return;
    handledFor.current = compositionId;

    const key = notificationsKey(userId);
    const cached = queryClient.getQueryData<AppNotification[]>(key);
    const hasUnread = cached ? songHasUnread(cached, compositionId) : true;
    if (cached && !hasUnread && cached.length < NOTIFICATION_LIMIT) return;

    if (cached && hasUnread) {
      // A poll in flight must not overwrite the optimistic read_at.
      void queryClient.cancelQueries({ queryKey: key });
      queryClient.setQueryData<AppNotification[]>(key, (prev = []) =>
        markSongNotificationsReadInCache(prev, compositionId, new Date().toISOString()),
      );
    }
    markSongNotificationsRead(compositionId)
      .then(() => queryClient.invalidateQueries({ queryKey: key }))
      .catch((e) => {
        console.warn('[notifications] Mark song read failed:', e);
        queryClient.invalidateQueries({ queryKey: key });
      });
  }, [isOpen, userId, compositionId, queryClient]);
}
