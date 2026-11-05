'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  markSongNotificationsRead,
  notificationsKey,
  type AppNotification,
} from '@/lib/notifications/queries';
import { markSongNotificationsReadInCache, songHasUnread } from '@/lib/notifications/sharedWithMe';

/**
 * Story 6.1.19 / G4.6 (#403): when the song's Practice drawer opens, every unread notification
 * about that song is marked read and the bell's cache is updated at once, so its badge drops
 * without waiting for the next poll. Runs once per opening. When the bell has not loaded yet
 * the server is asked anyway (the update only touches unread rows).
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
  const handled = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      handled.current = false;
      return;
    }
    if (handled.current || !userId || !compositionId) return;
    handled.current = true;

    const key = notificationsKey(userId);
    const cached = queryClient.getQueryData<AppNotification[]>(key);
    if (cached && !songHasUnread(cached, compositionId)) return;

    if (cached) {
      queryClient.setQueryData<AppNotification[]>(key, (prev = []) =>
        markSongNotificationsReadInCache(prev, compositionId, new Date().toISOString()),
      );
    }
    markSongNotificationsRead(compositionId)
      .then(() => {
        if (!cached) queryClient.invalidateQueries({ queryKey: key });
      })
      .catch((e) => {
        console.warn('[notifications] Mark song read failed:', e);
        queryClient.invalidateQueries({ queryKey: key });
      });
  }, [isOpen, userId, compositionId, queryClient]);
}
