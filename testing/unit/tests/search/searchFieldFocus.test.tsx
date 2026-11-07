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
import { SuggestionsSlot } from '@/components/search/SuggestionsSlot';

function wrap(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // The page layout holds the slot the header's suggestions panel is rendered into (fix 4).
  return render(<QueryClientProvider client={client}>{ui}<SuggestionsSlot /></QueryClientProvider>);
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

describe.each(fields)('$name suggestion panel', ({ name, render: mount, role }) => {
  it('is part of the page flow: never positioned out of it, so it pushes the page down', async () => {
    mount();
    act(() => screen.getByRole(role).focus());
    const panel = await screen.findByTestId('search-suggestions');
    for (let el: HTMLElement | null = panel; el && el !== document.body; el = el.parentElement) {
      expect(el.className, `${name}: ${el.tagName}`).not.toMatch(/(^|\s)(absolute|fixed)(\s|$)/);
    }
    if (name === 'Header') {
      // rendered in the slot at the top of the main column, not inside the (fixed height) header bar
      expect(document.getElementById('app-navbar')?.contains(panel)).toBe(false);
      expect(screen.getByTestId('search-suggestions-slot').contains(panel)).toBe(true);
    }
  });

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

  it('closes when a press that never clicks (right button) left focus outside', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      mount();
      const outside = document.createElement('a');
      outside.href = '#row';
      outside.textContent = 'a song';
      document.body.appendChild(outside);
      const input = screen.getByRole(role);
      act(() => input.focus());
      expect(await screen.findByTestId('search-suggestions')).toBeTruthy();

      fireEvent.pointerDown(outside, { button: 2 });
      act(() => outside.focus());
      fireEvent.contextMenu(outside, { button: 2 });
      // the press holds the page still for a moment, then the panel goes: no click is coming
      act(() => { vi.advanceTimersByTime(600); });
      expect(screen.queryByTestId('search-suggestions')).toBeNull();
      outside.remove();
    } finally {
      vi.useRealTimers();
    }
  });

  // Review round: a right-click on plain text or empty space moves focus to <body> (no link to focus), and no click comes.
  it('closes when a right-click on plain text outside leaves focus on the page, not in the field', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      mount();
      const text = document.createElement('p');
      text.textContent = 'just words';
      document.body.appendChild(text);
      const input = screen.getByRole(role);
      act(() => input.focus());
      expect(await screen.findByTestId('search-suggestions')).toBeTruthy();

      fireEvent.pointerDown(text, { button: 2, pointerId: 1 });
      act(() => input.blur()); // the browser takes focus off the field; nothing focusable was pressed
      expect(document.activeElement).toBe(document.body);
      fireEvent.contextMenu(text, { button: 2 });
      act(() => { vi.advanceTimersByTime(600); });
      expect(screen.queryByTestId('search-suggestions')).toBeNull();
      text.remove();
    } finally {
      vi.useRealTimers();
    }
  });

  it('stays open when the right-click is inside the panel', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      mount();
      act(() => screen.getByRole(role).focus());
      const panel = await screen.findByTestId('search-suggestions');
      fireEvent.pointerDown(panel, { button: 2, pointerId: 1 });
      act(() => (document.activeElement as HTMLElement | null)?.blur()); // focus to <body>
      fireEvent.contextMenu(panel, { button: 2 });
      act(() => { vi.advanceTimersByTime(600); });
      expect(screen.queryByTestId('search-suggestions')).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('stays open after a press that never clicks (a scroll gesture) when focus stayed in the field', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      mount();
      const input = screen.getByRole(role);
      act(() => input.focus());
      expect(await screen.findByTestId('search-suggestions')).toBeTruthy();
      fireEvent.pointerDown(document.body);
      fireEvent.pointerCancel(document.body);
      act(() => { vi.advanceTimersByTime(600); });
      expect(screen.queryByTestId('search-suggestions')).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  // Validation 2, item 18: iOS Safari fires no click on a tap on empty (non-interactive) space and leaves focus in the
  // field, so only pointerup can tell. A still release on something that is not a link or button closes the panel.
  it('a still tap on empty space closes the panel without any click (iPhone)', async () => {
    mount();
    const empty = document.createElement('div');
    document.body.appendChild(empty);
    act(() => screen.getByRole(role).focus());
    await screen.findByTestId('search-suggestions');
    fireEvent.pointerDown(empty, { clientX: 100, clientY: 200, pointerId: 1, button: 0 });
    expect(screen.getByTestId('search-suggestions')).toBeTruthy(); // not on the press: the page holds still
    fireEvent.pointerUp(empty, { clientX: 102, clientY: 201, pointerId: 1, button: 0 });
    expect(screen.queryByTestId('search-suggestions')).toBeNull();
    empty.remove();
  });

  it('a release that moved (a drag, a scroll) does not close the panel', async () => {
    mount();
    const empty = document.createElement('div');
    document.body.appendChild(empty);
    act(() => screen.getByRole(role).focus());
    await screen.findByTestId('search-suggestions');
    fireEvent.pointerDown(empty, { clientX: 100, clientY: 200, pointerId: 1, button: 0 });
    fireEvent.pointerUp(empty, { clientX: 100, clientY: 260, pointerId: 1, button: 0 });
    expect(screen.getByTestId('search-suggestions')).toBeTruthy();
    empty.remove();
  });

  it('a press released on a song row still waits for its click: the pressed song opens, not the one that moves under the finger', async () => {
    mount();
    const row = document.createElement('a');
    row.href = '/songs/abc';
    const label = document.createElement('span'); // the finger lands on text inside the link
    row.appendChild(label);
    document.body.appendChild(row);
    act(() => screen.getByRole(role).focus());
    await screen.findByTestId('search-suggestions');
    fireEvent.pointerDown(label, { clientX: 10, clientY: 10, pointerId: 1, button: 0 });
    fireEvent.pointerUp(label, { clientX: 10, clientY: 10, pointerId: 1, button: 0 });
    expect(screen.getByTestId('search-suggestions')).toBeTruthy();
    fireEvent.click(label);
    expect(screen.queryByTestId('search-suggestions')).toBeNull();
    row.remove();
  });

  it('a still tap inside the field or the panel does not close it', async () => {
    mount();
    act(() => screen.getByRole(role).focus());
    const panel = await screen.findByTestId('search-suggestions');
    fireEvent.pointerDown(panel, { clientX: 5, clientY: 5, pointerId: 1, button: 0 });
    fireEvent.pointerUp(panel, { clientX: 5, clientY: 5, pointerId: 1, button: 0 });
    expect(screen.getByTestId('search-suggestions')).toBeTruthy();
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

  // Validation 1 review, B1: the panel is in the page flow, so closing it moves the list. A press that lands on a
  // song must not move the page before it is released: the panel closes on the click, not on the press.
  it('stays open while a press is down outside, even when the press moves focus; closes on the click', async () => {
    mount();
    const outside = document.createElement('a');
    outside.href = '/songs/abc';
    outside.textContent = 'a song';
    document.body.appendChild(outside);
    act(() => screen.getByRole(role).focus());
    await screen.findByTestId('search-suggestions');

    fireEvent.pointerDown(outside);
    act(() => outside.focus()); // a browser focuses a link on mouse down
    expect(screen.getByTestId('search-suggestions')).toBeTruthy(); // the page has not moved yet

    fireEvent.pointerUp(outside);
    fireEvent.click(outside);
    expect(screen.queryByTestId('search-suggestions')).toBeNull();
    outside.remove();
  });

  it('a press on something unfocusable outside also waits for the click', async () => {
    mount();
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    act(() => screen.getByRole(role).focus());
    await screen.findByTestId('search-suggestions');
    fireEvent.pointerDown(outside);
    expect(screen.getByTestId('search-suggestions')).toBeTruthy();
    fireEvent.pointerUp(outside);
    fireEvent.click(outside);
    expect(screen.queryByTestId('search-suggestions')).toBeNull();
    outside.remove();
  });

  it('on a touch screen focus moves to the link after the finger lifts, before the click: the panel still holds', async () => {
    mount();
    const outside = document.createElement('a');
    outside.href = '/songs/abc';
    document.body.appendChild(outside);
    act(() => screen.getByRole(role).focus());
    await screen.findByTestId('search-suggestions');
    fireEvent.pointerDown(outside);
    fireEvent.pointerUp(outside);
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); }); // timers run between pointerup and the mouse events
    act(() => outside.focus());
    expect(screen.getByTestId('search-suggestions')).toBeTruthy();
    fireEvent.click(outside);
    expect(screen.queryByTestId('search-suggestions')).toBeNull();
    outside.remove();
  });

  it('a press that is cancelled does not leave the panel stuck: the next Tab out still closes it', async () => {
    mount();
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    act(() => screen.getByRole(role).focus());
    await screen.findByTestId('search-suggestions');
    fireEvent.pointerDown(outside);
    fireEvent.pointerCancel(outside);
    await act(async () => { await new Promise((r) => setTimeout(r, 600)); });
    act(() => outside.focus());
    expect(screen.queryByTestId('search-suggestions')).toBeNull();
    outside.remove();
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

describe('Header: tabbing to the search options button leaves the field (L4)', () => {
  it('closes the suggestions so the page is not left pushed down', async () => {
    wrap(<Header />);
    act(() => screen.getByRole('textbox').focus());
    expect(await screen.findByTestId('search-suggestions')).toBeTruthy();
    act(() => screen.getByRole('button', { name: DICTIONARIES.en['header.searchOptions'] as string }).focus());
    expect(screen.queryByTestId('search-suggestions')).toBeNull();
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
        <SuggestionsSlot />
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
        <SuggestionsSlot />
      </QueryClientProvider>
    );
    expect(document.activeElement).not.toBe(screen.getByRole('textbox'));
    expect(screen.queryByTestId('search-suggestions')).toBeNull();
  });
});
