import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createFakeSupabase,
  type FakeSupabase,
  type FakeSupabaseState,
} from '../../support/fakeSupabase';
import {
  fetchAdminAccess,
  fetchAdminUserDetails,
  fetchAdminUsersList,
} from '@/lib/admin/userQueries';

// The serverQueries wrappers resolve the client via createClient(); point it at the fake.
let current: FakeSupabase;
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => current.client),
}));

import { checkAdminAccess, getAdminUserDetails, getAdminUsersList } from '@/lib/admin/serverQueries';

const ADMIN = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const EXPERT = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
const MEMBER = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
const GATEKEEPER = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';

function seededState(overrides: Partial<FakeSupabaseState> = {}): FakeSupabaseState {
  return {
    authUser: { id: ADMIN, email: 'admin@test.com' },
    tables: {
      profiles: [
        { id: ADMIN, email: 'admin@test.com', role: 'admin', full_name: 'Ada Admin', avatar_url: null, created_at: '2026-01-01T00:00:00Z', last_seen_at: '2026-10-29T00:00:00Z' },
        { id: EXPERT, email: 'expert@test.com', role: 'expert', full_name: 'Eve Expert', avatar_url: 'https://example.com/a.jpg', created_at: '2026-03-01T00:00:00Z', last_seen_at: '2026-08-01T00:00:00Z' },
        { id: MEMBER, email: 'member@test.com', role: 'member', full_name: null, avatar_url: null, created_at: '2026-05-01T00:00:00Z', last_seen_at: null },
        { id: GATEKEEPER, email: 'gk@test.com', role: 'gatekeeper', full_name: 'Gus', avatar_url: null, created_at: '2026-02-01T00:00:00Z', last_seen_at: null },
      ],
      compositions: [
        { id: 'song-1', title: 'Medicine Song', original_author: 'Curandero', owner_id: EXPERT, is_public: true, created_at: '2026-03-02T00:00:00Z' },
        { id: 'song-2', title: 'Private Chant', original_author: null, owner_id: EXPERT, is_public: false, created_at: '2026-03-03T00:00:00Z' },
        { id: 'song-3', title: 'Admin Song', original_author: 'Trad.', owner_id: ADMIN, is_public: true, created_at: '2026-01-02T00:00:00Z' },
        { id: 'song-4', title: 'Orphan', original_author: null, owner_id: null, is_public: true, created_at: '2026-01-03T00:00:00Z' },
      ],
      song_versions: [
        { id: 'v-1', composition_id: 'song-1', version_name: 'Guitar Tab', contributor_id: EXPERT, created_at: '2026-03-04T00:00:00Z' },
        { id: 'v-2', composition_id: 'song-3', version_name: null, contributor_id: EXPERT, created_at: '2026-03-05T00:00:00Z' },
        { id: 'v-3', composition_id: 'song-3', version_name: 'Original', contributor_id: ADMIN, created_at: '2026-01-02T00:00:00Z' },
        { id: 'v-4', composition_id: 'gone', version_name: 'Dangling', contributor_id: EXPERT, created_at: '2026-03-06T00:00:00Z' },
      ],
      setlists: [
        { id: 'pl-1', owner_id: EXPERT, title: 'Night Ceremony', is_public: true, created_at: '2026-03-07T00:00:00Z' },
        { id: 'pl-2', owner_id: EXPERT, title: 'Practice', is_public: false, created_at: '2026-03-08T00:00:00Z' },
        { id: 'pl-3', owner_id: MEMBER, title: 'My Healing Practice', is_public: false, created_at: '2026-05-02T00:00:00Z' },
      ],
    },
    ...overrides,
  };
}

function profile(id: string) {
  return seededState().tables.profiles!.find((p) => p.id === id)!;
}

let errorSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  current = createFakeSupabase(seededState());
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  errorSpy.mockRestore();
});

