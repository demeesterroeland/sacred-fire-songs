// @vitest-environment jsdom
// Story 6.1.32 / G8.3 (#416): New Playlist explains private vs public in one line, with a visibility switch (L3).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CreatePlaylistForm } from '@/components/playlists/CreatePlaylistForm';

const messages: Record<string, string> = {
  'playlists.add.namePlaceholder': 'Playlist name…',
  'playlists.add.submit': 'Create Playlist',
  'playlists.add.creating': 'Creating…',
  'playlists.add.nameRequired': 'Please enter a playlist name',
  'playlists.add.created': 'Playlist created',
  'playlists.add.visibilityLabel': 'Make public',
  'playlists.add.privateExplain': 'Private: only you can see this playlist unless you make it public.',
  'playlists.add.publicExplain': 'Public: anyone can find and open this playlist, with or without an account.',
  'playlists.detail.back': 'Back',
};
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({ t: (k: string) => messages[k] ?? k }),
}));

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const createPlaylist = vi.fn();
vi.mock('@/app/actions/playlistActions', () => ({
  createPlaylist: (...a: unknown[]) => createPlaylist(...a),
}));

beforeEach(() => {
  createPlaylist.mockResolvedValue({ id: 'new-1' });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const nameInput = () => screen.getByPlaceholderText('Playlist name…');

describe('CreatePlaylistForm visibility (G8.3)', () => {
  it('states the playlist is private unless made public, with the switch off', () => {
    render(<CreatePlaylistForm />);
    expect(screen.getByText(messages['playlists.add.privateExplain'])).toBeTruthy();
    const sw = screen.getByRole('switch', { name: 'Make public' });
    expect(sw.getAttribute('aria-checked')).toBe('false');
  });

  it('switching on changes the one-line explanation to public', () => {
    render(<CreatePlaylistForm />);
    fireEvent.click(screen.getByRole('switch', { name: 'Make public' }));
    expect(screen.getByText(messages['playlists.add.publicExplain'])).toBeTruthy();
    expect(screen.queryByText(messages['playlists.add.privateExplain'])).toBeNull();
  });

  it('keeps Create disabled until a name is typed, then enables it', () => {
    render(<CreatePlaylistForm />);
    const create = screen.getByRole('button', { name: 'Create Playlist' }) as HTMLButtonElement;
    expect(create.disabled).toBe(true);
    fireEvent.change(nameInput(), { target: { value: 'Fire Circle' } });
    expect(create.disabled).toBe(false);
  });

  it('creates a private playlist by default', async () => {
    render(<CreatePlaylistForm />);
    fireEvent.change(nameInput(), { target: { value: ' Fire Circle ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Playlist' }));
    await waitFor(() => expect(createPlaylist).toHaveBeenCalledWith('Fire Circle', false));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/library/playlists/new-1'));
  });

  it('creates a public playlist when the switch is on', async () => {
    render(<CreatePlaylistForm />);
    fireEvent.change(nameInput(), { target: { value: 'Fire Circle' } });
    fireEvent.click(screen.getByRole('switch', { name: 'Make public' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create Playlist' }));
    await waitFor(() => expect(createPlaylist).toHaveBeenCalledWith('Fire Circle', true));
  });

  it('uses token classes only (no palette colours)', () => {
    const { container } = render(<CreatePlaylistForm />);
    expect(container.innerHTML).not.toMatch(/\b(?:bg|text|border|shadow)-(?:red|amber|gray|slate)-\d{2,3}/);
    expect(container.querySelector('button.bg-accent')).not.toBeNull();
  });

  it('pressing Enter twice quickly creates only one playlist', async () => {
    let resolve: (v: { id: string }) => void = () => {};
    createPlaylist.mockImplementation(() => new Promise((r) => { resolve = r; }));
    render(<CreatePlaylistForm />);
    fireEvent.change(nameInput(), { target: { value: 'Fire Circle' } });
    fireEvent.keyDown(nameInput(), { key: 'Enter' });
    fireEvent.keyDown(nameInput(), { key: 'Enter' });
    resolve({ id: 'new-1' });
    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(createPlaylist).toHaveBeenCalledTimes(1);
  });
});
