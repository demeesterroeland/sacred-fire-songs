import { createClient } from '@/lib/supabase/server';
import { buildSongbookDetail, buildSongbookList, type RawSongbook, type SongbookDetail, type SongbookSummary } from '@/lib/songbooks/songbookPage';
import { SONGBOOK_LIST_SELECT, SONGBOOK_PAGE_SELECT } from '@/lib/songbooks/songbookSelect';

/**
 * Story 6.2.11 / G2.2 (#514): songbook pages. Everything runs with the viewer's row-level security, so a guest reads the
 * public songs of a book, a member also their own private songs (admins all; nothing comes through sharing), and a
 * book none of whose songs the viewer can read does not exist for them (the `songbooks` policy needs one readable
 * source). Only import from Server Components or Server Actions.
 *
 * The selects live in `songbookSelect.ts`.
 */

/** The books the viewer can read, by title, each with its song count (see `buildSongbookList`). */
export async function fetchSongbooksServer(locale = 'en'): Promise<SongbookSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('songbooks').select(SONGBOOK_LIST_SELECT).order('title');
  if (error) throw error;
  return buildSongbookList((data ?? []) as unknown as RawSongbook[], locale);
}

/**
 * One book with its songs in page order, or `null` when it does not exist or the viewer cannot read it (the same
 * answer on purpose, so a link does not reveal a book of private songs). An admin can read a book with no songs yet:
 * `entries` is then empty.
 */
export async function fetchSongbookServer(id: string, locale = 'en'): Promise<SongbookDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('songbooks').select(SONGBOOK_PAGE_SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? buildSongbookDetail(data as unknown as RawSongbook, locale) : null;
}

export type { SongbookDetail, SongbookSummary };
