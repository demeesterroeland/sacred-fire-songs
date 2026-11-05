import { describe, it, expect } from 'vitest';
import { partitionTakes, sharedByName } from '@/lib/songs/partitionTakes';
import type { UserRecording } from '@/lib/actions/rehearsal';

// Story 6.1.15 / G4.2 (#399): "My takes" vs "Shared with me".
const take = (id: string, extra: Partial<UserRecording> = {}): UserRecording => ({
  id,
  user_id: 'u-1',
  song_version_id: 'v-1',
  recording_name: id,
  storage_path: `p/${id}`,
  created_at: '2026-11-05T10:00:00Z',
  ...extra,
});

describe('partitionTakes', () => {
  it('puts owned takes under mine and takes of others under shared, keeping order', () => {
    const list = [
      take('a', { is_owner: true }),
      take('b', { is_owner: false, is_shared: true }),
      take('c', { is_owner: true }),
      take('d', { is_owner: false, is_shared: true }),
    ];
    const { mine, shared } = partitionTakes(list);
    expect(mine.map((r) => r.id)).toEqual(['a', 'c']);
    expect(shared.map((r) => r.id)).toEqual(['b', 'd']);
  });

  it('never lists a take in both sections', () => {
    const list = [take('a', { is_owner: true }), take('b', { is_owner: false, is_shared: true })];
    const { mine, shared } = partitionTakes(list);
    const overlap = mine.filter((m) => shared.some((s) => s.id === m.id));
    expect(overlap).toEqual([]);
    expect(mine.length + shared.length).toBe(list.length);
  });

  it('treats a take without ownership info (just saved) as mine', () => {
    const { mine, shared } = partitionTakes([take('fresh')]);
    expect(mine.map((r) => r.id)).toEqual(['fresh']);
    expect(shared).toEqual([]);
  });

  it('returns two empty lists for no takes', () => {
    expect(partitionTakes([])).toEqual({ mine: [], shared: [], public: [] });
  });

  it('lists a public take of someone else under public, not under shared', () => {
    const { mine, shared, public: open } = partitionTakes([
      take('p', { is_owner: false, is_public: true, is_shared: false }),
      take('s', { is_owner: false, is_public: true, is_shared: true }),
    ]);
    expect(mine).toEqual([]);
    expect(shared.map((r) => r.id)).toEqual(['s']);
    expect(open.map((r) => r.id)).toEqual(['p']);
  });
});

describe('sharedByName', () => {
  it('uses the full name only, never the email', () => {
    expect(sharedByName({ full_name: 'Nina', email: 'n@x.org' })).toBe('Nina');
    expect(sharedByName({ full_name: '  ', email: 'n@x.org' })).toBeNull();
    expect(sharedByName({ full_name: null, email: '' })).toBeNull();
    expect(sharedByName(null)).toBeNull();
    expect(sharedByName(undefined)).toBeNull();
  });
});
