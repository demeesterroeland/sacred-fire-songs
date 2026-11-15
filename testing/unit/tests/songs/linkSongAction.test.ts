// Story 6.2.9 / G1.4 (#512): the server actions around fn_link_song_as_version (L2, Supabase mocked).
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();
const mockRpc = vi.fn();
const mockRole = vi.fn();
const mockSearch = vi.fn();
const revalidatePath = vi.fn();

vi.mock('next/cache', () => ({ revalidatePath: (...args: unknown[]) => revalidatePath(...args) }));

function chain(result: () => unknown) {
  const c: Record<string, unknown> = {};
  for (const name of ['select', 'eq', 'neq', 'ilike', 'order', 'limit']) c[name] = vi.fn(() => c);
  c.maybeSingle = vi.fn(() => Promise.resolve(result()));
  c.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(result()).then(resolve, reject);
  return c;
}

const searchChain = chain(() => mockSearch());

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    rpc: mockRpc,
    from: (table: string) => (table === 'profiles' ? chain(() => mockRole()) : searchChain),
  }),
}));

import { linkSongAsVersion, previewSongLink, searchSongsToLinkTo } from '@/app/actions/linkSong';

const SOURCE = '550e8400-e29b-41d4-a716-446655440001';
const TARGET = '550e8400-e29b-41d4-a716-446655440002';
const summary = { source_id: SOURCE, target_id: TARGET, source_title: 'B', target_title: 'A', versions: 1 };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
  mockRole.mockReturnValue({ data: { role: 'gatekeeper' }, error: null });
});

describe('previewSongLink / linkSongAsVersion', () => {
  it('refuses ids that are not uuids before calling the database', async () => {
    expect(await previewSongLink('nope', TARGET)).toEqual({ error: 'invalid' });
    expect(await linkSongAsVersion(SOURCE, 'nope')).toEqual({ error: 'invalid' });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('refuses a link to the same song before calling the database', async () => {
    expect(await linkSongAsVersion(SOURCE, SOURCE)).toEqual({ error: 'self' });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('asks a signed-out visitor to sign in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    expect(await linkSongAsVersion(SOURCE, TARGET)).toEqual({ error: 'forbidden' });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('previews through fn_preview_song_link without revalidating', async () => {
    mockRpc.mockResolvedValue({ data: summary, error: null });
    const result = await previewSongLink(SOURCE, TARGET);
    expect(mockRpc).toHaveBeenCalledWith('fn_preview_song_link', { p_source: SOURCE, p_target: TARGET });
    expect(result).toMatchObject({ summary: { target_id: TARGET, versions: 1 } });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('links through fn_link_song_as_version and revalidates both songs', async () => {
    mockRpc.mockResolvedValue({ data: summary, error: null });
    const result = await linkSongAsVersion(SOURCE, TARGET);
    expect(mockRpc).toHaveBeenCalledWith('fn_link_song_as_version', { p_source: SOURCE, p_target: TARGET });
    expect(result).toMatchObject({ summary: { target_id: TARGET } });
    expect(revalidatePath).toHaveBeenCalledWith(`/songs/${TARGET}`);
    expect(revalidatePath).toHaveBeenCalledWith(`/songs/${SOURCE}`);
  });

  it('maps a database refusal to a reason, never the raw message', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'Only gatekeepers and admins can link songs' } });
    expect(await linkSongAsVersion(SOURCE, TARGET)).toEqual({ error: 'forbidden' });
    mockRpc.mockResolvedValue({ data: null, error: { code: '22023', message: 'This song is already linked to another song' } });
    expect(await linkSongAsVersion(SOURCE, TARGET)).toEqual({ error: 'alreadyLinked' });
    mockRpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'Gatekeepers can only link songs they own' } });
    expect(await linkSongAsVersion(SOURCE, TARGET)).toEqual({ error: 'notOwner' });
    mockRpc.mockResolvedValue({ data: null, error: { code: '22023', message: 'Both songs must be public, or both private' } });
    expect(await previewSongLink(SOURCE, TARGET)).toEqual({ error: 'visibility' });
  });
});

describe('searchSongsToLinkTo', () => {
  it('is for gatekeepers and admins only', async () => {
    mockRole.mockReturnValue({ data: { role: 'member' }, error: null });
    expect(await searchSongsToLinkTo('weyo', SOURCE)).toEqual({ error: 'forbidden' });
  });

  it('needs two characters and returns the matches without the song itself', async () => {
    expect(await searchSongsToLinkTo(' w ', SOURCE)).toEqual({ songs: [] });
    mockSearch.mockReturnValue({ data: [{ id: TARGET, title: 'Weyo wey yanna', original_author: null }], error: null });
    const result = await searchSongsToLinkTo('weyo', SOURCE);
    expect(result).toEqual({ songs: [{ id: TARGET, title: 'Weyo wey yanna', original_author: null }] });
    expect(searchChain.neq).toHaveBeenCalledWith('id', SOURCE);
    expect(searchChain.ilike).toHaveBeenCalledWith('title', '%weyo%');
  });

  it("lists only the gatekeeper's own songs (gatekeepers link only songs they own)", async () => {
    mockSearch.mockReturnValue({ data: [], error: null });
    await searchSongsToLinkTo('weyo', SOURCE);
    expect(searchChain.eq).toHaveBeenCalledWith('owner_id', 'u1');
  });

  it('lists every song for an admin', async () => {
    mockRole.mockReturnValue({ data: { role: 'admin' }, error: null });
    mockSearch.mockReturnValue({ data: [], error: null });
    await searchSongsToLinkTo('weyo', SOURCE);
    expect(searchChain.eq).not.toHaveBeenCalledWith('owner_id', expect.anything());
  });

  it('escapes the wildcards of the search text', async () => {
    mockSearch.mockReturnValue({ data: [], error: null });
    await searchSongsToLinkTo('50%_off\\', SOURCE);
    expect(searchChain.ilike).toHaveBeenCalledWith('title', '%50\\%\\_off\\\\%');
  });
});
