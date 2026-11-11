// @vitest-environment jsdom
// Story 6.2.10 / G2.1 (#513): the source line under the lyrics renders in the real English copy (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { SongSourceLine } from '@/components/song/SongSourceLine';
import { DICTIONARIES, translateFrom } from '@/lib/i18n';
import type { VersionSourceRow } from '@/lib/songs/versionSources';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, p?: Record<string, string | number>) => translateFrom(DICTIONARIES.en, DICTIONARIES.en, k, p),
  }),
}));

afterEach(cleanup);

const row = (id: string, over: Partial<VersionSourceRow> = {}): VersionSourceRow => ({
  id,
  is_primary: false,
  page: null,
  original_title: null,
  songbooks: { id, title: `Songbook ${id}`, compiler: null },
  ...over,
});

describe('SongSourceLine', () => {
  it('shows the book, page and compiler', () => {
    render(
      <SongSourceLine
        songTitle="Rise Up"
        sources={[row('A', { page: '38', songbooks: { id: 'A', title: 'Songbook A', compiler: 'Compiler A' } })]}
      />
    );
    expect(screen.getByTestId('song-source-item').textContent).toBe('Songbook A · p. 38 · compiled by Compiler A');
  });

  it('lists several sources, the primary one first', () => {
    render(<SongSourceLine songTitle="Rise Up" sources={[row('B', { page: '2' }), row('A', { page: '38', is_primary: true })]} />);
    const items = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toEqual(['Songbook A · p. 38', 'Songbook B · p. 2']);
    expect(screen.getByRole('list', { name: 'Source' })).toBeTruthy();
  });

  it('renders nothing without sources, or with older cached data that has none', () => {
    const { container, rerender } = render(<SongSourceLine songTitle="Rise Up" sources={[]} />);
    expect(container.firstChild).toBeNull();
    rerender(<SongSourceLine songTitle="Rise Up" sources={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});
