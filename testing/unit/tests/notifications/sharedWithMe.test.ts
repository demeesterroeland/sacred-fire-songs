// Story 6.1.19 / G4.6 (#403), UXD-3: "Shared with me" list + mark-as-read on Practice open.
import { describe, expect, it } from 'vitest';
import {
  buildSharedWithMe,
  markSongNotificationsReadInCache,
  songHasUnread,
  unreadSharedCount,
  type ShareRow,
} from '@/lib/notifications/sharedWithMe';
import type { AppNotification } from '@/lib/notifications/queries';

const note = (over: Partial<AppNotification>): AppNotification => ({
  id: 'n1',
  type: 'recording_shared',
  composition_id: 'song-1',
  recording_id: 'rec-1',
  metadata: {},
  read_at: null,
  created_at: '2026-11-05T10:00:00Z',
  ...over,
});

const share = (over: Partial<ShareRow> = {}): ShareRow => ({
  id: 's1',
  recording_id: 'rec-1',
  created_at: '2026-11-05T10:00:00Z',
  user_recordings: {
    id: 'rec-1',
    user_id: 'alice',
    recording_name: 'Alice verse',
    song_versions: { composition_id: 'song-1', compositions: { title: 'Danza del Cielo' } },
  },
  ...over,
});

describe('buildSharedWithMe', () => {
  it('lists the song title, the sharer, the take and the unread state', () => {
    const [row] = buildSharedWithMe(
      [share()],
      new Map([['alice', { full_name: 'Alice', email: 'alice@example.org' }]]),
      [note({})],
    );
    expect(row).toMatchObject({
      recordingId: 'rec-1',
      compositionId: 'song-1',
      songTitle: 'Danza del Cielo',
      takeName: 'Alice verse',
      sharedBy: 'Alice',
      unread: true,
    });
  });

  it('is read when the notification was read, or when there is none', () => {
    const owners = new Map([['alice', { full_name: 'Alice', email: null }]]);
    expect(buildSharedWithMe([share()], owners, [note({ read_at: '2026-11-05T11:00:00Z' })])[0].unread).toBe(false);
    expect(buildSharedWithMe([share()], owners, [])[0].unread).toBe(false);
  });

  it('never names the sharer by e-mail', () => {
    const [row] = buildSharedWithMe([share()], new Map([['alice', { full_name: null, email: 'alice@example.org' }]]), []);
    expect(row.sharedBy).toBeNull();
  });

  it('falls back to the notification snapshot when the song is not readable', () => {
    const hidden = share({ user_recordings: { ...share().user_recordings!, song_versions: null } });
    const [row] = buildSharedWithMe([hidden], new Map(), [
      note({ metadata: { song_title: 'Snapshot Song' }, composition_id: 'song-9' }),
    ]);
    expect(row.songTitle).toBe('Snapshot Song');
    expect(row.compositionId).toBe('song-9');
  });

  it('uses the take name as title when nothing names the song, and skips shares of vanished takes', () => {
    const hidden = share({ user_recordings: { ...share().user_recordings!, song_versions: null } });
    expect(buildSharedWithMe([hidden], new Map(), [])[0].songTitle).toBe('Alice verse');
    expect(buildSharedWithMe([share({ user_recordings: null })], new Map(), [])).toEqual([]);
  });

  it('keeps the share order (newest first from the query)', () => {
    const a = share({ id: 'a', recording_id: 'r-a', user_recordings: { ...share().user_recordings!, id: 'r-a' } });
    const b = share({ id: 'b', recording_id: 'r-b', user_recordings: { ...share().user_recordings!, id: 'r-b' } });
    expect(buildSharedWithMe([a, b], new Map(), []).map((r) => r.recordingId)).toEqual(['r-a', 'r-b']);
  });
});

describe('unread helpers', () => {
  it('counts unread shared-take notifications', () => {
    expect(unreadSharedCount([note({}), note({ id: 'n2', read_at: 'x' }), note({ id: 'n3' })])).toBe(2);
    expect(unreadSharedCount(undefined)).toBe(0);
  });

  it('knows whether a song still has unread notifications', () => {
    expect(songHasUnread([note({})], 'song-1')).toBe(true);
    expect(songHasUnread([note({})], 'song-2')).toBe(false);
    expect(songHasUnread([note({ read_at: 'x' })], 'song-1')).toBe(false);
  });

  it('cache update marks only that song as read', () => {
    const prev = [note({}), note({ id: 'n2', composition_id: 'song-2' }), note({ id: 'n3', read_at: 'old' })];
    const next = markSongNotificationsReadInCache(prev, 'song-1', '2026-11-05T12:00:00Z');
    expect(next[0].read_at).toBe('2026-11-05T12:00:00Z');
    expect(next[1].read_at).toBeNull();
    expect(next[2].read_at).toBe('old');
  });
});
