// @vitest-environment jsdom
// Review of PR #482: the PDF export moved from the playlist header into a hook shared with the row menus.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const toast = vi.hoisted(() => ({ error: vi.fn(), info: vi.fn(), loading: vi.fn(() => 'toast-1'), success: vi.fn() }));
const server = vi.hoisted(() => ({ getPlaylistSongsForExport: vi.fn() }));
const pdf = vi.hoisted(() => ({ exportPlaylistToPdf: vi.fn(), downloadPdf: vi.fn() }));
const cache = vi.hoisted(() => ({ getOrCreatePdf: vi.fn() }));

vi.mock('sonner', () => ({ toast }));
vi.mock('@/app/actions/playlistActions', () => server);
vi.mock('@/lib/export/pdfExport', () => pdf);
vi.mock('@/lib/export/pdfCache', () => ({
  browserPdfStore: () => ({}),
  exportFingerprint: async () => 'fp',
  pdfCacheKey: (u: string, p: string) => `${u}:${p}`,
  getOrCreatePdf: cache.getOrCreatePdf,
}));
vi.mock('@/lib/errors/actionError', () => ({ actionErrorMessage: () => 'reason' }));
vi.mock('@/context/LocaleContext', () => ({ useLocale: () => ({ t: (k: string) => k, locale: 'en' }) }));

import { PDF_EXPORT_MAX_SONGS, usePlaylistPdfExport } from '@/hooks/usePlaylistPdfExport';

const song = { id: 's1', title: 'Song' };
const run = async (opts: Partial<Parameters<typeof usePlaylistPdfExport>[0]> = {}) => {
  const { result } = renderHook(() => usePlaylistPdfExport({ playlistId: 'p1', title: 'List', ...opts }));
  await act(() => result.current.exportPdf());
  return result;
};

beforeEach(() => {
  vi.clearAllMocks();
  cache.getOrCreatePdf.mockResolvedValue({ blob: new Blob(['%PDF']) });
});
afterEach(() => vi.clearAllMocks());

describe('usePlaylistPdfExport', () => {
  it('asks a guest to sign in and never calls the server', async () => {
    const onNeedLogin = vi.fn();
    await run({ isLoggedIn: false, onNeedLogin });
    expect(onNeedLogin).toHaveBeenCalledOnce();
    expect(server.getPlaylistSongsForExport).not.toHaveBeenCalled();
  });

  it('with a known count of 0 says the playlist is empty without a server call (playlist page)', async () => {
    await run({ songCount: 0 });
    expect(toast.info).toHaveBeenCalledWith('playlists.export.empty');
    expect(server.getPlaylistSongsForExport).not.toHaveBeenCalled();
  });

  it('without a count (row menu) lets the server decide', async () => {
    server.getPlaylistSongsForExport.mockResolvedValue({ songs: [song], title: 'List', userId: 'u1' });
    await run();
    expect(server.getPlaylistSongsForExport).toHaveBeenCalledWith('p1');
    expect(pdf.downloadPdf).toHaveBeenCalledOnce();
    expect(toast.success).toHaveBeenCalledWith('playlists.export.downloaded', { id: 'toast-1' });
  });

  it('refuses more than the maximum, before and after the server call', async () => {
    await run({ songCount: PDF_EXPORT_MAX_SONGS + 1 });
    expect(server.getPlaylistSongsForExport).not.toHaveBeenCalled();
    server.getPlaylistSongsForExport.mockResolvedValue({ songs: Array(PDF_EXPORT_MAX_SONGS + 1).fill(song), userId: 'u1' });
    await run();
    expect(toast.error).toHaveBeenLastCalledWith('playlists.export.limitExceeded', { id: 'toast-1' });
    expect(pdf.downloadPdf).not.toHaveBeenCalled();
  });

  it('shows the server error and downloads nothing', async () => {
    server.getPlaylistSongsForExport.mockResolvedValue({ error: 'forbidden' });
    await run();
    expect(toast.error).toHaveBeenCalledWith('playlists.export.failed', { id: 'toast-1', description: 'reason' });
    expect(pdf.downloadPdf).not.toHaveBeenCalled();
  });

  it('reuses the cache per user and playlist', async () => {
    server.getPlaylistSongsForExport.mockResolvedValue({ songs: [song], userId: 'u1' });
    await run();
    expect(cache.getOrCreatePdf).toHaveBeenCalledWith(expect.objectContaining({ key: 'u1:p1', fingerprint: 'fp' }));
  });
});
