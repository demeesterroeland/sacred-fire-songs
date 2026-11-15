// @vitest-environment jsdom
// Story 6.2.11 / G2.2 (#514): the songbook list and page render in the real English copy (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { SongbookPageContent } from '@/components/songbooks/SongbookPageContent';
import { SongbooksList } from '@/components/songbooks/SongbooksList';
import { DICTIONARIES, translateFrom } from '@/lib/i18n';
import type { SongbookDetail, SongbookSummary } from '@/lib/songbooks/serverQueries';
import type { SongbookEntry } from '@/lib/songbooks/songbookPage';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    t: (k: string, p?: Record<string, string | number>) => translateFrom(DICTIONARIES.en, DICTIONARIES.en, k, p),
  }),
}));

afterEach(cleanup);

const entry = (over: Partial<SongbookEntry> = {}): SongbookEntry => ({
  key: 's1|4',
  songId: 's1',
  versionId: 'v1',
  title: 'Song A',
  page: '4',
  originalTitle: null,
  authors: ['Author A'],
  originalAuthor: 'Author A',
  isPublic: true,
  sourceIds: ['src-1'],
  ...over,
});

const book = (over: Partial<SongbookDetail> = {}): SongbookDetail => ({
  id: 'book-a',
  title: 'Songbook A',
  shortName: null,
  compiler: 'Compiler A',
  year: 1998,
  community: 'Community A',
  languages: ['es'],
  attribution: 'Used with the permission of Compiler A.',
  entries: [entry()],
  songCount: 1,
  ...over,
});

describe('SongbookPageContent', () => {
  it('shows the title, the compiler, the attribution and the count', () => {
    render(<SongbookPageContent book={book()} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Songbook A' })).toBeTruthy();
    expect(screen.getByText('(1)')).toBeTruthy();
    expect(screen.getByTestId('songbook-meta').textContent).toBe('compiled by Compiler A · Community A · 1998');
    expect(screen.getByTestId('songbook-attribution').textContent).toBe('Used with the permission of Compiler A.');
  });

  it('drops what the book does not give', () => {
    render(<SongbookPageContent book={book({ compiler: null, community: null, year: null, attribution: null })} />);
    expect(screen.queryByTestId('songbook-meta')).toBeNull();
    expect(screen.queryByTestId('songbook-attribution')).toBeNull();
  });

  it('lists the songs in the given order, each a link to its version, with its page', () => {
    render(
      <SongbookPageContent
        book={book({
          entries: [
            entry({ songId: 's3', versionId: 'v3', title: 'Song C', page: '2', authors: ['Author C'], key: 'a', sourceIds: ['x3'] }),
            entry({ songId: 's1', versionId: 'v1', title: 'Song A', page: '10', key: 'b', sourceIds: ['x1'] }),
            entry({ songId: 's2', versionId: 'v2', title: 'Song B', page: null, key: 'c', sourceIds: ['x2'] }),
          ],
          songCount: 3,
        })}
      />
    );
    const rows = screen.getAllByTestId('songbook-song-row');
    expect(rows.map((r) => r.getAttribute('href'))).toEqual(['/songs/s3?version=v3', '/songs/s1?version=v1', '/songs/s2?version=v2']);
    expect(rows.map((r) => within(r).getByText(/^Song/).textContent)).toEqual(['Song C', 'Song A', 'Song B']);
    expect(rows[0].textContent).toContain('p. 2');
    expect(rows[1].textContent).toContain('p. 10');
    expect(rows[2].textContent).toContain('No page number');
    expect(screen.getByRole('list', { name: 'Songs by page' })).toBeTruthy();
  });

  it('anchors every row to its source ids, so the source line can jump to it', () => {
    const { container } = render(<SongbookPageContent book={book({ entries: [entry({ sourceIds: ['x1', 'x2'] })] })} />);
    expect(container.querySelector('#source-x1')).toBeTruthy();
    expect(container.querySelector('#source-x2')).toBeTruthy();
  });

  it('highlights the row and keeps the scroll offset for every merged anchor', () => {
    // `:target` matches the span that carries the id: the row highlights through `has-[:target]` and every span has the offset.
    const { container } = render(<SongbookPageContent book={book({ entries: [entry({ sourceIds: ['x1', 'x2'] })] })} />);
    const row = container.querySelector('#source-x1') as HTMLElement;
    const second = container.querySelector('#source-x2') as HTMLElement;
    expect(row.tagName).toBe('LI');
    expect(row.className).toContain('has-[:target]:bg-surface');
    expect(row.className).toContain('target:bg-surface');
    expect(row.className).toContain('scroll-mt-24');
    expect(second.tagName).toBe('SPAN');
    expect(second.parentElement).toBe(row);
    expect(second.className).toContain('scroll-mt-24');
  });

  it('keeps a page label such as "pp. 138–139" on one line', () => {
    render(<SongbookPageContent book={book({ entries: [entry({ page: '138–139' })] })} />);
    const label = screen.getByText('pp. 138–139');
    expect(label.className).toContain('whitespace-nowrap');
    expect(label.className).toContain('min-w-14');
    expect(label.className.split(/\s+/)).not.toContain('w-14');
  });

  it('shows the original title and the author, and marks a private song', () => {
    render(<SongbookPageContent book={book({ entries: [entry({ originalTitle: 'Subir', isPublic: false })] })} />);
    const row = screen.getByTestId('songbook-song-row');
    expect(row.textContent).toContain('Original title: Subir');
    expect(row.textContent).toContain('Author A');
    expect(within(row).getByText('Private')).toBeTruthy();
  });

  it('says so when a book has no songs yet', () => {
    render(<SongbookPageContent book={book({ entries: [], songCount: 0 })} />);
    expect(screen.queryByTestId('songbook-song-row')).toBeNull();
    expect(screen.getByText('No songs in this songbook yet.')).toBeTruthy();
  });
});

describe('SongbooksList', () => {
  const summary = (id: string, songCount: number, over: Partial<SongbookSummary> = {}): SongbookSummary => ({
    id,
    title: `Songbook ${id}`,
    shortName: null,
    compiler: null,
    year: null,
    songCount,
    ...over,
  });

  it('shows each book with its compiler and song count, linking to its page', () => {
    render(<SongbooksList books={[summary('A', 1, { compiler: 'Compiler A' }), summary('B', 3), summary('a b/c', 2)]} />);
    const rows = screen.getAllByTestId('songbook-row');
    expect(rows.map((r) => r.getAttribute('href'))).toEqual(['/songbooks/A', '/songbooks/B', '/songbooks/a%20b%2Fc']);
    expect(rows[0].textContent).toBe('Songbook ACompiler A · 1 song');
    expect(rows[1].textContent).toBe('Songbook B3 songs');
  });

  it('shows a calm hint without books', () => {
    render(<SongbooksList books={[]} />);
    expect(screen.getByText(/No songbooks yet/)).toBeTruthy();
    expect(screen.queryByTestId('songbook-row')).toBeNull();
  });
});
