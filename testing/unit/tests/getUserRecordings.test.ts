import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserRecordings } from '@/lib/actions/rehearsal';

// Story 6.1.21 / G4.8 (#405): the list behind the Listen tab selects only what its rows show.

const getUser = vi.fn();
const from = vi.fn();
const profileSelect = vi.fn();

vi.mock('@/lib/actions/notifications', () => ({ sendRecordingShareEmail: vi.fn() }));
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser },
    from,
    storage: { from: () => ({ createSignedUrl: async () => ({ data: { signedUrl: 'https://audio.test/x' }, error: null }) }) },
  }),
}));

const take = {
  id: 'r1',
  user_id: 'owner',
  song_version_id: 'v1',
  recording_name: 'Take',
  storage_path: 'owner/v1/r1.wav',
  is_public: true,
  singer_profile_id: 'p1',
  created_at: '2026-11-06T10:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  getUser.mockResolvedValue({ data: { user: null } });
  const rows = {
    select: () => {
      const chain: Record<string, unknown> = {};
      chain.eq = () => chain;
      chain.order = () => chain;
      chain.then = (resolve: (v: unknown) => unknown) => resolve({ data: [take], error: null });
      return chain;
    },
  };
  const profiles = {
    select: (columns: string) => {
      profileSelect(columns);
      return { in: async () => ({ data: [{ id: 'p1', email: 'singer@example.com', full_name: 'Nina', role: 'musician' }] }) };
    },
  };
  from.mockImplementation((table: string) => (table === 'profiles' ? profiles : rows));
});

describe('getUserRecordings', () => {
  it('selects only the singer columns a row uses (no avatar)', async () => {
    await getUserRecordings('v1');
    expect(profileSelect).toHaveBeenCalledTimes(1);
    const columns = String(profileSelect.mock.calls[0][0]).split(',').map((c) => c.trim());
    expect(columns).toEqual(['id', 'email', 'full_name', 'role']);
  });

  it('still tells the row who the singer is and whether they are a musician', async () => {
    const [row] = await getUserRecordings('v1');
    expect(row.singer_profile).toMatchObject({ id: 'p1', full_name: 'Nina', role: 'musician', is_musician: true });
  });
});
