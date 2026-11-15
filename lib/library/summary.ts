import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * What the Library smart cards count (Validation 2, items 9 and 13).
 *
 * "My Drafts" counts the signed-in user's own private songs. Row-level security lets an admin read every draft,
 * so the query must filter on the owner itself. "Your recordings" counts recordings (not songs) and splits them by
 * the recording's own visibility: a recording is private until its owner shares or publishes it.
 */
export interface SongCounts {
  total: number;
  public: number;
  draft: number;
}

export interface RecordingCounts {
  total: number;
  public: number;
  private: number;
  /** Distinct song titles, in the order of the rows. */
  titles: string[];
}

interface RecordingRow {
  is_public: boolean | null;
  song_versions: { compositions: { title: string | null } | null } | null;
}

export function summarizeRecordings(rows: RecordingRow[]): RecordingCounts {
  const total = rows.length;
  const pub = rows.filter((r) => r.is_public === true).length;
  const titles = Array.from(
    new Set(rows.map((r) => r.song_versions?.compositions?.title).filter((t): t is string => !!t)),
  );
  return { total, public: pub, private: total - pub, titles };
}

export interface LibrarySummary {
  mySongs: SongCounts & { titles: string[] };
  drafts: SongCounts & { titles: string[] };
  recordings: RecordingCounts;
}

interface SongRow {
  title: string;
  is_public: boolean | null;
}

export async function fetchLibrarySummary(supabase: SupabaseClient, userId: string): Promise<LibrarySummary> {
  const [songsResult, draftsResult, recordingsResult] = await Promise.all([
    supabase.from('compositions').select('title, is_public').eq('owner_id', userId).limit(500),
    // Owner filter: without it an admin's own card counts every draft in the library.
    supabase.from('compositions').select('title, is_public').eq('is_public', false).eq('owner_id', userId).limit(500),
    supabase.from('user_recordings').select('is_public, song_versions(compositions(title))').eq('user_id', userId),
  ]);

  const songs = (songsResult.data ?? []) as SongRow[];
  const drafts = (draftsResult.data ?? []) as SongRow[];
  return {
    mySongs: {
      total: songs.length,
      public: songs.filter((s) => s.is_public).length,
      draft: songs.filter((s) => !s.is_public).length,
      titles: songs.slice(0, 5).map((s) => s.title),
    },
    drafts: { total: drafts.length, public: 0, draft: drafts.length, titles: drafts.slice(0, 5).map((s) => s.title) },
    recordings: summarizeRecordings((recordingsResult.data ?? []) as unknown as RecordingRow[]),
  };
}
