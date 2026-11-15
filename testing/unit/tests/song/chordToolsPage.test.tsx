// @vitest-environment jsdom
// Chord tools in one place (#566): how the song page wires them (structure guards; behaviour is in the component tests).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import SongDisplay from '@/components/song/SongDisplay';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({ t: (k: string) => k }),
}));

afterEach(cleanup);

const page = readFileSync('app/songs/[id]/page.tsx', 'utf8');

describe('song page: chord tools', () => {
  it('gives the toolbar the stepper and the meta line the chords-on flag from one pure rule', () => {
    expect(page).toContain("from '@/lib/reader/chordTools'");
    expect(page).toMatch(/chordTools\(\{[^}]*chordsPref: readerPrefs\.chords/);
    expect(page).toMatch(/chordsOn=\{tools\.showChordDetails\}/);
    expect(page).toMatch(/transpose=\{tools\.showStepper \?/);
  });

  it('passes no transpose to the ⋮ menu any more', () => {
    const menu = page.slice(page.indexOf('<SongMenuSheet'));
    expect(menu.slice(0, menu.indexOf('/>'))).not.toMatch(/transpose=/);
  });
});

describe('lyrics stay with chords off', () => {
  it('hides the chord layer only', () => {
    render(<SongDisplay content={'[D]Down to the [G]river we go'} hasChords showChords={false} />);
    expect(screen.getByTestId('song-display').getAttribute('data-chords')).toBe('off');
    expect(screen.queryAllByTestId('chord')).toHaveLength(0);
    expect(screen.getByTestId('song-display').textContent).toContain('river we go');
  });
});