describe('fetchAdminAccess', () => {
  it('denies access without a session user', async () => {
    const fake = createFakeSupabase(seededState({ authUser: null }));
    const result = await fetchAdminAccess(fake.client);
    expect(result).toEqual({ authorized: false, user: null, profile: null });
  });

  it('denies access when the auth lookup errors', async () => {
    const fake = createFakeSupabase(seededState({ authError: { message: 'JWT expired' } }));
    const result = await fetchAdminAccess(fake.client);
    expect(result.authorized).toBe(false);
    expect(result.user).toBeNull();
  });

  it.each([
    ['member', MEMBER],
    ['gatekeeper', GATEKEEPER],
    ['expert', EXPERT],
  ])('denies access to a %s', async (role, id) => {
    const fake = createFakeSupabase(seededState({ authUser: { id } }));
    const result = await fetchAdminAccess(fake.client);
    expect(result.authorized).toBe(false);
    expect(result.user).toEqual({ id });
    expect(result.profile?.role).toBe(role);
  });

  it('denies access when the session user has no profile row', async () => {
    const fake = createFakeSupabase(seededState({ authUser: { id: 'no-profile' } }));
    const result = await fetchAdminAccess(fake.client);
    expect(result.authorized).toBe(false);
    expect(result.profile).toBeNull();
  });

  it('grants access to an admin', async () => {
    const result = await fetchAdminAccess(current.client);
    expect(result.authorized).toBe(true);
    expect(result.profile?.role).toBe('admin');
  });
});

