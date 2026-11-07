// @vitest-environment jsdom
// Validation 2, item 16 (parser rule: lib/chordUtils.ts, tests in chordUtils.test.ts, from the re-review patch): rendered, a line
// that holds only [Chorus] / [Bridge] / [Coda] is text in a lyrics-only version and never a chord in a version with chords.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import SongDisplay from '@/components/song/SongDisplay';

vi.mock('@/context/LocaleContext', () => ({ useLocale: () => ({ t: (k: string) => k }) }));
afterEach(cleanup);

describe('SongDisplay: section labels', () => {
  const lyricsOnly = '[Verse]\nFire in the night\n[Chorus]\nRise up now\n[Bridge]\nStay with me\n[Coda]\nSlowly home';

  it('shows the labels as plain text in a lyrics-only version', () => {
    render(<SongDisplay content={lyricsOnly} hasChords={false} />);
    const display = screen.getByTestId('song-display');
    for (const label of ['Verse', 'Chorus', 'Bridge', 'Coda']) expect(within(display).getByText(label)).toBeTruthy();
    expect(within(display).queryAllByTestId('chord')).toHaveLength(0);
    expect(display.textContent?.replace(/\u00a0/g, ' ')).toContain('Rise up now');
  });

  it('does not draw a label as a chord in a version with real chords', () => {
    render(<SongDisplay content={'[Chorus]\n[Am]Rise [G]up'} hasChords showChords />);
    const chords = screen.getAllByTestId('chord').map((c) => c.textContent);
    expect(chords).toEqual(['Am', 'G']);
    expect(screen.getByText('Chorus')).toBeTruthy();
  });

  it('keeps the label when the chords layer is switched off', () => {
    render(<SongDisplay content={'[Chorus]\n[Am]Rise up'} hasChords showChords={false} />);
    expect(screen.queryAllByTestId('chord')).toHaveLength(0);
    expect(screen.getByText('Chorus')).toBeTruthy();
  });
});
