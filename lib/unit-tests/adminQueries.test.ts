import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAdminAccess, getAdminUsersList, getAdminUserDetails } from '../admin/serverQueries';

// Mock Supabase server client
const mockGetUser = vi.fn();
const mockMaybeSingle = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();

const mockFrom = vi.fn((table: string) => {
  return {
    select: mockSelect,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

describe('admin serverQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAdminAccess', () => {
    it('returns unauthorized when no session user exists', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await checkAdminAccess();
      expect(result.authorized).toBe(false);
      expect(result.user).toBeNull();
    });

    it('returns unauthorized when user role is member', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-member-1', email: 'member@test.com' } },
        error: null,
      });

      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'user-member-1', role: 'member' },
            error: null,
          }),
        }),
      });

      const result = await checkAdminAccess();
      expect(result.authorized).toBe(false);
      expect(result.profile?.role).toBe('member');
    });

    it('returns authorized when user role is admin', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-admin-1', email: 'admin@test.com' } },
        error: null,
      });

      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'user-admin-1', role: 'admin' },
            error: null,
          }),
        }),
      });

      const result = await checkAdminAccess();
      expect(result.authorized).toBe(true);
      expect(result.profile?.role).toBe('admin');
    });
  });

  describe('getAdminUsersList', () => {
    it('returns null when user is not admin', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const users = await getAdminUsersList();
      expect(users).toBeNull();
    });

    it('returns aggregated users list when user is admin', async () => {
      // Mock admin auth
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'admin@test.com' } },
        error: null,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn((fields: string) => {
              if (fields === '*') {
                return {
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: 'admin-1', role: 'admin' },
                      error: null,
                    }),
                  }),
                };
              }
              // All profiles
              return {
                order: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'user-1',
                      email: 'user1@test.com',
                      role: 'member',
                      full_name: 'User One',
                      avatar_url: null,
                      created_at: '2026-01-01T00:00:00Z',
                      last_seen_at: '2026-01-02T00:00:00Z',
                    },
                  ],
                  error: null,
                }),
              };
            }),
          } as any;
        }

        if (table === 'compositions') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [{ owner_id: 'user-1' }, { owner_id: 'user-1' }],
              error: null,
            }),
          } as any;
        }

        if (table === 'song_versions') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [{ contributor_id: 'user-1' }],
              error: null,
            }),
          } as any;
        }

        if (table === 'setlists') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [{ owner_id: 'user-1' }, { owner_id: 'user-1' }, { owner_id: 'user-1' }],
              error: null,
            }),
          } as any;
        }

        return { select: vi.fn() } as any;
      });

      const users = await getAdminUsersList();
      expect(users).not.toBeNull();
      expect(users).toHaveLength(1);
      expect(users![0].id).toBe('user-1');
      expect(users![0].songs_count).toBe(2);
      expect(users![0].versions_count).toBe(1);
      expect(users![0].playlists_count).toBe(3);
    });
  });

  describe('getAdminUserDetails', () => {
    it('returns null when caller is not admin', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const details = await getAdminUserDetails('target-user');
      expect(details).toBeNull();
    });

    it('returns user details and lists contributions when caller is admin', async () => {
      // Mock admin auth
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'admin@test.com' } },
        error: null,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn((fields: string) => {
              if (fields === '*') {
                return {
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: 'admin-1', role: 'admin' },
                      error: null,
                    }),
                  }),
                };
              }
              // Target profile
              return {
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: {
                      id: 'user-target-1',
                      email: 'target@test.com',
                      role: 'gatekeeper',
                      full_name: 'Target User',
                      avatar_url: 'https://example.com/avatar.jpg',
                      created_at: '2026-02-01T00:00:00Z',
                      last_seen_at: '2026-02-05T00:00:00Z',
                    },
                    error: null,
                  }),
                }),
              };
            }),
          } as any;
        }

        if (table === 'compositions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'song-1',
                      title: 'Medicine Song',
                      artist: 'Curandero',
                      created_at: '2026-02-02T00:00:00Z',
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          } as any;
        }

        if (table === 'song_versions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'version-1',
                      song_id: 'song-1',
                      name: 'Guitar Tab',
                      created_at: '2026-02-03T00:00:00Z',
                      compositions: { title: 'Medicine Song' },
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          } as any;
        }

        if (table === 'setlists') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'playlist-1',
                      title: 'Night Ceremony',
                      is_public: true,
                      created_at: '2026-02-04T00:00:00Z',
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          } as any;
        }

        return { select: vi.fn() } as any;
      });

      const details = await getAdminUserDetails('user-target-1');
      expect(details).not.toBeNull();
      expect(details!.id).toBe('user-target-1');
      expect(details!.role).toBe('gatekeeper');
      expect(details!.contributions.songs).toHaveLength(1);
      expect(details!.contributions.songs[0].title).toBe('Medicine Song');
      expect(details!.contributions.versions).toHaveLength(1);
      expect(details!.contributions.versions[0].song_title).toBe('Medicine Song');
      expect(details!.contributions.playlists).toHaveLength(1);
      expect(details!.contributions.playlists[0].is_public).toBe(true);
    });
  });
});
