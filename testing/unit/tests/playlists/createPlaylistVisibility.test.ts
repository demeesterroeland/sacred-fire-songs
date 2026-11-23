// Story 6.1.32 / G8.3 (#416): createPlaylist stores the chosen visibility; private stays the default (L2).
import { beforeEach, describe, expect, it, vi } from 'vitest';

const insert = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
    from: () => ({
      insert: (row: unknown) => {
        insert(row);
        return { select: () => ({ maybeSingle: async () => ({ data: { id: 'pl-1' }, error: null }) }) };
      },
    }),
  }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { createPlaylist } from '@/app/actions/playlistActions';

beforeEach(() => insert.mockClear());

describe('createPlaylist visibility', () => {
  it('is private when no visibility is given (Add to playlist sheet)', async () => {
    expect(await createPlaylist('Water')).toEqual({ id: 'pl-1' });
    expect(insert).toHaveBeenCalledWith({ owner_id: 'u1', title: 'Water', is_public: false });
  });

  it('is public only when asked for', async () => {
    await createPlaylist('Water', true);
    expect(insert).toHaveBeenCalledWith({ owner_id: 'u1', title: 'Water', is_public: true });
  });

  it('treats anything but true as private', async () => {
    await createPlaylist('Water', 'yes' as unknown as boolean);
    expect(insert).toHaveBeenCalledWith({ owner_id: 'u1', title: 'Water', is_public: false });
  });
});

import { NEW_PLAYLIST_IS_PUBLIC, canCreatePlaylist, toIsPublic, visibilityExplainKey } from '@/lib/playlists/visibility';

describe('visibility model', () => {
  it('defaults to private', () => expect(NEW_PLAYLIST_IS_PUBLIC).toBe(false));
  it('only true is public', () => {
    expect(toIsPublic(true)).toBe(true);
    for (const v of [false, undefined, null, 'true', 1]) expect(toIsPublic(v)).toBe(false);
  });
  it('picks the explanation per state', () => {
    expect(visibilityExplainKey(false)).toBe('playlists.add.privateExplain');
    expect(visibilityExplainKey(true)).toBe('playlists.add.publicExplain');
  });
  it('Create needs a name and no pending request', () => {
    expect(canCreatePlaylist('', false)).toBe(false);
    expect(canCreatePlaylist('  ', false)).toBe(false);
    expect(canCreatePlaylist('Fire', false)).toBe(true);
    expect(canCreatePlaylist('Fire', true)).toBe(false);
  });
});
