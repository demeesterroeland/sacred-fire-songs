'use server';

/**
 * Story 6.2.26 / G1.5 (#598): suggest that a song is a version of another song; a gatekeeper or admin links or
 * declines.
 *
 * The rules (who may suggest, public songs only, one open suggestion per pair, at most 10 per member, who reviews)
 * run in the database (fn_suggest_song_link and friends: SECURITY DEFINER, one transaction). These actions validate
 * the input, call the functions with the caller's session, and turn a refusal into a reason the dialog can translate.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { safeParse, uuid } from '@/lib/validation/schemas';
import { parseLinkSummary, type SongLinkSummary } from '@/lib/songs/linkSong';
import { normalizeNote, suggestionError, type SuggestionError } from '@/lib/songs/linkSuggestion';

export type SuggestionActionResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: SuggestionError };

export interface SuggestCandidate {
  id: string;
  title: string;
  original_author: string | null;
  versionCount: number;
  /** The signed-in person already has an open suggestion for this pair. */
  alreadySuggested: boolean;
}

const SEARCH_LIMIT = 10;
const escapeLike = (text: string) => text.replace(/[\\%_]/g, (c) => `\\${c}`);

async function signedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function refresh(summary?: SongLinkSummary) {
  revalidatePath('/suggestions');
  if (summary) {
    revalidatePath('/');
    revalidatePath('/songs');
    revalidatePath(`/songs/${summary.target_id}`);
    revalidatePath(`/songs/${summary.source_id}`);
  }
}

/** A member suggests: `sourceId` is a version of `targetId`. Nothing changes until a reviewer decides. */
export async function suggestSongLink(sourceId: string, targetId: string, note: string): Promise<SuggestionActionResult<{ id: string }>> {
  const source = safeParse(uuid, sourceId);
  const target = safeParse(uuid, targetId);
  if ('error' in source || 'error' in target) return { ok: false, error: 'invalid' };
  if (source.data === target.data) return { ok: false, error: 'self' };
  const text = normalizeNote(note);
  if (!text.ok) return { ok: false, error: text.error };

  const { supabase, user } = await signedIn();
  if (!user) return { ok: false, error: 'signIn' };

  const { data, error } = await supabase.rpc('fn_suggest_song_link', {
    p_source: source.data,
    p_target: target.data,
    p_note: text.value,
  });
  if (error) {
    const reason = suggestionError(error);
    if (reason === 'failed') console.error('[linkSuggestion] suggest failed:', error);
    return { ok: false, error: reason };
  }
  const id = (data as { id?: string } | null)?.id;
  if (!id) return { ok: false, error: 'failed' };
  refresh();
  return { ok: true, id };
}

/**
 * Public songs whose title matches the text, the song itself left out; each with its version count and whether the
 * person already suggested this pair, so the list can tell look-alike titles apart.
 */
export async function searchSongsToSuggest(
  query: string,
  excludeId: string,
): Promise<{ songs: SuggestCandidate[] } | { error: SuggestionError }> {
  const text = (query ?? '').trim().slice(0, 100);
  const exclude = safeParse(uuid, excludeId);
  if ('error' in exclude) return { error: 'invalid' };

  const { supabase, user } = await signedIn();
  if (!user) return { error: 'signIn' };
  if (text.length < 2) return { songs: [] };

  const { data, error } = await supabase
    .from('compositions')
    .select('id, title, original_author, song_versions(count)')
    .eq('is_public', true)
    .neq('id', exclude.data)
    .ilike('title', `%${escapeLike(text)}%`)
    .order('title', { ascending: true })
    .limit(SEARCH_LIMIT);
  if (error) {
    console.error('[linkSuggestion] search failed:', error);
    return { error: 'failed' };
  }

  const { data: open } = await supabase
    .from('song_link_suggestions')
    .select('source_id, target_id')
    .eq('suggested_by', user.id)
    .eq('status', 'open')
    .or(`source_id.eq.${exclude.data},target_id.eq.${exclude.data}`);
  const suggested = new Set((open ?? []).flatMap((r) => [r.source_id, r.target_id]).filter((id): id is string => !!id));

  type Found = { id: string; title: string; original_author: string | null; song_versions: { count: number }[] | null };
  return {
    songs: ((data ?? []) as Found[]).map((s) => ({
      id: s.id,
      title: s.title,
      original_author: s.original_author,
      versionCount: s.song_versions?.[0]?.count ?? 0,
      alreadySuggested: suggested.has(s.id),
    })),
  };
}

async function callOne(fn: string, args: Record<string, unknown>): Promise<SuggestionActionResult> {
  const { supabase, user } = await signedIn();
  if (!user) return { ok: false, error: 'signIn' };
  const { error } = await supabase.rpc(fn as never, args as never);
  if (error) {
    const reason = suggestionError(error);
    if (reason === 'failed') console.error(`[linkSuggestion] ${fn} failed:`, error);
    return { ok: false, error: reason };
  }
  refresh();
  return { ok: true };
}

/** The suggester takes back their own open suggestion. */
export async function withdrawSuggestion(id: string): Promise<SuggestionActionResult> {
  const parsed = safeParse(uuid, id);
  if ('error' in parsed) return { ok: false, error: 'invalid' };
  return callOne('fn_withdraw_song_link_suggestion', { p_id: parsed.data });
}

/** A reviewer declines with an optional reason; the member is told. */
export async function declineSuggestion(id: string, reason: string): Promise<SuggestionActionResult> {
  const parsed = safeParse(uuid, id);
  if ('error' in parsed) return { ok: false, error: 'invalid' };
  const text = normalizeNote(reason);
  if (!text.ok) return { ok: false, error: text.error };
  return callOne('fn_decline_song_link_suggestion', { p_id: parsed.data, p_reason: text.value });
}

/** An admin takes a decline back. */
export async function reopenSuggestion(id: string): Promise<SuggestionActionResult> {
  const parsed = safeParse(uuid, id);
  if ('error' in parsed) return { ok: false, error: 'invalid' };
  return callOne('fn_reopen_song_link_suggestion', { p_id: parsed.data });
}

async function callSummary(fn: 'fn_preview_song_link_suggestion' | 'fn_accept_song_link_suggestion', id: string, swap: boolean) {
  const parsed = safeParse(uuid, id);
  if ('error' in parsed) return { ok: false as const, error: 'invalid' as const };
  const { supabase, user } = await signedIn();
  if (!user) return { ok: false as const, error: 'signIn' as const };
  const { data, error } = await supabase.rpc(fn, { p_id: parsed.data, p_swap: swap === true });
  if (error) {
    const reason = suggestionError(error);
    if (reason === 'failed') console.error(`[linkSuggestion] ${fn} failed:`, error);
    return { ok: false as const, error: reason };
  }
  const summary = parseLinkSummary(data);
  return summary ? { ok: true as const, summary } : { ok: false as const, error: 'failed' as const };
}

/** What accepting would move. Changes nothing. `swap` keeps the suggested song instead of the target. */
export async function previewSuggestion(id: string, swap: boolean): Promise<SuggestionActionResult<{ summary: SongLinkSummary }>> {
  return callSummary('fn_preview_song_link_suggestion', id, swap);
}

/** A reviewer links the songs from the suggestion (no undo). */
export async function acceptSuggestion(id: string, swap: boolean): Promise<SuggestionActionResult<{ summary: SongLinkSummary }>> {
  const result = await callSummary('fn_accept_song_link_suggestion', id, swap);
  if (result.ok) refresh(result.summary);
  return result;
}
