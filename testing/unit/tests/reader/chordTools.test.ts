// Chord tools in one place (#566): which chord controls and details the reader sees (L2).
import { describe, expect, it } from 'vitest';
import { chordTools } from '@/lib/reader/chordTools';

describe('chordTools', () => {
  it('chords on: the stepper (for those who may transpose) and the key, capo and tuning show', () => {
    expect(chordTools({ shownHasChords: true, chordsPref: true, mayTranspose: true })).toEqual({
      chordsOn: true,
      showStepper: true,
      showChordDetails: true,
    });
  });

  it('chords off: no stepper and no key, capo or tuning (the lyrics are not this function’s business)', () => {
    expect(chordTools({ shownHasChords: true, chordsPref: false, mayTranspose: true })).toEqual({
      chordsOn: false,
      showStepper: false,
      showChordDetails: false,
    });
  });

  it('chords on for someone who may not transpose: details show, no stepper', () => {
    expect(chordTools({ shownHasChords: true, chordsPref: true, mayTranspose: false })).toEqual({
      chordsOn: true,
      showStepper: false,
      showChordDetails: true,
    });
  });

  it('a song without chords has neither, whatever the stored Chords preference says', () => {
    expect(chordTools({ shownHasChords: false, chordsPref: true, mayTranspose: false })).toEqual({
      chordsOn: false,
      showStepper: false,
      showChordDetails: false,
    });
  });

  it('never shows the stepper when transposing is not allowed (e.g. a translation on its own)', () => {
    expect(chordTools({ shownHasChords: true, chordsPref: true, mayTranspose: false }).showStepper).toBe(false);
  });
});
