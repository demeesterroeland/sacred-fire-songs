/**
 * Story 6.1.19 / G4.6 (#403), owner decision UXD-3: "Shared with me" — a list of the takes
 * others shared with me, next to the header bell. Pure helpers (no I/O) shared by the page,
 * the account menu and the Practice drawer.
 */
import type { AppNotification } from '@/lib/notifications/queries';
import { sharedByName } from '@/lib/songs/partitionTakes';

/** One `recording_shares` row of the recipient, with the take and its song embedded. */
export interface ShareRow {
  id: string;
  recording_id: string;
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

export interface SharedTake {
  recordingId: string;
  compositionId: string | null;
  songTitle: string;
  takeName: string;
  /** Full name of the person who shared it; never an e-mail address. */
  sharedBy: string | null;
  sharedAt: string;
  unread: boolean;
}

type Owner = { full_name?: string | null; email?: string | null };

/**
 * Joins the recipient's shares with the owners' names and the recipient's own notifications.
 * Order is kept (the query returns newest first). A share whose take vanished is dropped; a
 * song the recipient cannot read is named from the notification snapshot, else by the take.
 */
export function buildSharedWithMe(
  shares: ReadonlyArray<ShareRow>,
  owners: ReadonlyMap<string, Owner>,
  notifications: ReadonlyArray<Pick<AppNotification, 'recording_id' | 'composition_id' | 'metadata' | 'read_at'>>,
): SharedTake[] {
  const byRecording = new Map<string, (typeof notifications)[number]>();
  for (const n of notifications) if (n.recording_id && !byRecording.has(n.recording_id)) byRecording.set(n.recording_id, n);

  const out: SharedTake[] = [];
  for (const share of shares) {
    const rec = share.user_recordings;
    if (!rec) continue;
    const note = byRecording.get(share.recording_id);
    const songTitle = rec.song_versions?.compositions?.title ?? note?.metadata?.song_title ?? rec.recording_name;
    out.push({
      recordingId: share.recording_id,
      compositionId: rec.song_versions?.composition_id ?? note?.composition_id ?? null,
      songTitle,
      takeName: rec.recording_name,
      sharedBy: sharedByName(owners.get(rec.user_id)),
      sharedAt: share.created_at,
      unread: !!note && !note.read_at,
    });
  }
  return out;
}

/** Unread "shared a take with you" notifications (the count shown in words in the account menu). */
export function unreadSharedCount(notifications: ReadonlyArray<AppNotification> | undefined): number {
  return (notifications ?? []).filter((n) => n.type === 'recording_shared' && !n.read_at).length;
}

/** True when the signed-in user has an unread notification about this song. */
export function songHasUnread(notifications: ReadonlyArray<AppNotification>, compositionId: string): boolean {
  return notifications.some((n) => n.composition_id === compositionId && !n.read_at);
}

/** Cache update: every unread notification of this song gets `read_at`; others stay as they are. */
export function markSongNotificationsReadInCache(
  notifications: ReadonlyArray<AppNotification>,
  compositionId: string,
  now: string,
): AppNotification[] {
  return notifications.map((n) => (n.composition_id === compositionId && !n.read_at ? { ...n, read_at: now } : n));
}
