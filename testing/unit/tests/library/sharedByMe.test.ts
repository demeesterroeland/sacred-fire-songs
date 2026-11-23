// Story 6.1.36 (#488): "Shared by me" lists my takes that I shared, one row per take with the
// names of the members it is shared with (never an e-mail address).
import { describe, expect, it } from 'vitest';
import { buildSharedByMe, type SharedByMeRow } from '@/lib/library/sharedByMe';

const take = (id: string, title: string | null, name = `Take ${id}`) => ({
  id,
  user_id: 'me',
  recording_name: name,
  song_versions: title ? { composition_id: `c-${id}`, compositions: { title } } : null,
});

describe('buildSharedByMe', () => {
  it('groups the shares per take, keeps the newest-first order and names the members', () => {
    const rows: SharedByMeRow[] = [
      { recording_id: 'r2', shared_with_user_id: 'u1', created_at: '2026-11-10', user_recordings: take('r2', 'Agua') },
      { recording_id: 'r1', shared_with_user_id: 'u2', created_at: '2026-11-09', user_recordings: take('r1', 'Fuego') },
      { recording_id: 'r2', shared_with_user_id: 'u3', created_at: '2026-11-08', user_recordings: take('r2', 'Agua') },
    ];
    const names = new Map<string, string | null>([['u1', 'Nina'], ['u2', 'Ana'], ['u3', null]]);
    expect(buildSharedByMe(rows, names)).toEqual([
      { recordingId: 'r2', compositionId: 'c-r2', songTitle: 'Agua', takeName: 'Take r2', sharedWith: ['Nina', null], sharedAt: '2026-11-10' },
      { recordingId: 'r1', compositionId: 'c-r1', songTitle: 'Fuego', takeName: 'Take r1', sharedWith: ['Ana'], sharedAt: '2026-11-09' },
    ]);
  });

  it('drops a share whose take is gone and names a take without a readable song by the take', () => {
    const rows: SharedByMeRow[] = [
      { recording_id: 'gone', shared_with_user_id: 'u1', created_at: '2026-11-10', user_recordings: null },
      { recording_id: 'r3', shared_with_user_id: 'u1', created_at: '2026-11-09', user_recordings: take('r3', null, 'Evening') },
    ];
    expect(buildSharedByMe(rows, new Map())).toEqual([
      { recordingId: 'r3', compositionId: null, songTitle: 'Evening', takeName: 'Evening', sharedWith: [null], sharedAt: '2026-11-09' },
    ]);
  });
});
