// Story 6.2.26 / G1.5 (#598): the server actions around the suggestion functions (L2, Supabase mocked).
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();
const mockRpc = vi.fn();
const revalidatePath = vi.fn();
vi.mock('next/cache', () => ({ revalidatePath: (...args: unknown[]) => revalidatePath(...args) }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser }, rpc: mockRpc }),
}));

import {
  acceptSuggestion,
  declineSuggestion,
  previewSuggestion,
  reopenSuggestion,
  suggestSongLink,
  withdrawSuggestion,
} from '@/app/actions/linkSuggestion';

const SOURCE = '550e8400-e29b-41d4-a716-446655440001';
const TARGET = '550e8400-e29b-41d4-a716-446655440002';
const ID = '550e8400-e29b-41d4-a716-446655440003';
const summary = { source_id: SOURCE, target_id: TARGET, source_title: 'B', target_title: 'A', versions: 1 };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
});

describe('suggestSongLink', () => {
  it('refuses bad input before calling the database', async () => {
    expect(await suggestSongLink('nope', TARGET, '')).toEqual({ ok: false, error: 'invalid' });
    expect(await suggestSongLink(SOURCE, SOURCE, '')).toEqual({ ok: false, error: 'self' });
    expect(await suggestSongLink(SOURCE, TARGET, 'x'.repeat(281))).toEqual({ ok: false, error: 'tooLong' });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('asks a signed-out visitor to sign in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    expect(await suggestSongLink(SOURCE, TARGET, '')).toEqual({ ok: false, error: 'signIn' });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('sends the trimmed note, an empty note as null', async () => {
    mockRpc.mockResolvedValue({ data: { id: ID }, error: null });
    expect(await suggestSongLink(SOURCE, TARGET, '  Same song  ')).toEqual({ ok: true, id: ID });
    expect(mockRpc).toHaveBeenLastCalledWith('fn_suggest_song_link', { p_source: SOURCE, p_target: TARGET, p_note: 'Same song' });
    await suggestSongLink(SOURCE, TARGET, '   ');
    expect(mockRpc).toHaveBeenLastCalledWith('fn_suggest_song_link', { p_source: SOURCE, p_target: TARGET, p_note: null });
  });

  it('maps a refusal to a reason, never the raw message', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '23505', message: 'This suggestion already exists' } });
    expect(await suggestSongLink(SOURCE, TARGET, '')).toEqual({ ok: false, error: 'duplicate' });
    mockRpc.mockResolvedValue({ data: null, error: { code: '22023', message: 'Too many open suggestions' } });
    expect(await suggestSongLink(SOURCE, TARGET, '')).toEqual({ ok: false, error: 'tooMany' });
  });
});

describe('decide actions', () => {
  it('previews without revalidating, accepts with revalidating both songs', async () => {
    mockRpc.mockResolvedValue({ data: summary, error: null });
    expect(await previewSuggestion(ID, true)).toMatchObject({ ok: true, summary: { target_id: TARGET } });
    expect(mockRpc).toHaveBeenLastCalledWith('fn_preview_song_link_suggestion', { p_id: ID, p_swap: true });
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(await acceptSuggestion(ID, false)).toMatchObject({ ok: true });
    expect(mockRpc).toHaveBeenLastCalledWith('fn_accept_song_link_suggestion', { p_id: ID, p_swap: false });
    expect(revalidatePath).toHaveBeenCalledWith(`/songs/${TARGET}`);
    expect(revalidatePath).toHaveBeenCalledWith('/suggestions');
  });

  it('declines with an optional reason, refuses a reason over 280 characters', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    expect(await declineSuggestion(ID, ' Different songs ')).toEqual({ ok: true });
    expect(mockRpc).toHaveBeenLastCalledWith('fn_decline_song_link_suggestion', { p_id: ID, p_reason: 'Different songs' });
    expect(await declineSuggestion(ID, 'x'.repeat(281))).toEqual({ ok: false, error: 'tooLong' });
  });

  it('withdraws and reopens through their functions', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    expect(await withdrawSuggestion(ID)).toEqual({ ok: true });
    expect(mockRpc).toHaveBeenLastCalledWith('fn_withdraw_song_link_suggestion', { p_id: ID });
    expect(await reopenSuggestion(ID)).toEqual({ ok: true });
    expect(mockRpc).toHaveBeenLastCalledWith('fn_reopen_song_link_suggestion', { p_id: ID });
  });

  it('turns a refusal of the database into a reason', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'Only gatekeepers and admins can review suggestions' } });
    expect(await acceptSuggestion(ID, false)).toEqual({ ok: false, error: 'notReviewer' });
    expect(await withdrawSuggestion('nope')).toEqual({ ok: false, error: 'invalid' });
  });
});
