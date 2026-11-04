/**
 * Browser-side notification queries (Story 4.6.6). RLS limits every query to
 * the signed-in user's own rows; recipients may only change `read_at`.
 */
import { createClient } from '@/lib/supabase/client';

export type NotificationType = 'recording_shared';

export interface AppNotification {
  id: string;
  type: NotificationType;
  composition_id: string | null;
  recording_id: string | null;
  metadata: {
    actor_name?: string;
    song_title?: string;
    recording_name?: string;
  };
  read_at: string | null;
  created_at: string;
}

export const NOTIFICATION_LIMIT = 20;

export async function fetchNotifications(): Promise<AppNotification[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, composition_id, recording_id, metadata, read_at, created_at')
    .order('created_at', { ascending: false })
    .limit(NOTIFICATION_LIMIT);
  if (error) throw error;
  return (data ?? []) as AppNotification[];
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .in('id', ids)
    .is('read_at', null);
  if (error) throw error;
}

export async function getEmailNotificationsEnabled(userId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('email_notifications')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.email_notifications ?? true;
}

export async function setEmailNotificationsEnabled(userId: string, enabled: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ email_notifications: enabled })
    .eq('id', userId);
  if (error) throw error;
}
