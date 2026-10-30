import { describe, it, expect } from 'vitest';
import {
  ACTIVE_WINDOW_DAYS,
  countBy,
  filterAndSortUsers,
  getActivityStatus,
  getRoleLabel,
  getTotalContributions,
  isAdminRole,
  isMusicianRole,
  summarizeUsers,
} from '@/lib/admin/userOverview';
import type { AdminUserSummary } from '@/lib/admin/types';

const NOW = new Date('2026-10-30T12:00:00Z');

function user(overrides: Partial<AdminUserSummary>): AdminUserSummary {
  return {
    id: 'u',
    email: 'u@test.com',
    role: 'member',
    full_name: null,
    avatar_url: null,
    created_at: '2026-01-01T00:00:00Z',
    last_seen_at: null,
    songs_count: 0,
    versions_count: 0,
    playlists_count: 0,
    public_playlists_count: 0,
    ...overrides,
  };
}

const USERS: AdminUserSummary[] = [
  user({
    id: 'admin',
    email: 'admin@test.com',
    role: 'admin',
    full_name: 'Ada Admin',
    created_at: '2026-01-01T00:00:00Z',
    songs_count: 1,
  }),
  user({
    id: 'expert',
    email: 'expert@test.com',
    role: 'expert',
    full_name: 'Eve Expert',
    created_at: '2026-03-01T00:00:00Z',
    songs_count: 5,
    versions_count: 4,
    playlists_count: 2,
    public_playlists_count: 1,
  }),
  user({
    id: 'member',
    email: 'zed@test.com',
    role: 'member',
    full_name: null,
    created_at: '2026-05-01T00:00:00Z',
    playlists_count: 1,
  }),
  user({
    id: 'gatekeeper',
    email: 'gk@test.com',
    role: 'gatekeeper',
    full_name: 'Gus Gatekeeper',
    created_at: '2026-02-01T00:00:00Z',
    songs_count: 2,
  }),
  user({
    id: 'musician',
    email: 'mo@test.com',
    role: 'musician',
    full_name: 'Mo Musician',
    created_at: '2026-04-01T00:00:00Z',
  }),
];

describe('getActivityStatus', () => {
  it('is "never" when the user has never been seen', () => {
    expect(getActivityStatus(null, NOW)).toBe('never');
  });

  it(`is "active" when last seen within ${ACTIVE_WINDOW_DAYS} days`, () => {
    expect(getActivityStatus('2026-10-29T12:00:00Z', NOW)).toBe('active');
    expect(getActivityStatus('2026-09-30T12:00:00Z', NOW)).toBe('active');
  });

  it(`is "inactive" when last seen more than ${ACTIVE_WINDOW_DAYS} days ago`, () => {
    expect(getActivityStatus('2026-09-30T11:59:59Z', NOW)).toBe('inactive');
    expect(getActivityStatus('2025-01-01T00:00:00Z', NOW)).toBe('inactive');
  });

  it('treats an unparsable timestamp as never seen', () => {
    expect(getActivityStatus('not-a-date', NOW)).toBe('never');
  });
});

describe('role helpers', () => {
  it('only treats the admin role as admin', () => {
    expect(isAdminRole('admin')).toBe(true);
    for (const role of ['member', 'gatekeeper', 'expert', 'musician', null, undefined]) {
      expect(isAdminRole(role as never)).toBe(false);
    }
  });

  it('treats musician and expert as musicians', () => {
    expect(isMusicianRole('musician')).toBe(true);
    expect(isMusicianRole('expert')).toBe(true);
    expect(isMusicianRole('member')).toBe(false);
    expect(isMusicianRole('admin')).toBe(false);
  });

  it('labels every role in the user_role enum', () => {
    expect(getRoleLabel('admin')).toBe('Admin');
    expect(getRoleLabel('gatekeeper')).toBe('Gatekeeper');
    expect(getRoleLabel('expert')).toBe('Expert');
    expect(getRoleLabel('musician')).toBe('Musician');
    expect(getRoleLabel('member')).toBe('Member');
  });
});

