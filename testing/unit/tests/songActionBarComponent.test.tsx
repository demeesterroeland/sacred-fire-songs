// @vitest-environment jsdom
// Story 6.1.9 / G2.4 (#393): the sticky Practice · Playlist · ♥ bar renders and calls back (L3, English copy).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SongActionBar } from '@/components/song/SongActionBar';
import { DICTIONARIES } from '@/lib/i18n';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string) => (DICTIONARIES.en as Record<string, string>)[k] ?? k,
  }),
}));

afterEach(cleanup);

function setup(over: Partial<React.ComponentProps<typeof SongActionBar>> = {}) {
  const props = {
    isFavorite: false,
    onPractice: vi.fn(),
    onToggleFavorite: vi.fn(),
    onGuestPlaylist: vi.fn(),
    ...over,
  };
  render(<SongActionBar {...props} />);
  return props;
}

describe('SongActionBar', () => {
  it('shows Practice, Playlist and the heart with text labels', () => {
    setup();
    const bar = screen.getByTestId('song-action-bar');
    expect(bar.getAttribute('role')).toBe('toolbar');
    expect(screen.getByTestId('song-action-practice').textContent).toContain('Practice');
    expect(screen.getByTestId('song-action-playlist').textContent).toContain('Playlist');
    expect(screen.getByTestId('song-action-favorite').textContent).toContain('Favorite');
  });

  it('Practice calls onPractice (members and guests alike)', () => {
    const p = setup();
    fireEvent.click(screen.getByTestId('song-action-practice'));
    expect(p.onPractice).toHaveBeenCalledTimes(1);
  });

  it('the heart calls onToggleFavorite and reflects the state in words and aria', () => {
    const p = setup({ isFavorite: true });
    const heart = screen.getByTestId('song-action-favorite');
    expect(heart.textContent).toContain('In Favorites');
    expect(heart.getAttribute('aria-pressed')).toBe('true');
    expect(heart.getAttribute('aria-label')).toBeNull(); // the visible word is the name (WCAG 2.5.3)
    fireEvent.click(heart);
    expect(p.onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('a guest tapping Playlist goes to the gate callback', () => {
    const p = setup();
    fireEvent.click(screen.getByTestId('song-action-playlist'));
    expect(p.onGuestPlaylist).toHaveBeenCalledTimes(1);
  });

  it('a member gets the picker in the Playlist slot instead of the guest button', () => {
    const p = setup({ playlistSlot: <button data-testid="picker">picker</button> });
    expect(screen.getByTestId('picker')).toBeTruthy();
    expect(screen.queryByTestId('song-action-playlist')).toBeNull();
    expect(p.onGuestPlaylist).not.toHaveBeenCalled();
  });

  it('shows one dot on Practice when there is media or a take, and says so (#586)', () => {
    setup({ practiceAvailable: true });
    const practice = screen.getByTestId('song-action-practice');
    expect(screen.getByTestId('song-action-practice-dot')).toBeTruthy();
    expect(practice.getAttribute('aria-label')).toBe('Practice: media or recordings available');
    expect(practice.textContent).not.toMatch(/\d/); // no count: the drawer tabs say where
  });

  it('shows no dot when nothing is available (#586)', () => {
    setup({ practiceAvailable: false });
    expect(screen.queryByTestId('song-action-practice-dot')).toBeNull();
    expect(screen.getByTestId('song-action-practice').getAttribute('aria-label')).toBeNull();
  });

  it('hidden bar is out of the tab order and the accessibility tree', () => {
    setup({ visible: false });
    const bar = screen.getByTestId('song-action-bar');
    expect(bar.getAttribute('data-visible')).toBe('false');
    expect(bar.className).toContain('invisible');
  });

  it('is a phone-only bar (desktop keeps the header actions)', () => {
    setup();
    expect(screen.getByTestId('song-action-bar').className).toContain('lg:hidden');
  });

  it('uses 44 px targets and no palette colours', () => {
    setup();
    const bar = screen.getByTestId('song-action-bar');
    for (const id of ['song-action-practice', 'song-action-playlist', 'song-action-favorite']) {
      expect(screen.getByTestId(id).className).toContain('min-h-tap');
    }
    expect(bar.innerHTML).not.toMatch(/\b(gray|red|amber|indigo)-\d{2,3}\b|\[#/);
  });
});
