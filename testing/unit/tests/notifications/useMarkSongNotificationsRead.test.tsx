// @vitest-environment jsdom
// Story 6.1.19 / G4.6 (#403): opening the Practice drawer marks the song's notifications read.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { AppNotification } from '@/lib/notifications/queries';

const markSongNotificationsRead = vi.fn();
vi.mock('@/lib/notifications/queries', async (orig) => ({
  ...(await orig<typeof import('@/lib/notifications/queries')>()),
  markSongNotificationsRead: (...a: unknown[]) => markSongNotificationsRead(...a),
}));

import { useMarkSongNotificationsRead } from '@/hooks/useMarkSongNotificationsRead';

const note = (over: Partial<AppNotification> = {}): AppNotification => ({
  id: 'n1',
  type: 'recording_shared',
  composition_id: 'song-1',
  recording_id: 'rec-1',
  metadata: {},
  read_at: null,
  created_at: '2026-11-05T10:00:00Z',
  ...over,
});

let client: QueryClient;
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client }, children);

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  markSongNotificationsRead.mockReset().mockResolvedValue(undefined);
});
afterEach(cleanup);

describe('useMarkSongNotificationsRead', () => {
  it('marks the song read and drops the unread count in the bell cache', async () => {
    client.setQueryData(['notifications', 'me'], [note(), note({ id: 'n2', composition_id: 'song-2' })]);
    renderHook(() => useMarkSongNotificationsRead({ userId: 'me', compositionId: 'song-1', isOpen: true }), { wrapper });
    await waitFor(() => expect(markSongNotificationsRead).toHaveBeenCalledWith('song-1'));
    const cached = client.getQueryData<AppNotification[]>(['notifications', 'me'])!;
    expect(cached[0].read_at).not.toBeNull();
    expect(cached[1].read_at).toBeNull();
  });

  it('does nothing while the drawer is closed', () => {
    client.setQueryData(['notifications', 'me'], [note()]);
    renderHook(() => useMarkSongNotificationsRead({ userId: 'me', compositionId: 'song-1', isOpen: false }), { wrapper });
    expect(markSongNotificationsRead).not.toHaveBeenCalled();
  });

  it('does nothing for a guest or when the song has no unread notification', () => {
    renderHook(() => useMarkSongNotificationsRead({ userId: null, compositionId: 'song-1', isOpen: true }), { wrapper });
    client.setQueryData(['notifications', 'me'], [note({ read_at: 'x' })]);
    renderHook(() => useMarkSongNotificationsRead({ userId: 'me', compositionId: 'song-1', isOpen: true }), { wrapper });
    expect(markSongNotificationsRead).not.toHaveBeenCalled();
  });

  it('asks the server when the bell has not loaded yet', async () => {
    renderHook(() => useMarkSongNotificationsRead({ userId: 'me', compositionId: 'song-1', isOpen: true }), { wrapper });
    await waitFor(() => expect(markSongNotificationsRead).toHaveBeenCalledWith('song-1'));
  });

  it('refetches the bell when marking fails', async () => {
    markSongNotificationsRead.mockRejectedValue(new Error('boom'));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    client.setQueryData(['notifications', 'me'], [note()]);
    const spy = vi.spyOn(client, 'invalidateQueries');
    renderHook(() => useMarkSongNotificationsRead({ userId: 'me', compositionId: 'song-1', isOpen: true }), { wrapper });
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ queryKey: ['notifications', 'me'] }));
  });

  it('marks once per opening, not on every re-render', async () => {
    client.setQueryData(['notifications', 'me'], [note()]);
    const { rerender } = renderHook(
      (p: { isOpen: boolean }) => useMarkSongNotificationsRead({ userId: 'me', compositionId: 'song-1', isOpen: p.isOpen }),
      { wrapper, initialProps: { isOpen: true } },
    );
    await waitFor(() => expect(markSongNotificationsRead).toHaveBeenCalledTimes(1));
    rerender({ isOpen: true });
    expect(markSongNotificationsRead).toHaveBeenCalledTimes(1);
  });
});
