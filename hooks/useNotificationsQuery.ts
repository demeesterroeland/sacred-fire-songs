'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchNotifications, notificationsKey } from '@/lib/notifications/queries';

const POLL_MS = 60_000;

/** The signed-in user's latest notifications; one cache entry shared by the bell and the account menu. */
export function useNotificationsQuery(userId: string) {
  return useQuery({
    queryKey: notificationsKey(userId),
    queryFn: fetchNotifications,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  });
}
