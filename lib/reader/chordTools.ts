/**
 * Chord tools in one place (#566). Pure (no React, no I/O), so the page and the Gherkin steps run the same rules.
 *
 *  - Chords are "on" when the text on screen has chords and the reader's Chords switch is on.
 *  - While they are on, the transpose stepper sits next to the switch (for readers who may transpose, see
 *    `canTranspose`) and the meta line names key, capo and tuning; the key follows the transpose.
 *  - While they are off, both go. The lyrics, and the beats of the version (owner default: they matter to singers
 *    too), stay.
 *  - A song without chords has no switch, no stepper and no key, capo or tuning line, whatever the stored
 *    Chords preference says.
 */
export interface ChordToolsInput {
  /** The text on screen has chords (the Chords switch applies). */
  shownHasChords: boolean;
  /** The reader's Chords switch (stored preference). */
  chordsPref: boolean;
  /** The reader may transpose the text on screen (`mayTranspose` of the reading state). */
  mayTranspose: boolean;
}

export interface ChordTools {
  /** Chords are on screen. */
  chordsOn: boolean;
  /** The transpose stepper shows in the toolbar. */
  showStepper: boolean;
  /** Key, capo and tuning show in the meta line. */
  showChordDetails: boolean;
}

export function chordTools({ shownHasChords, chordsPref, mayTranspose }: ChordToolsInput): ChordTools {
  const chordsOn = shownHasChords && chordsPref;
  return { chordsOn, showStepper: chordsOn && mayTranspose, showChordDetails: chordsOn };
}
