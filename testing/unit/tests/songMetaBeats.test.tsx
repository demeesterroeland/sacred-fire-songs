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
  it('shows key, capo and beats of the version after opening the details, omitting standard tuning', () => {
    render(<SongMetaLines originalAuthor="Anna" version={{ key: 'E', capo: 5, tuning: null, beats: '8' }} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBe('Key E · Capo 5 · Beats 8');
  });

  it('omits "Standard" when tuning is explicitly Standard', () => {
    render(<SongMetaLines originalAuthor="Anna" version={{ key: 'Am', capo: 2, tuning: 'Standard', beats: '8' }} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBe('Key Am · Capo 2 · Beats 8');
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
    expect(technicalText()).toBe('Key E · Capo 5 · Beats 8');

    rerender(<SongMetaLines originalAuthor="Anna" version={{ key: 'G', capo: 0, tuning: null, beats: null }} />);
    expect(technicalText()).toBe('Key G');
  });

  // Transposed key keeps working: the page passes the version with the shifted key and keeps its beats.
  it('shows the transposed key together with the beats', () => {
    render(<SongMetaLines originalAuthor="Anna" version={{ key: 'F', capo: 5, tuning: null, beats: '8' }} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBe('Key F · Capo 5 · Beats 8');
  });
});

// Chord tools in one place (#566): key, capo and tuning only while chords are on; beats stay.
describe('SongMetaLines — chords off', () => {
  const version = { key: 'D', capo: 2, tuning: 'Drop D', beats: '8' };

  it('chords on (the default): the whole technical line, with the key it is given (D → E after +2)', () => {
    render(<SongMetaLines originalAuthor="Anna" version={{ ...version, key: 'E' }} chordsOn />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBe('Key E · Capo 2 · Tuning: Drop D · Beats 8');
  });

  it('chords off: no key, capo or tuning; the beats stay', () => {
    render(<SongMetaLines originalAuthor="Anna" version={version} chordsOn={false} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBe('Beats 8');
  });

  it('chords off and no beats: no technical line at all', () => {
    render(<SongMetaLines originalAuthor="Anna" version={{ ...version, beats: null }} chordsOn={false} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBeNull();
  });

  it('chords on, after +2: "Key E · Tuning: Drop D", with no "(was D)" or other hint', () => {
    render(<SongMetaLines originalAuthor="Anna" version={{ key: 'E', capo: null, tuning: 'Drop D' }} chordsOn />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBe('Key E · Tuning: Drop D');
  });

  it('follows the Chords switch without a reload', () => {
    const { rerender } = render(<SongMetaLines originalAuthor="Anna" version={version} chordsOn />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBe('Key D · Capo 2 · Tuning: Drop D · Beats 8');
    rerender(<SongMetaLines originalAuthor="Anna" version={version} chordsOn={false} />);
    expect(technicalText()).toBe('Beats 8');
  });

  it('leaves the line as it was when the prop is not given', () => {
    render(<SongMetaLines originalAuthor="Anna" version={version} />);
    fireEvent.click(screen.getByTestId('song-meta-line'));
    expect(technicalText()).toBe('Key D · Capo 2 · Tuning: Drop D · Beats 8');
  });
});
