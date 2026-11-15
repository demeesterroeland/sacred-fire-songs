import { createClient } from '@/lib/supabase/server';
import { buildSharedByMe, type SharedByMeRow, type SharedByMeTake } from '@/lib/library/sharedByMe';

export const SHARED_BY_ME_LIMIT = 200;

/**
 * Story 6.1.36 (#488): my takes that I shared, newest share first. RLS lets the owner read the
 * share rows of their own takes; names come from `public_profiles`.
 * Only import from Server Components or Server Actions.
 */
export async function getSharedByMe(userId: string): Promise<SharedByMeTake[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('recording_shares')
    .select(
      'recording_id, shared_with_user_id, created_at, user_recordings!inner(id, user_id, recording_name, song_versions(composition_id, compositions(title)))',
    )
    .eq('user_recordings.user_id', userId)
    .order('created_at', { ascending: false })
    .limit(SHARED_BY_ME_LIMIT);
  if (error) throw error;

  const rows = (data ?? []) as unknown as SharedByMeRow[];
  if (rows.length === 0) return [];

  const ids = Array.from(new Set(rows.map((r) => r.shared_with_user_id)));
  const { data: people } = await supabase.from('public_profiles').select('id, full_name').in('id', ids);
  return buildSharedByMe(rows, new Map((people ?? []).map((p) => [p.id, p.full_name])));
}