describe('fetchAdminUsersList', () => {
  it('returns null for a non-admin caller', async () => {
    const fake = createFakeSupabase(seededState({ authUser: { id: MEMBER } }));
    expect(await fetchAdminUsersList(fake.client)).toBeNull();
  });

  it('lists every registered user, most recently joined first', async () => {
    const users = await fetchAdminUsersList(current.client);
    expect(users?.map((u) => u.id)).toEqual([MEMBER, EXPERT, GATEKEEPER, ADMIN]);
  });

  it('returns the profile summary fields for each user', async () => {
    const users = await fetchAdminUsersList(current.client);
    const expert = users!.find((u) => u.id === EXPERT)!;
    const p = profile(EXPERT);
    expect(expert).toMatchObject({
      email: p.email,
      role: 'expert',
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      created_at: p.created_at,
      last_seen_at: p.last_seen_at,
    });
  });

  it('aggregates songs, versions, playlists and public playlists per user', async () => {
    const users = await fetchAdminUsersList(current.client);
    const byId = Object.fromEntries(users!.map((u) => [u.id, u]));
    expect(byId[EXPERT]).toMatchObject({ songs_count: 2, versions_count: 3, playlists_count: 2, public_playlists_count: 1 });
    expect(byId[ADMIN]).toMatchObject({ songs_count: 1, versions_count: 1, playlists_count: 0, public_playlists_count: 0 });
    expect(byId[MEMBER]).toMatchObject({ songs_count: 0, versions_count: 0, playlists_count: 1, public_playlists_count: 0 });
    expect(byId[GATEKEEPER]).toMatchObject({ songs_count: 0, versions_count: 0, playlists_count: 0, public_playlists_count: 0 });
  });

  it('only selects columns that exist in the schema', async () => {
    const users = await fetchAdminUsersList(current.client);
    expect(users).toHaveLength(4);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('returns an empty list and logs when the profiles query fails', async () => {
    const fake = createFakeSupabase(seededState());
    // Fail profiles only after the admin check has passed.
    const original = fake.client.from;
    let calls = 0;
    fake.client.from = (table: string) => {
      if (table === 'profiles' && ++calls > 1) return original('missing_table');
      return original(table);
    };
    expect(await fetchAdminUsersList(fake.client)).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('still lists users with zero counts when a contribution query fails', async () => {
    const fake = createFakeSupabase(seededState({ failingTables: ['song_versions'] }));
    const users = await fetchAdminUsersList(fake.client);
    expect(users).toHaveLength(4);
    expect(users!.every((u) => u.versions_count === 0)).toBe(true);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('returns an empty list when there are no profiles', async () => {
    // Admin is authorised via a profile, so empty the table after the access check.
    const state = seededState();
    const fake = createFakeSupabase(state);
    const original = fake.client.from;
    let calls = 0;
    fake.client.from = (table: string) => {
      if (table === 'profiles' && ++calls === 2) state.tables.profiles = [];
      return original(table);
    };
    expect(await fetchAdminUsersList(fake.client)).toEqual([]);
  });
});

describe('fetchAdminUserDetails', () => {
  it('returns null for a non-admin caller', async () => {
    const fake = createFakeSupabase(seededState({ authUser: { id: GATEKEEPER } }));
    expect(await fetchAdminUserDetails(fake.client, EXPERT)).toBeNull();
  });

  it('returns null for an unknown user id', async () => {
    expect(await fetchAdminUserDetails(current.client, 'does-not-exist')).toBeNull();
  });

  it('returns the profile details of the selected user', async () => {
    const details = await fetchAdminUserDetails(current.client, EXPERT);
    expect(details).toMatchObject({
      id: EXPERT,
      email: 'expert@test.com',
      role: 'expert',
      full_name: 'Eve Expert',
      created_at: '2026-03-01T00:00:00Z',
      last_seen_at: '2026-08-01T00:00:00Z',
    });
  });

  it('lists created songs newest first, with the original author as artist', async () => {
    const details = await fetchAdminUserDetails(current.client, EXPERT);
    expect(details!.contributions.songs).toEqual([
      { id: 'song-2', title: 'Private Chant', artist: null, created_at: '2026-03-03T00:00:00Z' },
      { id: 'song-1', title: 'Medicine Song', artist: 'Curandero', created_at: '2026-03-02T00:00:00Z' },
    ]);
  });

  it('lists submitted versions with their song id, song title and version name', async () => {
    const details = await fetchAdminUserDetails(current.client, EXPERT);
    expect(details!.contributions.versions).toEqual([
      { id: 'v-4', song_id: 'gone', song_title: 'Untitled Song', name: 'Dangling', created_at: '2026-03-06T00:00:00Z' },
      { id: 'v-2', song_id: 'song-3', song_title: 'Admin Song', name: null, created_at: '2026-03-05T00:00:00Z' },
      { id: 'v-1', song_id: 'song-1', song_title: 'Medicine Song', name: 'Guitar Tab', created_at: '2026-03-04T00:00:00Z' },
    ]);
  });

  it('lists playlists with their visibility', async () => {
    const details = await fetchAdminUserDetails(current.client, EXPERT);
    expect(details!.contributions.playlists).toEqual([
      { id: 'pl-2', title: 'Practice', is_public: false, created_at: '2026-03-08T00:00:00Z' },
      { id: 'pl-1', title: 'Night Ceremony', is_public: true, created_at: '2026-03-07T00:00:00Z' },
    ]);
  });

  it('returns empty contribution lists for a user without contributions', async () => {
    const details = await fetchAdminUserDetails(current.client, GATEKEEPER);
    expect(details!.contributions).toEqual({ songs: [], versions: [], playlists: [] });
  });

  it('only selects columns that exist in the schema', async () => {
    await fetchAdminUserDetails(current.client, EXPERT);
    expect(errorSpy).not.toHaveBeenCalled();
    const tables = current.selects.map((s) => s.table);
    expect(tables).toEqual(expect.arrayContaining(['compositions', 'song_versions', 'setlists']));
  });

  it('logs and returns an empty list when a contribution query fails', async () => {
    const fake = createFakeSupabase(seededState({ failingTables: ['setlists'] }));
    const details = await fetchAdminUserDetails(fake.client, EXPERT);
    expect(details!.contributions.playlists).toEqual([]);
    expect(details!.contributions.songs).toHaveLength(2);
    expect(errorSpy).toHaveBeenCalled();
  });
});

describe('serverQueries wrappers', () => {
  it('checkAdminAccess uses the server client', async () => {
    expect((await checkAdminAccess()).authorized).toBe(true);
    current = createFakeSupabase(seededState({ authUser: { id: MEMBER } }));
    expect((await checkAdminAccess()).authorized).toBe(false);
  });

  it('getAdminUsersList and getAdminUserDetails use the server client', async () => {
    expect(await getAdminUsersList()).toHaveLength(4);
    expect((await getAdminUserDetails(EXPERT))?.email).toBe('expert@test.com');
    current = createFakeSupabase(seededState({ authUser: { id: MEMBER } }));
    expect(await getAdminUsersList()).toBeNull();
    expect(await getAdminUserDetails(EXPERT)).toBeNull();
  });
});