describe('countBy', () => {
  it('counts rows per non-null key', () => {
    const counts = countBy(
      [{ owner_id: 'a' }, { owner_id: 'b' }, { owner_id: 'a' }, { owner_id: null }],
      'owner_id'
    );
    expect(counts.get('a')).toBe(2);
    expect(counts.get('b')).toBe(1);
    expect(counts.size).toBe(2);
  });

  it('only counts rows matching the optional predicate', () => {
    const counts = countBy(
      [
        { owner_id: 'a', is_public: true },
        { owner_id: 'a', is_public: false },
      ],
      'owner_id',
      (row) => row.is_public === true
    );
    expect(counts.get('a')).toBe(1);
  });

  it('returns an empty map for no rows', () => {
    expect(countBy([], 'owner_id').size).toBe(0);
    expect(countBy(null, 'owner_id').size).toBe(0);
  });
});

describe('getTotalContributions', () => {
  it('sums songs, versions and playlists', () => {
    expect(getTotalContributions(USERS[1])).toBe(11);
    expect(getTotalContributions(USERS[4])).toBe(0);
  });
});

describe('filterAndSortUsers', () => {
  const ids = (list: AdminUserSummary[]) => list.map((u) => u.id);

  it('returns every user, most recently joined first, by default', () => {
    expect(ids(filterAndSortUsers(USERS, {}))).toEqual([
      'member',
      'musician',
      'expert',
      'gatekeeper',
      'admin',
    ]);
  });

  it('does not mutate the input array', () => {
    const copy = [...USERS];
    filterAndSortUsers(USERS, { sortBy: 'name' });
    expect(USERS).toEqual(copy);
  });

  it('searches name and email case-insensitively, ignoring surrounding whitespace', () => {
    expect(ids(filterAndSortUsers(USERS, { query: '  EVE ' }))).toEqual(['expert']);
    expect(ids(filterAndSortUsers(USERS, { query: 'zed@' }))).toEqual(['member']);
  });

  it('returns an empty list when nothing matches the search', () => {
    expect(filterAndSortUsers(USERS, { query: 'nobody-here' })).toEqual([]);
  });

  it('filters by exact role', () => {
    expect(ids(filterAndSortUsers(USERS, { role: 'gatekeeper' }))).toEqual(['gatekeeper']);
    expect(ids(filterAndSortUsers(USERS, { role: 'member' }))).toEqual(['member']);
  });

  it('the musician filter includes expert musicians', () => {
    expect(ids(filterAndSortUsers(USERS, { role: 'musician', sortBy: 'name' }))).toEqual([
      'expert',
      'musician',
    ]);
  });

  it('combines search and role filter', () => {
    expect(filterAndSortUsers(USERS, { query: 'gus', role: 'member' })).toEqual([]);
    expect(ids(filterAndSortUsers(USERS, { query: 'gus', role: 'gatekeeper' }))).toEqual(['gatekeeper']);
  });

  it('sorts top contributors first, ties by most recently joined', () => {
    expect(ids(filterAndSortUsers(USERS, { sortBy: 'contributions' }))).toEqual([
      'expert',
      'gatekeeper',
      'member',
      'admin',
      'musician',
    ]);
  });

  it('sorts by display name A-Z, falling back to email', () => {
    expect(ids(filterAndSortUsers(USERS, { sortBy: 'name' }))).toEqual([
      'admin',
      'expert',
      'gatekeeper',
      'musician',
      'member',
    ]);
  });
});

describe('summarizeUsers', () => {
  it('aggregates platform totals', () => {
    const withActivity = [
      { ...USERS[0], last_seen_at: '2026-10-29T00:00:00Z' },
      ...USERS.slice(1),
    ];
    expect(summarizeUsers(withActivity, NOW)).toEqual({
      totalUsers: 5,
      totalSongs: 8,
      totalPlaylists: 3,
      privilegedUsers: 2,
      activeUsers: 1,
    });
  });

  it('is all zeros for an empty list', () => {
    expect(summarizeUsers([], NOW)).toEqual({
      totalUsers: 0,
      totalSongs: 0,
      totalPlaylists: 0,
      privilegedUsers: 0,
      activeUsers: 0,
    });
  });
});
