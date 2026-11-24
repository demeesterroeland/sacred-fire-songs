import { createClient } from '@/lib/supabase/server';
import type { LinkSuggestion, SuggestionStatus } from '@/lib/songs/linkSuggestion';

export const SUGGESTIONS_LIMIT = 200;

interface Row {
  id: string;
  source_id: string | null;
  target_id: string | null;
  source_title: string;
  target_title: string;
  suggested_by: string | null;
  note: string | null;
  status: SuggestionStatus;
  decision_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reopened_at: string | null;
  created_at: string;
}

/**
 * Story 6.2.26 / G1.5 (#598): the link suggestions the signed-in person may read, newest first. Row-level security
 * decides: a member reads their own suggestions, a gatekeeper or admin reads every one. Names come from
 * `public_profiles` (never an e-mail address). Only import from Server Components or Server Actions.
 */
export async function getLinkSuggestions(): Promise<LinkSuggestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('song_link_suggestions')
    .select(
      'id, source_id, target_id, source_title, target_title, suggested_by, note, status, decision_note, reviewed_by, reviewed_at, reopened_at, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(SUGGESTIONS_LIMIT);
  if (error) throw error;

  const rows = (data ?? []) as Row[];
  if (rows.length === 0) return [];

  const personIds = Array.from(
    new Set(rows.flatMap((r) => [r.suggested_by, r.reviewed_by]).filter((id): id is string => !!id)),
  );
  const { data: people, error: peopleError } = await supabase
    .from('public_profiles')
    .select('id, full_name')
    .in('id', personIds);
  // Without names the rows still read; log it rather than fail the page.
  if (peopleError) console.error('[suggestions] names query failed:', peopleError);
  const names = new Map((people ?? []).map((p) => [p.id as string, (p.full_name as string | null) ?? null]));

  return rows.map((r) => ({
    ...r,
    suggester_name: r.suggested_by ? (names.get(r.suggested_by) ?? null) : null,
    reviewer_name: r.reviewed_by ? (names.get(r.reviewed_by) ?? null) : null,
  }));
}
