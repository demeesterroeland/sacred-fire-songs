/**
 * Stanzas of a song text, and the pairing of the original with a translation for the "both" reading view
 * (Epic 6.2, Story 6.2.14 / G3.2, #517). Pure (no React, no I/O) so the reader and the Gherkin steps share it.
 *
 * A stanza is a section of `parseChordProForDisplay`: lines up to a blank line, or a `{start_of_verse}` /
 * `{start_of_chorus}` (`{soc}`) / `{start_of_bridge}` section. CRLF is read like LF.
 *
 * Decisions (documented in the design doc):
 *  - Stanza n of the original goes with stanza n of the translation. Extra stanzas on either side are shown on their
 *    own row: nothing is dropped.
 *  - A stanza that is not sung (only chords, such as an intro, or only a comment) gets a row of its own and does not
 *    use up a stanza of the other text, so one chord intro does not shift every pair below it.
 *  - The translation is lyrics only in this view: chords belong to the melody of the original, and repeating them on
 *    the translation would double the height of every stanza while they rarely fit the translated words.
 */
import { parseChordProForDisplay, type ChordProItem, type ChordProSection } from '@/lib/chordUtils';
import { chordPx, lyricPx } from '@/lib/reader/readerPrefs';

export interface StanzaPair {
  original: ChordProSection | null;
  translation: ChordProSection | null;
}

/** The stanzas of a song text (ChordPro or chords-over-lyrics). */
export function stanzas(content: string): ChordProSection[] {
  return parseChordProForDisplay(content.replace(/\r\n?/g, '\n'));
}

const hasLyrics = (item: ChordProItem) => item.comment === undefined && !!item.lyrics?.trim();

/** True when the stanza has words to sing (not only chords or comments). */
export function isSung(section: ChordProSection): boolean {
  return section.lines.some((line) => line.items.some(hasLyrics));
}

/**
 * The stanza without its chords: chord-only items and lines go, comments and repeat marks stay. `null` when nothing is
 * left to show (a chord intro).
 */
export function lyricsOnly(section: ChordProSection): ChordProSection | null {
  const lines = section.lines
    .map((line) => ({
      ...line,
      items: line.items
        .filter((item) => item.comment !== undefined || !!item.lyrics)
        .map((item) => (item.comment !== undefined ? item : { lyrics: item.lyrics })),
    }))
    .filter((line) => line.items.some((item) => item.comment !== undefined || hasLyrics(item)));
  return lines.length > 0 ? { ...section, lines } : null;
}

/** Pairs stanza n with stanza n; unsung stanzas and the extra stanzas of the longer text get a row of their own. */
export function pairStanzas(original: ReadonlyArray<ChordProSection>, translation: ReadonlyArray<ChordProSection>): StanzaPair[] {
  const pairs: StanzaPair[] = [];
  let i = 0;
  let j = 0;
  while (i < original.length || j < translation.length) {
    const o = original[i];
    const tr = translation[j];
    if (o && !isSung(o)) {
      pairs.push({ original: o, translation: null });
      i++;
    } else if (tr && !isSung(tr)) {
      pairs.push({ original: null, translation: tr });
      j++;
    } else {
      pairs.push({ original: o ?? null, translation: tr ?? null });
      if (o) i++;
      if (tr) j++;
    }
  }
  return pairs;
}

/** The pairs of the "both" view: the original as given (with chords), the translation lyrics only. */
export function bilingualStanzas(originalContent: string, translationContent: string): StanzaPair[] {
  const translated = stanzas(translationContent)
    .map(lyricsOnly)
    .filter((s): s is ChordProSection => s !== null);
  return pairStanzas(stanzas(originalContent), translated);
}

/** One column of a row of the "both" view, with what the reader draws it with. */
export interface BilingualColumn {
  section: ChordProSection;
  /** Chords drawn: the original's follow the Chords switch, the translation never has any. */
  chordsOn: boolean;
  /** A− / A+ size the two columns alike. */
  lyricPx: number;
  chordPx: number;
  /** Language tag of the column (`undefined`: the original, whose language is not stored, inherits the page's). */
  lang: string | undefined;
  /** Direction of the column, read from its lyrics (`lyricsDirection`), so a right-to-left text flows right to left. */
  dir: TextDirection;
}

export interface BilingualRow {
  original: BilingualColumn | null;
  translation: BilingualColumn | null;
}

export interface BilingualOptions {
  /** Tag of the translation. */
  language: string;
  /** Reader text size step (A− / A+). */
  step: number;
  /** The original has chords. */
  hasChords: boolean;
  /** The Chords switch. */
  showChords: boolean;
}

export type TextDirection = 'ltr' | 'rtl';

/** Letters of the right-to-left scripts (Hebrew, Arabic, Syriac, Thaana, N'Ko, Samaritan, Mandaic and their forms). */
const RTL_LETTER = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;

/**
 * Direction of a text from the first letter of its lyrics. Not `dir="auto"`: the browser would read the first strong
 * character in the column, which is a chord name (`[G]`, always Latin) on a song with chords, and turn a Hebrew
 * original left to right. Chords and comments are skipped; a text without letters reads left to right.
 */
export function lyricsDirection(sections: ReadonlyArray<ChordProSection>): TextDirection {
  for (const section of sections) {
    for (const line of section.lines) {
      for (const item of line.items) {
        if (item.comment !== undefined) continue;
        const letter = item.lyrics?.match(/\p{L}/u)?.[0];
        if (letter) return RTL_LETTER.test(letter) ? 'rtl' : 'ltr';
      }
    }
  }
  return 'ltr';
}

/** The rows the "both" view draws: one per stanza pair, each column with its size, chords, language and direction. */
export function bilingualRows(originalContent: string, translationContent: string, options: BilingualOptions): BilingualRow[] {
  const size = { lyricPx: lyricPx(options.step), chordPx: chordPx(options.step) };
  const chordsOn = options.hasChords && options.showChords;
  const pairs = bilingualStanzas(originalContent, translationContent);
  // One direction per column, from all of its stanzas: a chord-only intro or a short line does not flip one row.
  const originalDir = lyricsDirection(pairs.flatMap((p) => (p.original ? [p.original] : [])));
  const translationDir = lyricsDirection(pairs.flatMap((p) => (p.translation ? [p.translation] : [])));
  return pairs.map((pair) => ({
    original: pair.original ? { section: pair.original, chordsOn, lang: undefined, dir: originalDir, ...size } : null,
    translation: pair.translation
      ? { section: pair.translation, chordsOn: false, lang: options.language, dir: translationDir, ...size }
      : null,
  }));
}
