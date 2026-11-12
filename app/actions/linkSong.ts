'use server';

/**
 * Story 6.2.9 / G1.4 (#512): link a song as a version of another song.
 *
 * The checks (admin, or a gatekeeper who owns both songs; not the same song; both public or both private) and
 * the merge run in the database
 * (fn_preview_song_link, fn_link_song_as_version: SECURITY DEFINER, one transaction). These actions validate the
 * input, call them with the caller's session, and turn a refusal into a reason the dialog can translate.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { safeParse, uuid } from '@/lib/validation/schemas';
import { canLinkSongs, parseLinkSummary, songLinkError, type SongLinkError, type SongLinkSummary } from '@/lib/songs/linkSong';

export type SongLinkResult = { summary: SongLinkSummary } | { error: SongLinkError };

export interface SongLinkCandidate {
  id: string;
  title: string;
  original_author: string | null;
}

const SEARCH_LIMIT = 10;

type Ids = { source: string; target: string } | { error: SongLinkError };

function parseIds(sourceId: string, targetId: string): Ids {
  const source = safeParse(uuid, sourceId);
  const target = safeParse(uuid, targetId);
  if ('error' in source || 'error' in target) return { error: 'invalid' };
  if (source.data === target.data) return { error: 'self' };
  return { source: source.data, target: target.data };
}

async function callLink(fn: 'fn_preview_song_link' | 'fn_link_song_as_version', sourceId: string, targetId: string) {
  const ids = parseIds(sourceId, targetId);
  if ('error' in ids) return ids;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'forbidden' as const };

  const { data, error } = await supabase.rpc(fn, { p_source: ids.source, p_target: ids.target });
  if (error) {
    if (songLinkError(error) === 'failed') console.error(`[linkSong] ${fn} failed:`, error);
    return { error: songLinkError(error) };
  }
  const summary = parseLinkSummary(data);
  return summary ? { summary } : { error: 'failed' as const };
}

/** What a link would move. Changes nothing. */
export async function previewSongLink(sourceId: string, targetId: string): Promise<SongLinkResult> {
  return callLink('fn_preview_song_link', sourceId, targetId);
}

/** Links the source song as a version of the target. The source's old link then opens the target. */
export async function linkSongAsVersion(sourceId: string, targetId: string): Promise<SongLinkResult> {
  const result = await callLink('fn_link_song_as_version', sourceId, targetId);
  if ('summary' in result) {
    revalidatePath('/');
    revalidatePath('/songs');
    revalidatePath(`/songs/${result.summary.target_id}`);
    revalidatePath(`/songs/${result.summary.source_id}`);
  }
  return result;
}

const escapeLike = (text: string) => text.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Songs to link to: title matches the text, the song being linked left out. Gatekeepers and admins only; a
 * gatekeeper only finds their own songs (they may only link songs they own), an admin every song they can read.
 */
export async function searchSongsToLinkTo(
  query: string,
  excludeId: string
): Promise<{ songs: SongLinkCandidate[] } | { error: SongLinkError }> {
  const text = (query ?? '').trim().slice(0, 100);
  const exclude = safeParse(uuid, excludeId);
  if ('error' in exclude) return { error: 'invalid' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'forbidden' };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!canLinkSongs(profile?.role)) return { error: 'forbidden' };

  if (text.length < 2) return { songs: [] };

  let search = supabase
    .from('compositions')
    .select('id, title, original_author')
    .neq('id', exclude.data)
    .ilike('title', `%${escapeLike(text)}%`);
  if (profile?.role !== 'admin') search = search.eq('owner_id', user.id);
  const { data, error } = await search.order('title', { ascending: true }).limit(SEARCH_LIMIT);
  if (error) {
    console.error('[linkSong] search failed:', error);
    return { error: 'failed' };
  }
  return { songs: (data ?? []) as SongLinkCandidate[] };
}
