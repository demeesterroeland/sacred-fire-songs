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
  it('shows the link "Recordings" when the member has a take, and links to the filter', () => {
    render(<SongMetaLines originalAuthor="Anna" hasChords hasPersonalRecording />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    const link = screen.getByRole('link', { name: 'Recordings' });
    expect(link.getAttribute('href')).toBe('/songs?myRecordings=true');
    expect(screen.getByRole('link', { name: 'Chords' })).toBeTruthy();
  });

  it('omits the chip when the member has no take', () => {
    render(<SongMetaLines originalAuthor="Anna" />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(screen.queryByRole('link', { name: 'Recordings' })).toBeNull();
  });
});

// Validation 4: author and tags are links in both states; the chevron only adds Chords · Melody · Recordings and the
// technical line. Nothing is said twice, links underlined without hover.
describe('SongMetaLines — collapsed and expanded', () => {
  const cats = [{ name: 'Spiritual concepts', slug: 'spiritual-concepts' }];

  it('collapsed: author and tags are already links, the extra links are not there yet', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats} hasChords />);
    expect(screen.getByRole('link', { name: 'Anna' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Spiritual concepts' }).getAttribute('href')).toBe('/songs?tag=spiritual-concepts');
    expect(screen.queryByRole('link', { name: 'Chords' })).toBeNull();
    expect(screen.getByTestId('song-meta-line').getAttribute('aria-label')).toMatch(/show/i);
  });

  it('expanded: author and tags appear once, as links, plus the extra links', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats} hasChords />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(screen.getAllByText('Anna')).toHaveLength(1);
    expect(screen.getAllByText('Spiritual concepts')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Chords' })).toBeTruthy();
  });

  it('the chevron button stays and collapses again', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats} hasChords />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    const toggle = screen.getByTestId('song-meta-line');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toMatch(/hide/i);
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('link', { name: 'Chords' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Anna' })).toBeTruthy();
  });

  it('links are underlined all the time (touch has no hover)', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats} />);
    for (const a of screen.getAllByRole('link')) {
      expect(a.className).toMatch(/(^|\s)underline(\s|$)/);
      expect(a.className).not.toMatch(/hover:underline/);
    }
  });
});

describe('SongMetaLines — nothing to link (review of PR #482)', () => {
  it('renders no empty list and points the chevron at the details only', () => {
    render(<SongMetaLines originalAuthor={null} categories={[]} />);
    // "Traditional" counts as an author link when there is no author; check there is never an empty list.
    for (const ul of document.querySelectorAll('ul')) expect(ul.children.length).toBeGreaterThan(0);
    const controls = screen.getByTestId('song-meta-line').getAttribute('aria-controls')!.split(' ');
    for (const id of controls) expect(document.getElementById(id)).not.toBeNull();
  });
});

// Validation 4 (owner): closed, one line; 3 tags on a phone, 5 from md, 6 from lg, then "…".
describe('SongMetaLines — one line when closed', () => {
  const cats = Array.from({ length: 7 }, (_, i) => ({ name: `Tag ${i + 1}`, slug: `t${i + 1}` }));
  const item = (name: string) => screen.getByRole('link', { name }).closest('li')!;

  it('does not wrap, hides tags past each width and shows "…"', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats} />);
    expect(document.getElementById(screen.getByTestId('song-meta-line').getAttribute('aria-controls')!.split(' ')[0])!.className).toContain('flex-nowrap');
    expect(item('Anna').className).not.toContain('hidden');
    expect(item('Tag 3').className).not.toContain('hidden');
    expect(item('Tag 4').className).toContain('hidden md:list-item');
    expect(item('Tag 6').className).toContain('hidden lg:list-item');
    expect(screen.getByTestId('song-meta-more').className).not.toMatch(/hidden/); // 7 tags: more than every limit
  });

  it('"…" goes away at the width where every tag fits', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats.slice(0, 5)} />);
    expect(screen.getByTestId('song-meta-more').className).toContain('md:hidden');
    cleanup();
    render(<SongMetaLines originalAuthor="Anna" categories={cats.slice(0, 3)} />);
    expect(screen.queryByTestId('song-meta-more')).toBeNull();
  });

  it('open: every tag shows and the list wraps, no "…"', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    for (const c of cats) expect(item(c.name).className).not.toContain('hidden');
    expect(screen.queryByTestId('song-meta-more')).toBeNull();
  });
});
