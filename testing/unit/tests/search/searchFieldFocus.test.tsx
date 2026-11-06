// @vitest-environment jsdom
// Story 6.1.28 / G6.3 (#412) review fixes: the Home search field and the header search field share one
// suggestion-panel behaviour (hooks/useSearchSuggestions): Escape in the panel and Tab out of the field
// both close the panel; the header's own field is hidden for guests on Home (UXA-042).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DICTIONARIES } from '@/lib/i18n';
import { SEARCH_HISTORY_KEY } from '@/lib/search/history';
import { requestSearchFocus } from '@/lib/search/focusSearch';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, p?: Record<string, string | number>) =>
      (dict[k] ?? k).replace(/\{(\w+)\}/g, (_, n) => String(p?.[n] ?? '')),
  }),
}));

const push = vi.fn();
let pathname = '/songs';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a>,
}));
vi.mock('@/context/SidebarContext', () => ({
  useSidebar: () => ({
    setIsOpen: vi.fn(),
    searchFiltersOpen: false,
    setSearchFiltersOpen: vi.fn(),
    hasActiveSearchFilters: false,
    isSearching: false,
    setIsSearching: vi.fn(),
  }),
}));
let authUser: { id: string } | null = null;
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: authUser }) }));
vi.mock('@/components/common/navigation/UserProfile', () => ({ UserProfile: () => null }));
vi.mock('@/components/common/navigation/NotificationBell', () => ({ NotificationBell: () => null }));
vi.mock('@/lib/env', () => ({ getSiteTitle: () => 'Sacred Fire Songs' }));
vi.mock('@/lib/taxonomyUtils', () => ({
  fetchCategoryTree: vi.fn(async () => [{ id: 'c2', name: 'Nature', slug: 'nature', children: [] }]),
}));

import HomeSearch from '@/components/home/HomeSearch';
import Header from '@/components/common/Header';

function wrap(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  push.mockClear();
  pathname = '/songs';
  authUser = null;
  window.localStorage.clear();
  window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(['fuego']));
});
afterEach(cleanup);

const fields = [
  { name: 'HomeSearch', render: () => wrap(<HomeSearch />), role: 'searchbox' as const },
  { name: 'Header', render: () => wrap(<Header />), role: 'textbox' as const },
];

describe.each(fields)('$name suggestion panel', ({ render: mount, role }) => {
  it('closes on Escape inside the panel and does not reopen when the field gets focus back', async () => {
    mount();
    const input = screen.getByRole(role);
    act(() => input.focus());
    expect(await screen.findByTestId('search-suggestions')).toBeTruthy();

    const item = screen.getByRole('button', { name: 'fuego' });
    act(() => item.focus());
    fireEvent.keyDown(item, { key: 'Escape' });
    expect(screen.queryByTestId('search-suggestions')).toBeNull();
    expect(document.activeElement).toBe(input);
    // a later tap on the field opens it again
    fireEvent.click(input);
    expect(await screen.findByTestId('search-suggestions')).toBeTruthy();
  });

  it('closes when focus tabs out of the field to something outside', async () => {
    const { container } = mount();
    const outside = document.createElement('button');
    outside.textContent = 'elsewhere';
    document.body.appendChild(outside);
    const input = screen.getByRole(role);
    act(() => input.focus());
    expect(await screen.findByTestId('search-suggestions')).toBeTruthy();

    act(() => outside.focus());
    expect(screen.queryByTestId('search-suggestions')).toBeNull();
    outside.remove();
    expect(container).toBeTruthy();
  });

  it('stays open while focus moves from the field into the panel', async () => {
    mount();
    act(() => screen.getByRole(role).focus());
    await screen.findByTestId('search-suggestions');
    act(() => screen.getByRole('button', { name: 'fuego' }).focus());
    expect(screen.getByTestId('search-suggestions')).toBeTruthy();
  });

  it('ArrowDown hands focus to the first suggestion', async () => {
    mount();
    const input = screen.getByRole(role);
    act(() => input.focus());
    await screen.findByTestId('search-suggestions');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'fuego' }));
  });
});

describe('Header search field on Home (UXA-042)', () => {
  it('is hidden for guests on Home, where the inline field replaces it', () => {
    pathname = '/';
    authUser = null;
    wrap(<Header />);
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('stays for members on Home', () => {
    pathname = '/';
    authUser = { id: 'u1' };
    wrap(<Header />);
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('stays for guests on other pages', () => {
    pathname = '/songs';
    authUser = null;
    wrap(<Header />);
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('the bottom bar Search tap on guest Home focuses the header field once it is shown on the song list', async () => {
    pathname = '/';
    authUser = null;
    const view = wrap(<Header />);
    act(() => requestSearchFocus()); // tapped on Home: no header field yet
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByTestId('search-suggestions')).toBeNull();

    pathname = '/songs'; // the tab navigates to the song list
    view.rerender(
      <QueryClientProvider client={new QueryClient()}>
        <Header />
      </QueryClientProvider>
    );
    const input = screen.getByRole('textbox');
    expect(document.activeElement).toBe(input);
    expect(await screen.findByTestId('search-suggestions')).toBeTruthy();
  });

  it('a Search tap on guest Home that does not reach the song list does not grab focus later', () => {
    pathname = '/';
    authUser = null;
    const view = wrap(<Header />);
    act(() => requestSearchFocus()); // tapped, but the navigation to /songs never happened
    pathname = '/songs/abc'; // the guest opens a song instead
    view.rerender(
      <QueryClientProvider client={new QueryClient()}>
        <Header />
      </QueryClientProvider>
    );
    expect(document.activeElement).not.toBe(screen.getByRole('textbox'));
    expect(screen.queryByTestId('search-suggestions')).toBeNull();
  });
});
