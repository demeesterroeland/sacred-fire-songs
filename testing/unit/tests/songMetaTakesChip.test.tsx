// @vitest-environment jsdom
// Story 6.1.14 / G4.1 (#398): the renamed "Takes" chip renders in the real English copy (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SongMetaLines, fitLinkCount } from '@/components/song/SongMetaLines';
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

// Validation 4: author, tags and Chords · Melody · Recordings are links in both states (closed: as many as fit);
// the chevron shows the rest and the technical line. Nothing is said twice, links underlined without hover.
describe('SongMetaLines — collapsed and expanded', () => {
  const cats = [{ name: 'Spiritual concepts', slug: 'spiritual-concepts' }];

  it('collapsed: author, tags and Chords are links when they fit', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats} hasChords />);
    expect(screen.getByRole('link', { name: 'Anna' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Spiritual concepts' }).getAttribute('href')).toBe('/songs?tag=spiritual-concepts');
    expect(screen.getByRole('link', { name: 'Chords' }).getAttribute('href')).toBe('/songs?chords=true');
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
    expect(screen.getAllByRole('link', { name: 'Chords' })).toHaveLength(1);
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

// Validation 4 (owner): closed, one line with as many links as fit; "…" only when one is hidden.
describe('fitLinkCount', () => {
  // Author 0–50, tags of 40 px each with a 4 px gap: right edges 50, 94, 138, 182, 226.
  const rights = [50, 94, 138, 182, 226];

  it('shows every tag when they all fit, without "…"', () => {
    expect(fitLinkCount(rights, 1, 10, 226)).toBe(4);
    expect(fitLinkCount(rights, 1, 10, 500)).toBe(4);
  });

  it('shows as many tags as fit next to "…"', () => {
    expect(fitLinkCount(rights, 1, 10, 225)).toBe(3); // 182 + 4 + 10 = 196 fits
    expect(fitLinkCount(rights, 1, 10, 152)).toBe(2); // 138 + 4 + 10 = 152 fits
    expect(fitLinkCount(rights, 1, 10, 151)).toBe(1); // 152 does not, 94 + 14 = 108 does
  });

  it('falls back to no tags when even one does not fit, and handles no tags', () => {
    expect(fitLinkCount(rights, 1, 10, 60)).toBe(0);
    expect(fitLinkCount([50], 1, 10, 20)).toBe(0);
  });
});

describe('SongMetaLines — one line when closed', () => {
  const cats = Array.from({ length: 7 }, (_, i) => ({ name: `Tag ${i + 1}`, slug: `t${i + 1}` }));
  const item = (name: string) => screen.getByRole('link', { name }).closest('li')!;

  it('does not wrap; with room for every tag there is no "…"', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats} />);
    expect(document.getElementById(screen.getByTestId('song-meta-line').getAttribute('aria-controls')!.split(' ')[0])!.className).toContain('flex-nowrap');
    for (const c of cats) expect(item(c.name).className).not.toContain('hidden');
    expect(screen.queryByTestId('song-meta-more')).toBeNull();
  });

  it('closed, Chords is one of the links on the line when it fits, without "…"', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats.slice(0, 2)} hasChords />);
    expect(screen.getByRole('link', { name: 'Chords' }).closest('li')!.className).not.toContain('hidden');
    expect(screen.queryByTestId('song-meta-more')).toBeNull();
  });

  it('the measuring copy is hidden from screen readers and has no links', () => {
    const { container } = render(<SongMetaLines originalAuthor="Anna" categories={cats} />);
    const copy = container.querySelector('ul[aria-hidden]')!;
    expect(copy.className).toContain('invisible');
    expect(copy.querySelectorAll('a')).toHaveLength(0);
    expect(screen.getAllByRole('link')).toHaveLength(1 + cats.length);
  });

  it('open: every tag shows and the list wraps, no "…"', () => {
    render(<SongMetaLines originalAuthor="Anna" categories={cats} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    for (const c of cats) expect(item(c.name).className).not.toContain('hidden');
    expect(screen.queryByTestId('song-meta-more')).toBeNull();
  });
});
