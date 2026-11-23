/**
 * Story 6.1.36 (#488): "Shared by me" — my takes that I shared with other members, one row per
 * take with the names of the members (never an e-mail address). Pure helpers (no I/O).
 */

/** One `recording_shares` row of a take I own, with the take and its song embedded. */
export interface SharedByMeRow {
  recording_id: string;
  shared_with_user_id: string;
  created_at: string;
  user_recordings: {
    id: string;
    user_id: string;
    recording_name: string;
    song_versions: {
      composition_id: string;
      compositions: { title: string } | null;
    } | null;
  } | null;
}

export interface SharedByMeTake {
  recordingId: string;
  compositionId: string | null;
  songTitle: string;
  takeName: string;
  /** Public profile names of the members it is shared with; null when a profile has no name. */
  sharedWith: (string | null)[];
  /** The newest share of this take. */
  sharedAt: string;
}

/**
 * Groups the shares per take, in the order of the rows (the query returns newest first).
 * A share whose take vanished is dropped; a take whose song is not readable is named by the take.
 */
export function buildSharedByMe(
  rows: ReadonlyArray<SharedByMeRow>,
  names: ReadonlyMap<string, string | null>,
): SharedByMeTake[] {
  const byTake = new Map<string, SharedByMeTake>();
  for (const row of rows) {
    const rec = row.user_recordings;
    if (!rec) continue;
    const name = names.get(row.shared_with_user_id)?.trim() || null;
    const existing = byTake.get(row.recording_id);
    if (existing) {
      existing.sharedWith.push(name);
      continue;
    }
    byTake.set(row.recording_id, {
      recordingId: row.recording_id,
      compositionId: rec.song_versions?.composition_id ?? null,
      songTitle: rec.song_versions?.compositions?.title ?? rec.recording_name,
      takeName: rec.recording_name,
      sharedWith: [name],
      sharedAt: row.created_at,
    });
  }
  return [...byTake.values()];
}

/** Number of distinct takes in a list of share rows. */
export function countSharedTakes(rows: ReadonlyArray<{ recording_id: string }>): number {
  return new Set(rows.map((r) => r.recording_id)).size;
}
