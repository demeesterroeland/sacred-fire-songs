// @vitest-environment jsdom
// Story 6.1.30 / G8.1 (#414): Add to playlist is a bottom sheet, "New playlist" first, check marks (L3).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlaylistPicker } from '@/components/playlists/PlaylistPicker';

const messages: Record<string, string> = {
  'playlists.picker.addToPlaylist': 'Add to playlist',
  'playlists.picker.newPlaylist': 'New playlist',
  'playlists.picker.newPlaylistName': 'Playlist name',
  'playlists.picker.create': 'Create',
  'playlists.picker.newPrivateHint': 'New playlists are private: only you can see them unless you make them public.',
  'playlists.picker.done': 'Done',
  'playlists.picker.empty': 'No playlists yet',
  'playlists.picker.added': 'Added to {playlist}',
  'playlists.picker.removed': 'Removed from {playlist}',
  'playlists.picker.addedToNew': 'Added to new playlist "{name}"',
  'playlists.openPlaylist': 'Open playlist',
};
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, v?: Record<string, string>) =>
      (messages[k] ?? k).replace(/\{(\w+)\}/g, (_, n) => v?.[n] ?? ''),
  }),
}));

const fetchUserPlaylists = vi.fn();
const fetchContainingPlaylists = vi.fn();
vi.mock('@/lib/playlists/pickerQueries', () => ({
  fetchUserPlaylists: (...a: unknown[]) => fetchUserPlaylists(...a),
  fetchContainingPlaylists: (...a: unknown[]) => fetchContainingPlaylists(...a),
}));

const addSongToPlaylist = vi.fn();
const createPlaylist = vi.fn();
vi.mock('@/app/actions/playlistActions', () => ({
  addSongToPlaylist: (...a: unknown[]) => addSongToPlaylist(...a),
  createPlaylist: (...a: unknown[]) => createPlaylist(...a),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function renderPicker(onOpenChange?: (open: boolean) => void) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <PlaylistPicker compositionId="song-1" userId="u1" onOpenChange={onOpenChange} />
    </QueryClientProvider>,
  );
}

async function openSheet() {
  fireEvent.click(screen.getByRole('button', { name: 'Add to playlist' }));
  return screen.findByRole('dialog');
}

beforeEach(() => {
  fetchUserPlaylists.mockResolvedValue([
    { id: 'p-water', title: 'Water Ceremony' },
    { id: 'p-fire', title: 'Fire Circle' },
  ]);
  fetchContainingPlaylists.mockResolvedValue(new Set(['p-water']));
  addSongToPlaylist.mockResolvedValue({ added: true });
  createPlaylist.mockResolvedValue({ id: 'p-new' });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PlaylistPicker sheet', () => {
  it('opens a bottom sheet with "New playlist" as the first row', async () => {
    renderPicker();
    const dialog = await openSheet();
    expect(within(dialog).getByRole('heading', { name: 'Add to playlist' })).toBeTruthy();
    await screen.findByRole('checkbox', { name: 'Water Ceremony' });
    const rows = within(dialog).getAllByTestId('picker-row');
    expect(rows[0].textContent).toContain('New playlist');
    expect(rows.slice(1).map((r) => r.textContent)).toEqual(['Water Ceremony', 'Fire Circle']);
  });

  it('shows a check only next to playlists that already hold the song', async () => {
    renderPicker();
    await openSheet();
    const water = await screen.findByRole('checkbox', { name: 'Water Ceremony' });
    const fire = screen.getByRole('checkbox', { name: 'Fire Circle' });
    expect(water.getAttribute('aria-checked')).toBe('true');
    expect(fire.getAttribute('aria-checked')).toBe('false');
  });

  it('tapping a playlist toggles the song and its check', async () => {
    addSongToPlaylist.mockResolvedValueOnce({ added: false }).mockResolvedValueOnce({ added: true });
    renderPicker();
    await openSheet();
    const water = await screen.findByRole('checkbox', { name: 'Water Ceremony' });
    fireEvent.click(water);
    await waitFor(() => expect(addSongToPlaylist).toHaveBeenCalledWith('p-water', 'song-1'));
    await waitFor(() => expect(water.getAttribute('aria-checked')).toBe('false'));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Fire Circle' }));
    await waitFor(() => expect(addSongToPlaylist).toHaveBeenCalledWith('p-fire', 'song-1'));
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Fire Circle' }).getAttribute('aria-checked')).toBe('true'));
  });

  it('the check follows what the server did, not the optimistic guess', async () => {
    // The cache thought the song was not in Fire Circle, but the server removed it (it was there).
    addSongToPlaylist.mockResolvedValueOnce({ added: false });
    renderPicker();
    await openSheet();
    const fire = await screen.findByRole('checkbox', { name: 'Fire Circle' });
    fireEvent.click(fire);
    await waitFor(() => expect(addSongToPlaylist).toHaveBeenCalledWith('p-fire', 'song-1'));
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Fire Circle' }).getAttribute('aria-checked')).toBe('false'));
  });

  it('"New playlist" asks for a name, creates the playlist and adds the song', async () => {
    renderPicker();
    await openSheet();
    await screen.findByRole('checkbox', { name: 'Water Ceremony' });
    fireEvent.click(screen.getByRole('button', { name: 'New playlist' }));
    const input = screen.getByRole('textbox', { name: 'Playlist name' });
    fireEvent.change(input, { target: { value: '  Sunrise  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(createPlaylist).toHaveBeenCalledWith('Sunrise'));
    await waitFor(() => expect(addSongToPlaylist).toHaveBeenCalledWith('p-new', 'song-1'));
  });

  it('G8.3: naming a new playlist says it is private (same wording rule as the New Playlist page)', async () => {
    renderPicker();
    await openSheet();
    await screen.findByRole('checkbox', { name: 'Water Ceremony' });
    expect(screen.queryByText(messages['playlists.picker.newPrivateHint'])).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'New playlist' }));
    expect(screen.getByText(messages['playlists.picker.newPrivateHint'])).toBeTruthy();
  });

  it('keeps Create disabled until a name is typed', async () => {
    renderPicker();
    await openSheet();
    fireEvent.click(await screen.findByRole('button', { name: 'New playlist' }));
    expect((screen.getByRole('button', { name: 'Create' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('rows are at least 44 px tall (min-h-tap)', async () => {
    renderPicker();
    await openSheet();
    await screen.findByRole('checkbox', { name: 'Water Ceremony' });
    for (const row of screen.getAllByTestId('picker-row')) {
      expect(row.className).toContain('min-h-tap');
    }
  });

  it('reports open and close so a parent menu can follow', async () => {
    const onOpenChange = vi.fn();
    renderPicker(onOpenChange);
    await openSheet();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(false));
  });
});
