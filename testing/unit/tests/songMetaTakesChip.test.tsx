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
