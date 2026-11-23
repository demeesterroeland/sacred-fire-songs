// @vitest-environment jsdom
// #604: the inline "New playlist" field creates only on Enter or Create; blur and Escape cancel (L3).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CreatePlaylistInput } from '@/components/playlists/CreatePlaylistInput';

const messages: Record<string, string> = {
  'playlists.newButton': 'New playlist',
  'playlists.new.placeholder': 'Playlist name',
  'playlists.create': 'Create',
};
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({ t: (k: string) => messages[k] ?? k }),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
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

async function openAndType(name: string) {
  render(
    <div>
      <CreatePlaylistInput />
      <button type="button">Elsewhere</button>
    </div>
  );
  fireEvent.click(screen.getByRole('button', { name: 'New playlist' }));
  const input = screen.getByPlaceholderText('Playlist name') as HTMLInputElement;
  input.focus();
  fireEvent.change(input, { target: { value: name } });
  return input;
}

describe('CreatePlaylistInput (#604)', () => {
  it('clicking away does not create a playlist and closes the field', async () => {
    const input = await openAndType('Fire Circle');
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    await act(async () => {
      fireEvent.blur(input, { relatedTarget: elsewhere });
    });
    expect(createPlaylist).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText('Playlist name')).toBeNull();
    expect(screen.getByRole('button', { name: 'New playlist' })).toBeTruthy();
  });

  it('a blur with no new focus target (tap on empty page) does not create either', async () => {
    const input = await openAndType('Fire Circle');
    await act(async () => {
      fireEvent.blur(input);
    });
    expect(createPlaylist).not.toHaveBeenCalled();
  });

  it('Escape cancels without creating', async () => {
    const input = await openAndType('Fire Circle');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(createPlaylist).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText('Playlist name')).toBeNull();
  });

  it('Enter creates the playlist once', async () => {
    const input = await openAndType('Fire Circle');
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(createPlaylist).toHaveBeenCalledTimes(1));
    expect(createPlaylist).toHaveBeenCalledWith('Fire Circle');
  });

  it('the Create button creates the playlist even though the input loses focus first', async () => {
    const input = await openAndType('Fire Circle');
    const create = screen.getByRole('button', { name: 'Create' });
    // Pressing the button must keep focus in the field, so no blur cancels first.
    const down = fireEvent.mouseDown(create);
    expect(down).toBe(false); // default prevented
    // Keyboard users tab to the button: a blur towards Create keeps the field open.
    fireEvent.blur(input, { relatedTarget: create });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(createPlaylist).toHaveBeenCalledTimes(1));
    expect(createPlaylist).toHaveBeenCalledWith('Fire Circle');
  });

  it('Enter on an empty name creates nothing', async () => {
    const input = await openAndType('   ');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(createPlaylist).not.toHaveBeenCalled();
  });
});
