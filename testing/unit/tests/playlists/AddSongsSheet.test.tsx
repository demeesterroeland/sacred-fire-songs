// @vitest-environment jsdom
// Story 6.2.22 / G5.5 (#542): the "+ Add Songs" sheet finds by alias, any author and songbook title, with the list's hint (L3).
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddSongsSheet } from '@/components/playlists/AddSongsSheet';
import type { Song } from '@/lib/songUtils';

const messages: Record<string, string> = {
  'playlists.addSongs.title': 'Add Songs to Playlist',
  'playlists.addSongs.search': 'Search songs…',
  'playlists.addSongs.empty': 'No songs found.',
  'playlists.addSongs.loadError': 'Could not load the songs.',
  'playlists.addSongs.added': 'Added "{title}"',
  'playlists.addSongs.removed': 'Removed "{title}"',
  'songs.matchAlias': 'Matched by alias: {text}',
  'songs.matchSourceTitle': 'Matched by songbook title: {text}',
  'songs.matchAuthor': 'Matched by author: {text}',
  'search.status.draft': 'Draft',
  'common.close': 'Close',
};
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, v?: Record<string, string>) => (messages[k] ?? k).replace(/\{(\w+)\}/g, (_, name) => v?.[name] ?? ''),
  }),
}));
const fetchAllSongs = vi.fn();
vi.mock('@/lib/songUtils', () => ({ fetchAllSongs: () => fetchAllSongs() }));
const addSongToPlaylist = vi.fn();
vi.mock('@/app/actions/playlistActions', () => ({ addSongToPlaylist: (...a: unknown[]) => addSongToPlaylist(...a) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const song = (over: Partial<Song>): Song =>
  ({ id: 'x', title: 'Untitled', author: '', authors: [], aliases: [], sourceTitles: [], songKey: null, color: 'red', isPublic: true, createdAt: '2026-01-01T00:00:00Z', categories: [], ...over }) as Song;

const SONGS = [
  song({ id: 'a', title: 'Madre Tierra', author: 'Herbert Quinteros', aliases: ['Pachamama'] }),
  song({ id: 'b', title: 'Huey Tonantzin', author: 'Anna Lee', authors: ['Anna Lee', 'Ben Cruz'] }),
  song({ id: 'c', title: 'Fire Song', sourceTitles: ['Canto al Fuego'], isPublic: false }),
  song({ id: 'd', title: 'Alpha Pachamama Song' }),
];

function renderSheet(existing: string[] = []) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <AddSongsSheet playlistId="p1" existingCompositionIds={existing} open onClose={() => {}} />
    </QueryClientProvider>,
  );
}
const type = (value: string) => fireEvent.change(screen.getByPlaceholderText('Search songs…'), { target: { value } });

beforeEach(() => {
  fetchAllSongs.mockResolvedValue(SONGS);
  addSongToPlaylist.mockResolvedValue({ added: true });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('AddSongsSheet search', () => {
  it('lists the songs by title before anything is typed', async () => {
    renderSheet();
    await screen.findByText('Madre Tierra');
    const titles = screen.getAllByRole('checkbox').map((b) => document.getElementById(b.getAttribute('aria-labelledby')!)?.textContent);
    expect(titles).toEqual(['Alpha Pachamama Song', 'Fire Song', 'Huey Tonantzin', 'Madre Tierra']);
    expect(screen.queryByTestId('add-song-match')).toBeNull();
  });

  it('finds "Madre Tierra" by its alias and says why: "Matched by alias: Pachamama"', async () => {
    renderSheet();
    await screen.findByText('Madre Tierra');
    type('pachamama');
    const row = await screen.findByRole('checkbox', { name: 'Madre Tierra' });
    const hint = screen.getByText('Matched by alias: Pachamama');
    expect(row.getAttribute('aria-describedby')).toBe(hint.id);
    expect(hint.id).not.toBe('');
  });

  it('ranks the title match before the alias match', async () => {
    renderSheet();
    await screen.findByText('Madre Tierra');
    type('pachamama');
    await waitFor(() => expect(screen.queryByText('Huey Tonantzin')).toBeNull());
    const rows = screen.getAllByRole('checkbox').map((b) => document.getElementById(b.getAttribute('aria-labelledby')!)?.textContent);
    expect(rows).toEqual(['Alpha Pachamama Song', 'Madre Tierra']);
    // the title match needs no hint
    expect(screen.getAllByTestId('add-song-match')).toHaveLength(1);
  });

  it('finds a song by an author it does not show, with the author hint', async () => {
    renderSheet();
    await screen.findByText('Huey Tonantzin');
    type('ben cruz');
    await screen.findByText('Matched by author: Ben Cruz');
    expect(screen.queryByText('Madre Tierra')).toBeNull();
  });

  it('finds a song by its title in a songbook, with the songbook hint', async () => {
    renderSheet();
    await screen.findByText('Fire Song');
    type('canto al');
    await screen.findByText('Matched by songbook title: Canto al Fuego');
  });

  it('keeps showing the check mark and the draft badge', async () => {
    renderSheet(['c']);
    await screen.findByText('Fire Song');
    expect(screen.getByText('Draft')).toBeTruthy();
    const row = screen.getByRole('checkbox', { name: 'Fire Song' });
    expect(row.getAttribute('aria-checked')).toBe('true');
    expect(row.querySelector('svg')).not.toBeNull();
    expect(screen.getByRole('checkbox', { name: 'Madre Tierra' }).getAttribute('aria-checked')).toBe('false');
  });

  it('adds the song with its id when a row is pressed', async () => {
    renderSheet();
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Madre Tierra' }));
    await waitFor(() => expect(addSongToPlaylist).toHaveBeenCalledWith('p1', 'a'));
  });

  it('says so when nothing matches', async () => {
    renderSheet();
    await screen.findByText('Madre Tierra');
    type('zzzz');
    expect(await screen.findByText('No songs found.')).toBeTruthy();
  });

  it('says so when the songs could not be loaded', async () => {
    fetchAllSongs.mockRejectedValue(new Error('boom'));
    renderSheet();
    expect(await screen.findByText('Could not load the songs.')).toBeTruthy();
  });
});

describe('AddSongsSheet source', () => {
  // No select of its own: the songs come from fetchAllSongs (fetchAllSongRows / SONGS_SELECT), the one embed of the sources.
  it('has no select of its own, so no second song_version_sources embed', () => {
    const source = readFileSync('components/playlists/AddSongsSheet.tsx', 'utf8');
    expect(source).not.toMatch(/\.from\(\s*['"]compositions['"]/);
    expect(source).not.toMatch(/song_version_sources|song_translations/);
    expect(source).toMatch(/fetchAllSongs/);
  });
});
