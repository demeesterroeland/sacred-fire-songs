// @vitest-environment jsdom
// Story 6.1.28 / G6.3 (#412): the guest Home welcome block (RTL, L3).
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { countPaletteClasses } from '@/lib/design/paletteAudit';
import { DICTIONARIES } from '@/lib/i18n';
import { SEARCH_HISTORY_KEY } from '@/lib/search/history';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, p?: Record<string, string | number>) =>
      (dict[k] ?? k).replace(/\{(\w+)\}/g, (_, n) => String(p?.[n] ?? '')),
  }),
}));

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

vi.mock('@/lib/taxonomyUtils', () => ({
  fetchCategoryTree: vi.fn(async () => [
    { id: 'c1', name: 'The Elements', slug: 'the-elements', children: [] },
    { id: 'c2', name: 'Nature', slug: 'nature', children: [] },
  ]),
}));

import HomeSearch from '@/components/home/HomeSearch';
import HomeWelcome from '@/components/home/HomeWelcome';

const root = path.resolve(__dirname, '..', '..', '..', '..');

function renderSearch() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <HomeSearch />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  push.mockClear();
  window.localStorage.clear();
});
afterEach(cleanup);

describe('HomeWelcome', () => {
  it('states in one line what the site is', () => {
    render(<HomeWelcome />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(dict['home.welcome.title']);
    expect(screen.getByText(dict['home.welcome.line'])).toBeTruthy();
    expect(dict['home.welcome.line']).not.toMatch(/\n/);
  });
});

describe('HomeSearch', () => {
  it('has a labelled search field and a submit button', () => {
    renderSearch();
    const form = screen.getByRole('search');
    expect(within(form).getByRole('searchbox', { name: 'Search songs' })).toBeTruthy();
    expect(within(form).getByRole('button', { name: 'Search' })).toBeTruthy();
  });

  it('sends the term to the song list and remembers it', () => {
    renderSearch();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '  agua ' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(push).toHaveBeenCalledWith('/songs?search=agua');
    expect(JSON.parse(window.localStorage.getItem(SEARCH_HISTORY_KEY) ?? '[]')).toEqual(['agua']);
  });

  it('does nothing on an empty submit', () => {
    renderSearch();
    fireEvent.submit(screen.getByRole('search'));
    expect(push).not.toHaveBeenCalled();
  });

  it('reuses the G7.1 suggestions: recent searches and category chips on focus', async () => {
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(['fuego']));
    renderSearch();
    fireEvent.focus(screen.getByRole('searchbox'));
    const recent = await screen.findByRole('region', { name: 'Recent searches' });
    expect(within(recent).getByRole('button', { name: 'fuego' })).toBeTruthy();
    const nature = await screen.findByRole('button', { name: 'Nature' });
    fireEvent.click(nature);
    expect(push).toHaveBeenCalledWith('/songs?category=nature');
  });

  it('repeats a recent search in one tap', async () => {
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(['fuego']));
    renderSearch();
    fireEvent.focus(screen.getByRole('searchbox'));
    fireEvent.click(await screen.findByRole('button', { name: 'fuego' }));
    expect(push).toHaveBeenCalledWith('/songs?search=fuego');
  });
});

describe('Home welcome block design', () => {
  it.each(['components/home/HomeWelcome.tsx', 'components/home/HomeSearch.tsx', 'components/home/RecentlyAdded.tsx'])(
    '%s uses design tokens only',
    (file) => {
      const source = fs.readFileSync(path.join(root, file), 'utf8');
      expect(countPaletteClasses(source)).toBe(0);
    }
  );
});
