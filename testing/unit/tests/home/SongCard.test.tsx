// @vitest-environment jsdom
// Story 6.1.2 / G1.2 (#386): SongCard is a compact row (RTL component test, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import SongCard from '@/components/home/SongCard';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, v?: Record<string, string>) =>
      ({
        'song.traditional': 'Traditional',
        'song.visibility.private': 'Private',
        'songCard.addFavorite': 'Add to favorites',
        'songCard.removeFavorite': 'Remove from favorites',
        'songCard.view': `View ${v?.title}`,
        'song.meta.key': `Key ${v?.key}`,
      })[k] ?? k,
  }),
}));
vi.mock('@/hooks/useToggleFavorite', () => ({
  useToggleFavorite: () => ({ isFav: false, handleToggle: vi.fn(), signInGate: { open: false, onOpenChange: vi.fn(), next: '/' } }),
}));
vi.mock('@/components/playlists/PlaylistPicker', () => ({
  PlaylistPicker: () => <button type="button" aria-label="Add to playlist" />,
}));

afterEach(cleanup);

const categories = [
  { name: 'Spanish', slug: 'spanish', parent: 'Languages' },
  { name: 'Fire', slug: 'fire', parent: 'The Elements' },
  { name: 'Herbert Quinteros', slug: 'hq', parent: 'Artists' },
];

describe('SongCard row', () => {
  it('shows the title, one grey meta line and the key badge, no chips', () => {
    const { container } = render(
      <SongCard id="s1" title="Madre Tierra" author="Herbert Quinteros" songKey="Am" categories={categories} userId="u1" />
    );
    expect(screen.getByRole('heading', { name: 'Madre Tierra' })).toBeTruthy();
    const meta = screen.getByTestId('song-row-meta');
    expect(meta.textContent).toBe('Herbert Quinteros · Fire · Spanish');
    expect(meta.className).toContain('text-fg-muted');
    const key = screen.getByTestId('song-row-key');
    expect(key.querySelector('[aria-hidden]')?.textContent).toBe('Am');
    expect(key.querySelector('.sr-only')?.textContent).toBe('Key Am');
    expect(screen.getByRole('link', { name: 'View Madre Tierra' }).getAttribute('href')).toBe('/songs/s1');
    // No tag/author pill links inside the row any more.
    expect(container.querySelectorAll('a[href^="/songs?"]').length).toBe(0);
  });

  it('keeps heart and add-to-playlist as separate buttons with 44 px targets', () => {
    render(<SongCard id="s1" title="Madre Tierra" author="" userId="u1" />);
    const heart = screen.getByRole('button', { name: 'Add to favorites' });
    expect(heart.className).toContain('size-tap');
    expect(heart.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: 'Add to playlist' })).toBeTruthy();
    expect(screen.getByTestId('song-row-meta').textContent).toBe('Traditional');
  });

  it('marks a private song with a translated label and a lighter title (validation 4)', () => {
    render(<SongCard id="s1" title="Draft song" author="X" isPublic={false} />);
    expect(screen.getByText('Private')).toBeTruthy();
    expect(screen.getByText('Draft song').className).toContain('text-fg-subtle');
  });
});

// #492: deleting a song is not a row action; it lives in the song page's ⋮ menu only.
describe('SongCard has no delete button', () => {
  it('renders no delete button, even for the owner', () => {
    const props = { id: 's1', title: 'Madre Tierra', author: 'X', userId: 'u1', canDelete: true, onDelete: vi.fn() };
    render(<SongCard {...(props as never)} />);
    expect(screen.queryByRole('button', { name: /delete/i })).toBeNull();
  });

  it('the song list wires no delete flow into its rows', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync('app/songs/SongsPageContent.tsx', 'utf8');
    expect(src).not.toMatch(/onDelete=|canDelete=|useDeleteSong/);
    expect(readFileSync('components/home/SongCard.tsx', 'utf8')).not.toMatch(/Trash2|onDelete/);
  });
});

