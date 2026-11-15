// @vitest-environment jsdom
// #600: a guest on /songs?favorites=true sees the GuestGate (with next= back to the page), not "Add Song".
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { DICTIONARIES } from '@/lib/i18n';

const dict = DICTIONARIES.en as Record<string, string>;
const h = vi.hoisted(() => ({ search: 'favorites=true', user: null as null | { id: string }, loading: false }));

vi.mock('@/context/LocaleContext', () => ({ useLocale: () => ({ t: (k: string) => dict[k] ?? k, locale: 'en' }) }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(h.search),
  usePathname: () => '/songs',
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: h.user, loading: h.loading }) }));
vi.mock('@/context/SidebarContext', () => ({
  useSidebar: () => ({
    setHeaderCount: vi.fn(),
    searchFiltersOpen: false,
    setSearchFiltersOpen: vi.fn(),
    setHasActiveSearchFilters: vi.fn(),
    isSearching: false,
  }),
}));
vi.mock('@/hooks/useSongsQuery', () => ({ useSongsQuery: () => ({ songs: [], taxonomy: [] }) }));
vi.mock('@/hooks/useFavoritesQuery', () => ({ useFavoritesQuery: () => ({ favoriteIds: new Set() }) }));
vi.mock('@/hooks/useRecordingsQuery', () => ({ useRecordingsQuery: () => ({ userRecordingCompositionIds: new Set() }) }));
vi.mock('@/components/library/SearchFiltersModal', () => ({ default: () => null }));
vi.mock('@/hooks/useSongsFilter', () => ({
  useSongsFilter: () => {
    const p = new URLSearchParams(h.search);
    return {
      displaySongs: [],
      state: { status: p.get('status') ?? 'all', favorites: p.get('favorites') === 'true', search: '', tags: [] },
      setFilter: vi.fn(),
      commitFilters: vi.fn(),
      resetFilters: vi.fn(),
      chordsCount: 0,
      melodyCount: 0,
      favoritesCount: 0,
      mineCount: 0,
      recordingsCount: 0,
      hasActiveFilters: true,
      filteredCount: 0,
      browseOptionsFor: () => ({}),
    };
  },
}));

import SongsPageContent from '@/app/songs/SongsPageContent';

afterEach(() => {
  cleanup();
  h.search = 'favorites=true';
  h.user = null;
  h.loading = false;
});

describe('Favorites for guests (#600)', () => {
  it('a guest sees the GuestGate whose Sign in returns to /songs?favorites=true', () => {
    render(<SongsPageContent initialSongs={[]} initialTaxonomy={[]} />);
    const gate = screen.getByTestId('guest-gate');
    expect(gate.getAttribute('data-feature')).toBe('favourites');
    expect(screen.getByText(dict['guestGate.favourites.title'])).toBeTruthy();
    expect(screen.getByTestId('guest-gate-sign-in').getAttribute('href')).toBe(
      '/auth/login?next=%2Fsongs%3Ffavorites%3Dtrue'
    );
    expect(screen.queryByText(dict['songs.emptyFavorites.title'])).toBeNull();
  });

  it('a member keeps the empty state', () => {
    h.user = { id: 'u1' };
    render(<SongsPageContent initialSongs={[]} initialTaxonomy={[]} />);
    expect(screen.queryByTestId('guest-gate')).toBeNull();
    expect(screen.getByText(dict['songs.emptyFavorites.title'])).toBeTruthy();
  });

  it('no gate flashes while the session is loading', () => {
    h.loading = true;
    render(<SongsPageContent initialSongs={[]} initialTaxonomy={[]} />);
    expect(screen.queryByTestId('guest-gate')).toBeNull();
  });

  it('Drafts is unchanged for a guest until the owner decides (#232)', () => {
    h.search = 'status=draft';
    render(<SongsPageContent initialSongs={[]} initialTaxonomy={[]} />);
    expect(screen.queryByTestId('guest-gate')).toBeNull();
    expect(screen.getByText(dict['songs.emptyDrafts.title'])).toBeTruthy();
  });
});
