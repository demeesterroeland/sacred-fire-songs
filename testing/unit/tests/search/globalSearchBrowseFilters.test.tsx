// @vitest-environment jsdom
// Story 6.2.25 / G5.8 (#570): GlobalSearchModal shows Songbook and Language filters on every page,
// fetches counts only while open (enabled: isOpen), and submits ?songbook=<id>&language=<slug>.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DICTIONARIES } from '@/lib/i18n';
import { countPaletteClasses } from '@/lib/design/paletteAudit';

const pushMock = vi.fn();
let mockPathname = '/';
let mockSearchFiltersOpen = false;
let mockUser: { id: string } | null = null;
const rpcMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => mockPathname,
}));

vi.mock('@/context/SidebarContext', () => ({
  useSidebar: () => ({
    searchFiltersOpen: mockSearchFiltersOpen,
    setSearchFiltersOpen: vi.fn(),
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    t: (k: string, vars?: Record<string, string | number>) => {
      const text = (DICTIONARIES.en as Record<string, string>)[k] ?? k;
      return vars ? text.replace(/\{(\w+)\}/g, (_m, name) => String(vars[name])) : text;
    },
  }),
}));

vi.mock('@/lib/taxonomyUtils', () => ({
  fetchCategoryTree: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/hooks/useRecordingsQuery', () => ({
  useRecordingsQuery: () => ({ userRecordingCompositionIds: new Set<string>() }),
}));

vi.mock('@/hooks/useGlobalFilterCounts', () => ({
  useGlobalFilterCounts: () => ({
    chordsCount: undefined,
    melodyCount: undefined,
    favoritesCount: undefined,
    mineCount: undefined,
  }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ rpc: rpcMock }),
}));

import GlobalSearchModal from '@/components/common/GlobalSearchModal';

const en = DICTIONARIES.en as Record<string, string>;

const DEFAULT_ROWS = [
  { kind: 'songbook', value: 'book-a', label: 'Book A', song_count: 12 },
  { kind: 'songbook', value: 'book-b', label: 'Book B', song_count: 3 },
  { kind: 'language', value: 'spanish', label: 'Spanish', song_count: 7 },
  { kind: 'language', value: 'english', label: 'English', song_count: 20 },
];

function renderModal(client?: QueryClient) {
  const qc =
    client ??
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  return {
    qc,
    ...render(
      <QueryClientProvider client={qc}>
        <GlobalSearchModal />
      </QueryClientProvider>
    ),
  };
}

beforeEach(() => {
  mockPathname = '/';
  mockSearchFiltersOpen = false;
  mockUser = null;
  pushMock.mockReset();
  rpcMock.mockReset();
  rpcMock.mockResolvedValue({ data: DEFAULT_ROWS, error: null });
});

afterEach(cleanup);

describe('GlobalSearchModal: Songbook and Language filters (#570)', () => {
  it('Closed window loads nothing: does not call fn_search_filter_counts when closed', () => {
    mockSearchFiltersOpen = false;
    renderModal();
    expect(rpcMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('combobox', { name: en['search.songbook'] })).toBeNull();
    expect(screen.queryByRole('combobox', { name: en['search.language'] })).toBeNull();
  });

  it('returns null and requests nothing on /songs even if open', () => {
    mockPathname = '/songs';
    mockSearchFiltersOpen = true;
    const { container } = renderModal();
    expect(container.innerHTML).toBe('');
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('Filter by songbook from home page: shows counts and navigates with ?songbook=', async () => {
    mockPathname = '/';
    mockSearchFiltersOpen = true;
    const { container } = renderModal();

    const songbookSelect = (await screen.findByRole('combobox', {
      name: en['search.songbook'],
    })) as HTMLSelectElement;

    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('fn_search_filter_counts');

    const optionTexts = within(songbookSelect)
      .getAllByRole('option')
      .map((o) => o.textContent);
    expect(optionTexts).toEqual([en['search.songbook.all'], 'Book A (12)', 'Book B (3)']);

    expect(countPaletteClasses(container.innerHTML)).toBe(0);
    expect(songbookSelect.className).toMatch(/min-h-tap/);

    fireEvent.change(songbookSelect, { target: { value: 'book-a' } });
    fireEvent.click(screen.getByRole('button', { name: en['search.showResults'] }));

    expect(pushMock).toHaveBeenCalledWith('/songs?songbook=book-a');
  });

  it('Filter by language from a playlist page: shows counts and navigates with ?language=', async () => {
    mockPathname = '/library/playlists/123';
    mockSearchFiltersOpen = true;
    renderModal();

    const langSelect = (await screen.findByRole('combobox', {
      name: en['search.language'],
    })) as HTMLSelectElement;

    const optionTexts = within(langSelect)
      .getAllByRole('option')
      .map((o) => o.textContent);
    expect(optionTexts).toEqual([en['search.language.all'], 'English (20)', 'Spanish (7)']);

    fireEvent.change(langSelect, { target: { value: 'spanish' } });
    fireEvent.click(screen.getByRole('button', { name: en['search.showResults'] }));

    expect(pushMock).toHaveBeenCalledWith('/songs?language=spanish');
  });

  it('submits combined songbook, language, and search query, and Clear all resets them', async () => {
    mockPathname = '/';
    mockSearchFiltersOpen = true;
    renderModal();

    const songbookSelect = await screen.findByRole('combobox', { name: en['search.songbook'] });
    const langSelect = await screen.findByRole('combobox', { name: en['search.language'] });

    fireEvent.change(songbookSelect, { target: { value: 'book-b' } });
    fireEvent.change(langSelect, { target: { value: 'spanish' } });

    const clearBtn = screen.getByRole('button', { name: en['search.clearAll'] }) as HTMLButtonElement;
    expect(clearBtn.disabled).toBe(false);
    fireEvent.click(clearBtn);

    expect((songbookSelect as HTMLSelectElement).value).toBe('');
    expect((langSelect as HTMLSelectElement).value).toBe('');

    fireEvent.change(songbookSelect, { target: { value: 'book-a' } });
    fireEvent.change(langSelect, { target: { value: 'english' } });
    fireEvent.click(screen.getByRole('button', { name: en['search.showResults'] }));

    expect(pushMock).toHaveBeenCalledWith('/songs?songbook=book-a&language=english');
  });

  it('caches counts when closed and reopened while fresh', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    mockSearchFiltersOpen = false;
    const view = renderModal(qc);
    expect(rpcMock).not.toHaveBeenCalled();

    mockSearchFiltersOpen = true;
    view.rerender(
      <QueryClientProvider client={qc}>
        <GlobalSearchModal />
      </QueryClientProvider>
    );
    await waitFor(() => expect(rpcMock).toHaveBeenCalledTimes(1));

    mockSearchFiltersOpen = false;
    view.rerender(
      <QueryClientProvider client={qc}>
        <GlobalSearchModal />
      </QueryClientProvider>
    );
    mockSearchFiltersOpen = true;
    view.rerender(
      <QueryClientProvider client={qc}>
        <GlobalSearchModal />
      </QueryClientProvider>
    );
    await screen.findByRole('combobox', { name: en['search.songbook'] });
    expect(rpcMock).toHaveBeenCalledTimes(1);
  });
});
