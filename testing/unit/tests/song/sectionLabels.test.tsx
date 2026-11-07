// @vitest-environment jsdom
// Validation 2, item 16: a bracketed word that is not a chord ([Chorus], [Bridge], [Coda]) is a section label.
// It shows as plain text in a lyrics-only version (it used to vanish: no chord layer) and never as a chord in a
// version with real chords. "Not a chord" is the one grammar of isChordToken.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { parseChordProForDisplay } from '@/lib/chordUtils';
import SongDisplay from '@/components/song/SongDisplay';

vi.mock('@/context/LocaleContext', () => ({ useLocale: () => ({ t: (k: string) => k }) }));
afterEach(cleanup);

describe('parseChordProForDisplay: section labels', () => {
  it('turns [Chorus] into a label item, not a chord', () => {
    const items = parseChordProForDisplay('[Chorus]\nla la la').flatMap((s) => s.lines.flatMap((l) => l.items));
    const label = items.find((i) => i.isSectionLabel);
    expect(label).toMatchObject({ comment: 'Chorus', isSectionLabel: true });
    expect(items.some((i) => i.chords === 'Chorus')).toBe(false);
  });

  it('keeps real chords as chords, including ones with a bass note', () => {
    const items = parseChordProForDisplay('[Am]la [G/B]la').flatMap((s) => s.lines.flatMap((l) => l.items));
    expect(items.map((i) => i.chords).filter(Boolean)).toEqual(['Am', 'G/B']);
    expect(items.some((i) => i.isSectionLabel)).toBe(false);
  });

  it('keeps the lyrics that follow a label on the same line', () => {
    const items = parseChordProForDisplay('[Coda]slowly home').flatMap((s) => s.lines.flatMap((l) => l.items));
    expect(items.find((i) => i.isSectionLabel)?.comment).toBe('Coda');
    expect(items.map((i) => i.lyrics ?? '').join('')).toContain('slowly');
  });
});

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
