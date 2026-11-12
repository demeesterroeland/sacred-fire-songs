// @vitest-environment jsdom
// Story 6.2.7 / G1.2 (#510): the meta line shows key, capo, tuning and beats of the version shown (L3, real English copy).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SongMetaLines } from '@/components/song/SongMetaLines';
import { DICTIONARIES } from '@/lib/i18n';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, vars?: Record<string, string | number>) =>
      ((DICTIONARIES.en as Record<string, string>)[k] ?? k).replace(/\{(\w+)\}/g, (_, name: string) =>
        String(vars?.[name] ?? `{${name}}`)
      ),
  }),
}));

afterEach(cleanup);

const technicalText = () => screen.queryByTestId('song-technical-line')?.textContent ?? null;

describe('SongMetaLines — beats in the technical line', () => {
  it('shows key, capo, tuning and beats of the version after opening the details', () => {
    render(<SongMetaLines originalAuthor="Anna" version={{ key: 'E', capo: 5, tuning: null, beats: '8' }} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBe('Key E · Capo 5 · Standard · Beats 8');
  });

  it('shows the line when the version has only beats', () => {
    render(<SongMetaLines originalAuthor="Anna" version={{ key: null, capo: null, tuning: null, beats: '8y4' }} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBe('Beats 8y4');
  });

  it('shows nothing for a blank beats value', () => {
    render(<SongMetaLines originalAuthor="Anna" version={{ key: null, capo: null, tuning: null, beats: '  ' }} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBeNull();
  });

  // Meta line follows the selected version: the page re-renders with the version switched to.
  it('follows the selected version when the page switches versions', () => {
    const { rerender } = render(
      <SongMetaLines originalAuthor="Anna" version={{ key: 'E', capo: 5, tuning: null, beats: '8' }} />
    );
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBe('Key E · Capo 5 · Standard · Beats 8');

    rerender(<SongMetaLines originalAuthor="Anna" version={{ key: 'G', capo: 0, tuning: null, beats: null }} />);
    expect(technicalText()).toBe('Key G · Standard');
  });

  // Transposed key keeps working: the page passes the version with the shifted key and keeps its beats.
  it('shows the transposed key together with the beats', () => {
    render(<SongMetaLines originalAuthor="Anna" version={{ key: 'F', capo: 5, tuning: null, beats: '8' }} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBe('Key F · Capo 5 · Standard · Beats 8');
  });
});
