// @vitest-environment jsdom
// Validation 1 (fix 6): feedback the hooks give (toasts, errors) and the Settings intro come from the
// message files, in every language; no English left in code.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';

const { toggleFavorite, toast, supabaseDelete } = vi.hoisted(() => ({
  toggleFavorite: vi.fn(),
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), info: vi.fn() }),
  supabaseDelete: vi.fn(),
}));
const { renamePlaylist } = vi.hoisted(() => ({ renamePlaylist: vi.fn() }));
vi.mock('@/app/actions/toggleFavorite', () => ({ toggleFavorite }));
vi.mock('@/app/actions/playlistActions', () => ({ renamePlaylist }));
vi.mock('sonner', () => ({ toast }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: () => ({ delete: () => ({ eq: supabaseDelete }) }) }),
}));
// Dutch, so a hard-coded English string cannot pass by accident.
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string) => `nl:${(DICTIONARIES.nl as Record<string, string>)[k] ?? k}`,
  }),
}));

import { useToggleFavorite } from '@/hooks/useToggleFavorite';
import { useDeleteSong } from '@/hooks/useDeleteSong';
import { usePlaylistRename } from '@/hooks/usePlaylistRename';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);
const NEW_KEYS = [
  'favorites.toast.added',
  'favorites.toast.removed',
  'favorites.toast.view',
  'song.delete.failed',
  'playlists.rename.success',
  'settings.pageIntro',
] as const;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('useToggleFavorite toasts', () => {
  it.each([
    [true, 'favorites.toast.added'],
    [false, 'favorites.toast.removed'],
  ])('isFavorite=%s: the toast and its action are translated', async (isFavorite, key) => {
    toggleFavorite.mockResolvedValue({ isFavorite });
    const { result } = renderHook(() => useToggleFavorite('s1', !isFavorite), { wrapper });
    await act(async () => {
      await result.current.handleToggle();
    });
    const [message, options] = toast.success.mock.calls[0];
    expect(message).toBe(`nl:${(DICTIONARIES.nl as Record<string, string>)[key]}`);
    expect(options.action.label).toBe(`nl:${(DICTIONARIES.nl as Record<string, string>)['favorites.toast.view']}`);
    expect(`${message} ${options.action.label}`).not.toMatch(/Liked Songs/);
  });
});

describe('useDeleteSong failure', () => {
  it('shows a translated toast, not a browser alert with the database message', async () => {
    const alert = vi.fn();
    vi.stubGlobal('alert', alert);
    supabaseDelete.mockResolvedValue({ error: { message: 'violates foreign key' } });
    const { result } = renderHook(() => useDeleteSong(), { wrapper });
    let ok = true;
    await act(async () => {
      ok = await result.current.deleteSong('s1');
    });
    expect(ok).toBe(false);
    expect(alert).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(`nl:${(DICTIONARIES.nl as Record<string, string>)['song.delete.failed']}`);
    expect(result.current.isDeleting).toBe(false);
  });
});

describe('usePlaylistRename failure (validation 1 review, M4)', () => {
  it.each([
    ['Playlist not found', 'errors.playlistNotFound'],
    ['duplicate key value violates unique constraint "setlists_pkey"', 'errors.generic'],
  ])('a server answer of "%s" is shown in the person\'s language (%s), never as sent', async (serverError, key) => {
    renamePlaylist.mockResolvedValue({ error: serverError });
    const { result } = renderHook(() => usePlaylistRename('p1', 'Old'));
    act(() => result.current.setDraftTitle('New'));
    await act(async () => {
      result.current.handleRenameSave();
    });
    await vi.waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith(`nl:${(DICTIONARIES.nl as Record<string, string>)[key]}`);
    expect(toast.error).not.toHaveBeenCalledWith(serverError);
  });
});

describe('favourites toasts use the menu\'s word (review L7)', () => {
  // The menu says "Your Favorites"; the toasts used to say "Liked Songs" (and the same split in five languages).
  const stem: Record<string, string> = { en: 'Favorites', nl: 'favorieten', es: 'favoritas', it: 'preferiti', ru: 'избран', fr: 'favoris', pt: 'favoritas' };
  it.each(Object.entries(stem))('%s names them like the user menu does', (locale, word) => {
    const dict = DICTIONARIES[locale as keyof typeof DICTIONARIES] as Record<string, string>;
    expect(dict['userMenu.favorites'].toLowerCase()).toContain(word.toLowerCase());
    for (const key of ['favorites.toast.added', 'favorites.toast.removed', 'favorites.toast.view']) {
      expect(dict[key].toLowerCase(), `${locale}: ${key}`).toContain(word.toLowerCase());
    }
  });
});

describe('no English left in code', () => {
  const read = (f: string) => fs.readFileSync(path.resolve(__dirname, '../../../..', f), 'utf8');
  it('hooks do not call alert() or toast with a string literal', () => {
    const dir = path.resolve(__dirname, '../../../../hooks');
    for (const f of fs.readdirSync(dir).filter((n) => /\.tsx?$/.test(n))) {
      const src = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      expect(src, f).not.toMatch(/(^|[^\w.])alert\(/);
      expect(src, f).not.toMatch(/toast(\.\w+)?\(\s*['"`]/);
    }
  });
  it('the Settings intro is translated', () => {
    expect(read('components/account/settings/AccountSettings.tsx')).not.toContain('Manage your profile');
  });
  it.each(SUPPORTED_LOCALES)('%s has all the new keys', (locale) => {
    const dict = DICTIONARIES[locale] as Record<string, string>;
    for (const key of NEW_KEYS) expect(dict[key], `${locale}: ${key}`).toBeTruthy();
  });
});
