// @vitest-environment jsdom
// Story 6.2.11 / G2.2 (#514): the route files of the songbook pages (server components, L3): unknown book = 404, the
// library frame is shared, the not-found copy is the book's own.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tWithLocale, SUPPORTED_LOCALES, type TranslationKey } from '@/lib/i18n';

const fetchSongbookServer = vi.fn();
const fetchSongbooksServer = vi.fn();
vi.mock('@/lib/songbooks/serverQueries', () => ({
  fetchSongbookServer: (...a: unknown[]) => fetchSongbookServer(...a),
  fetchSongbooksServer: (...a: unknown[]) => fetchSongbooksServer(...a),
}));
vi.mock('@/lib/i18n/server', () => ({ getServerLocale: async () => 'en' }));
vi.mock('@/components/common/feedback/NotFound', () => ({ default: () => null }));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
  },
}));

import NotFound from '@/components/common/feedback/NotFound';
import { SongbookPageContent } from '@/components/songbooks/SongbookPageContent';
import { SongbooksList } from '@/components/songbooks/SongbooksList';

beforeEach(() => {
  fetchSongbookServer.mockReset();
  fetchSongbooksServer.mockReset();
});

describe('/songbooks/[id]', () => {
  it('answers 404 for a book that does not exist (or that the viewer cannot read)', async () => {
    fetchSongbookServer.mockResolvedValue(null);
    const { default: Page } = await import('@/app/songbooks/[id]/page');
    await expect(Page({ params: Promise.resolve({ id: 'nope' }) })).rejects.toThrow('404');
    expect(fetchSongbookServer).toHaveBeenCalledWith('nope', 'en');
  });

  it('reads an escaped id from the URL', async () => {
    fetchSongbookServer.mockResolvedValue(null);
    const { default: Page } = await import('@/app/songbooks/[id]/page');
    await expect(Page({ params: Promise.resolve({ id: 'a%20b%2Fc' }) })).rejects.toThrow('404');
    expect(fetchSongbookServer).toHaveBeenCalledWith('a b/c', 'en');
  });

  it('renders the book it found', async () => {
    const book = { id: 'book-a', title: 'Songbook A', entries: [], songCount: 0 };
    fetchSongbookServer.mockResolvedValue(book);
    const { default: Page } = await import('@/app/songbooks/[id]/page');
    const element = (await Page({ params: Promise.resolve({ id: 'book-a' }) })) as { type: unknown; props: { book: unknown } };
    expect(element.type).toBe(SongbookPageContent);
    expect(element.props.book).toBe(book);
  });

  it('titles the tab with the book title', async () => {
    fetchSongbookServer.mockResolvedValue({ id: 'book-a', title: 'Songbook A', entries: [], songCount: 0 });
    const { generateMetadata } = await import('@/app/songbooks/[id]/page');
    await expect(generateMetadata({ params: Promise.resolve({ id: 'book-a' }) })).resolves.toEqual({ title: 'Songbook A' });
    expect(fetchSongbookServer).toHaveBeenCalledWith('book-a', 'en');
  });

  it('titles an unknown or unreadable book with the not-found title, never its own', async () => {
    fetchSongbookServer.mockResolvedValue(null);
    const { generateMetadata } = await import('@/app/songbooks/[id]/page');
    await expect(generateMetadata({ params: Promise.resolve({ id: 'private-only' }) })).resolves.toEqual({ title: 'Songbook not found' });
  });

  it('has its own not-found copy', async () => {
    const { default: SongbookNotFound } = await import('@/app/songbooks/[id]/not-found');
    const element = SongbookNotFound() as { type: unknown; props: { titleKey: string; descriptionKey: string; icon: string } };
    expect(element.type).toBe(NotFound);
    expect(element.props).toMatchObject({ titleKey: 'songbooks.notFound.title', descriptionKey: 'songbooks.notFound.description', icon: 'music' });
    expect(tWithLocale('en', 'songbooks.notFound.title')).toBe('Songbook not found');
  });
});

describe('/songbooks', () => {
  it('lists the books the query returns, with their count in the heading', async () => {
    fetchSongbooksServer.mockResolvedValue([{ id: 'a', title: 'Songbook A', songCount: 1 }]);
    const { default: Page } = await import('@/app/songbooks/page');
    const element = (await Page()) as { props: { children: { type: unknown; props: Record<string, unknown> }[] } };
    const [heading, list] = element.props.children;
    expect(heading.props).toMatchObject({ title: 'Songbooks', count: 1 });
    expect(list.type).toBe(SongbooksList);
    expect(fetchSongbooksServer).toHaveBeenCalledWith('en');
  });

  it('shares the frame of the Library pages', async () => {
    const layout = await import('@/app/songbooks/layout');
    const library = await import('@/app/library/layout');
    expect(layout.default).toBe(library.default);
  });
});

describe('copy', () => {
  const KEYS: TranslationKey[] = [
    'library.tabs.songbooks',
    'songbooks.pageTitle',
    'songbooks.emptyHint',
    'songbooks.empty',
    'songbooks.noPage',
    'songbooks.listLabel',
    'songbooks.notFound.title',
    'songbooks.notFound.description',
  ];
  it.each(SUPPORTED_LOCALES)('is complete in %s', (locale) => {
    for (const key of KEYS) {
      const value = tWithLocale(locale, key);
      expect(value, `${locale} ${key}`).not.toBe(key);
      expect(value.trim(), `${locale} ${key}`).not.toBe('');
    }
  });
});
