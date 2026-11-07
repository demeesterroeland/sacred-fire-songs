// @vitest-environment jsdom
// Story 6.1.14 / G4.1 (#398): the renamed "Takes" chip renders in the real English copy (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SongMetaLines } from '@/components/song/SongMetaLines';
import { DICTIONARIES } from '@/lib/i18n';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string) => (DICTIONARIES.en as Record<string, string>)[k] ?? k,
  }),
}));

afterEach(cleanup);

describe('SongMetaLines — Takes chip', () => {
  it('shows the link "Takes" (not "Recording") when the member has a take, and links to the filter', () => {
    render(<SongMetaLines originalAuthor="Anna" hasChords hasPersonalRecording />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    const link = screen.getByRole('link', { name: 'Takes' });
    expect(link.getAttribute('href')).toBe('/songs?myRecordings=true');
    expect(screen.queryByText(/recording/i)).toBeNull();
    expect(screen.getByRole('link', { name: 'Chords' })).toBeTruthy();
  });

  it('omits the chip when the member has no take', () => {
    render(<SongMetaLines originalAuthor="Anna" />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(screen.queryByRole('link', { name: 'Takes' })).toBeNull();
  });
});

// Validation 1 (fix 2): expanded = the link list only, no repeated author/tags line; links underlined without hover.
describe('SongMetaLines — expanded state', () => {
  const cats = [{ name: 'Spiritual concepts', slug: 'spiritual-concepts' }];

  it('collapsed: one summary line with author and tags', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats} hasChords />);
    expect(screen.getByTestId('song-meta-line').textContent).toContain('Anna');
    expect(screen.getByTestId('song-meta-line').textContent).toContain('Spiritual concepts');
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('expanded: author and tags appear once, as links, not again as a summary line', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats} hasChords />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(screen.getAllByText('Anna')).toHaveLength(1);
    expect(screen.getAllByText('Spiritual concepts')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Anna' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Spiritual concepts' })).toBeTruthy();
  });

  it('expanded: the chevron button stays and collapses the list again', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    const toggle = screen.getByTestId('song-meta-line');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label') ?? toggle.textContent).toMatch(/hide/i);
    fireEvent.click(toggle);
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.getByTestId('song-meta-line').textContent).toContain('Anna');
  });

  it('links are underlined all the time (touch has no hover)', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    for (const a of screen.getAllByRole('link')) {
      expect(a.className).toMatch(/(^|\s)underline(\s|$)/);
      expect(a.className).not.toMatch(/hover:underline/);
    }
  });
});
