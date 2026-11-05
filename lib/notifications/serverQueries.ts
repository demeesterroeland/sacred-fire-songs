import { createClient } from '@/lib/supabase/server';
import { buildSharedWithMe, type ShareRow, type SharedTake } from '@/lib/notifications/sharedWithMe';

export const SHARED_WITH_ME_LIMIT = 100;

/**
 * Story 6.1.19 / G4.6 (#403): the takes shared with `userId`, newest first. Reads the
 * recipient's own `recording_shares` rows (RLS lets a recipient read them, the take, the
 * song it belongs to and the owner's name) and joins the recipient's own notifications for
 * the unread state. Only import from Server Components or Server Actions.
 */
export async function getSharedWithMe(userId: string): Promise<SharedTake[]> {
  const supabase = await createClient();
  const { data: shares, error } = await supabase
    .from('recording_shares')
    .select(
      'id, recording_id, created_at, user_recordings(id, user_id, recording_name, song_versions(composition_id, compositions(title)))',
    )
    .eq('shared_with_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(SHARED_WITH_ME_LIMIT);
  if (error) throw error;

  const rows = (shares ?? []) as unknown as ShareRow[];
  if (rows.length === 0) return [];

  const ownerIds = Array.from(new Set(rows.map((r) => r.user_recordings?.user_id).filter((id): id is string => !!id)));
  const recordingIds = rows.map((r) => r.recording_id);

  const [{ data: owners }, { data: notes }] = await Promise.all([
    ownerIds.length > 0
      ? supabase.from('profiles').select('id, full_name, email').in('id', ownerIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null; email: string | null }[] }),
    supabase
      .from('notifications')
      .select('recording_id, composition_id, metadata, read_at')
      .eq('user_id', userId)
      .eq('type', 'recording_shared')
      .in('recording_id', recordingIds),
  ]);

  return buildSharedWithMe(
    rows,
    new Map((owners ?? []).map((o) => [o.id, o])),
    (notes ?? []) as Parameters<typeof buildSharedWithMe>[2],
  );
}
