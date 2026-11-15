// @vitest-environment jsdom
// #565: the song page meta line shows "No artist" for a song without an author, as plain text (a link to
// ?artist=No artist would find nothing). An author entered as "Traditional" stays a "Traditional" link.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { SongMetaLines } from '@/components/song/SongMetaLines';
import { DICTIONARIES } from '@/lib/i18n';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string) => (DICTIONARIES.en as Record<string, string>)[k] ?? k,
  }),
}));

afterEach(cleanup);

describe('SongMetaLines — song without an author (#565)', () => {
  it('shows "No artist" as plain text, never "Traditional"', () => {
    const { container } = render(<SongMetaLines originalAuthor={null} />);
    expect(screen.getAllByText('No artist').length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'No artist' })).toBeNull();
    expect(container.textContent).not.toContain('Traditional');
  });

  it('keeps an author entered as Traditional as a link', () => {
    render(<SongMetaLines originalAuthor="Traditional" />);
    expect(screen.getByRole('link', { name: 'Traditional' }).getAttribute('href')).toBe('/songs?artist=Traditional');
  });
});
