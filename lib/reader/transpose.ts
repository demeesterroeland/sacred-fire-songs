import ChordSheetJS from 'chordsheetjs';
import { READABLE_CHORD, convertChordsOverLyricsToChordPro, isChordLine, isChordOrAlternative, isChordToken, isReadableChord, splitAlternativeChords } from '@/lib/chordProParsing';

/**
 * Transpose for the reader toolbar (Epic 6.1, Story 6.1.10 / G2.5, #394).
 * Musicians shift every chord and the key by whole semitones; the stored song never changes.
 */
export const MIN_SEMITONES = -11;
export const MAX_SEMITONES = 11;

/** Next shift after pressing − (−1) or + (+1), stopping at ±11. */
export function shiftSemitones(current: number, delta: -1 | 1): number {
  return Math.min(MAX_SEMITONES, Math.max(MIN_SEMITONES, current + delta));
}

/** "+2", "−3", "0": a sign in text, never colour alone. */
export function formatSemitones(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return '0';
}

/** Transpose and Chords on-screen are for musicians, experts and admins (docs/manual/roles-and-glossary.md). */
export function canTranspose(role: string | null | undefined): boolean {
  return role === 'musician' || role === 'expert' || role === 'admin';
}

export { isChordToken };

type Accidental = 'b' | '#';

const NATURAL: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
/** Without a key: the names musicians use most (C#, Eb, F#, Ab, Bb). */
const USUAL_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
/** How a key is usually written, per pitch class. */
const MAJOR_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const MINOR_KEYS = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'Bbm', 'Bm'];

const FLAT_KEYS = new Set(['F', 'Dm', 'Gm', 'Cm', 'Fm']);
const SHARP_KEYS = new Set(['G', 'D', 'A', 'E', 'B', 'Em', 'Bm']);

/** Root (A–G, #/b), then an `m` that is minor (not the m of `maj`), then the rest. */
const KEY_PARTS = /^([A-G])([#b♯♭]?)(m(?!aj))?(.*)$/;

const GLYPH = /[♭♯]/;
/** `Bb` → `B♭`, `F#` → `F♯`: only the note name, which is all `FLAT_NAMES` / `SHARP_NAMES` hold. */
function withGlyphs(name: string): string {
  return name.replace('b', '♭').replace('#', '♯');
}

function pitchClass(letter: string, accidental: string): number {
  const offset = accidental === '#' || accidental === '♯' ? 1 : accidental === 'b' || accidental === '♭' ? -1 : 0;
  return (((NATURAL[letter] + offset) % 12) + 12) % 12;
}

function shiftPc(pc: number, semitones: number): number {
  return (((pc + semitones) % 12) + 12) % 12;
}

/** Spelling a key asks for: flats in F, Bb, Dm, Gm …; sharps in G, D, E, F#m …; none for C and Am. */
function accidentalForKey(key: string | null | undefined): Accidental | undefined {
  const m = (key ?? '').trim().match(KEY_PARTS);
  if (!m) return undefined;
  const sign = m[2] === '♭' ? 'b' : m[2] === '♯' ? '#' : m[2];
  const root = `${m[1]}${sign}${m[3] ?? ''}`;
  if (FLAT_KEYS.has(root) || sign === 'b') return 'b';
  if (SHARP_KEYS.has(root) || sign === '#') return '#';
  return undefined;
}

function noteName(pc: number, accidental?: Accidental): string {
  const names = accidental === 'b' ? FLAT_NAMES : accidental === '#' ? SHARP_NAMES : USUAL_NAMES;
  return names[pc];
}

/**
 * Root, quality and optional /bass. The quality is kept as written. The spelling of the new note follows the key
 * (`accidental`), and the sign style follows the chord: a chord written with ♭/♯ comes back with ♭/♯, one written with
 * b/# comes back with b/#.
 */
function transposeChord(chord: string, semitones: number, accidental?: Accidental): string | null {
  const m = chord.match(READABLE_CHORD);
  if (!m) return null;
  const [, letter, acc, quality, bassLetter, bassAcc] = m;
  const spell = GLYPH.test(chord) ? withGlyphs : (name: string) => name;
  const root = spell(noteName(shiftPc(pitchClass(letter, acc), semitones), accidental));
  const bass = bassLetter ? `/${spell(noteName(shiftPc(pitchClass(bassLetter, bassAcc), semitones), accidental))}` : '';
  return `${root}${quality}${bass}`;
}

/** A key such as "E", "Am" or "F#m7", named the way musicians write it (Bb, not A#); unreadable keys are returned unchanged. */
export function transposeKey<T extends string | null | undefined>(key: T, semitones: number): T {
  if (!key || semitones === 0) return key;
  const m = key.trim().match(KEY_PARTS);
  if (!m) return key;
  const pc = shiftPc(pitchClass(m[1], m[2]), semitones);
  const name = m[3] ? MINOR_KEYS[pc] : MAJOR_KEYS[pc];
  return `${GLYPH.test(m[2]) ? withGlyphs(name) : name}${m[4]}` as T;
}

export interface TransposeOptions {
  /** The key written on the song; chords are spelled to suit the key it moves to (A# in G, Bb in F). */
  key?: string | null;
}

function firstChord(chordPro: string): string | null {
  for (const line of chordPro.split('\n')) {
    const tokens = isChordLine(line) ? line.split(/\s+/) : [...line.matchAll(/\[([^\]\n]+)\]/g)].map((m) => m[1]);
    const chord = tokens.find((t) => isChordOrAlternative(t));
    if (chord) return chord.split('/')[0];
  }
  return null;
}

/** Words a chord quality may spell; what is left of a suffix after removing them must not look like a word. */
const QUALITY_WORDS = /maj|min|dim|aug|sus|add|alt|dom|mi|ma/g;
const FALLBACK_SIGNS = /[\d()+°øΔ^#♯♭−-]/;

/**
 * Last resort for a chord token the reader's own grammar does not read: ChordSheetJS may know it, so it is shifted
 * instead of being left behind while its neighbours move. Only tokens that look like a chord quality get here: a
 * suffix needs a digit, a sign or a quality word, and may not hold a word of three or more letters, so `Chorus`,
 * `Coda`, `Fine`, `Do` and `Estribillo` are never shifted.
 */
function transposeWithChordSheet(token: string, semitones: number): string {
  const m = token.match(/^[A-G][#b♯♭]?(.+)$/);
  if (!m || token.length > 32) return token;
  const suffix = m[1];
  const lettersOnly = suffix.replace(QUALITY_WORDS, '');
  if (!(FALLBACK_SIGNS.test(suffix) || lettersOnly !== suffix) || /[a-z]{3,}/.test(lettersOnly)) return token;
  try {
    return ChordSheetJS.Chord.parse(token)?.transpose(semitones).toString() ?? token;
  } catch {
    return token;
  }
}

/**
 * `A7/C7` (alternative chords) moves every chord, `C/E` (bass note) and every other chord go through `transposeChord`;
 * a token the reader cannot read goes to ChordSheetJS, and anything that is no chord stays as it is.
 */
function transposeToken(token: string, semitones: number, accidental?: Accidental): string {
  const parts = splitAlternativeChords(token) ?? [token];
  return parts
    .map((part) => (isReadableChord(part) ? transposeChord(part, semitones, accidental) ?? part : transposeWithChordSheet(part, semitones)))
    .join('/');
}

/** `{key: F}` / `{k: F}` anywhere in a line: the key the chords after it are written in. */
const KEY_DIRECTIVE = /\{(?:key|k)\s*:\s*([^}]*)\}/i;

/**
 * Shifts every `[chord]` of a song. Chords written above the lyrics are read first, so
 * both stored layouts work; a chord line that has no lyric to attach to (song end, intro,
 * before a directive) is shifted in place. Anything that is not a chord (`N.C.`, `*`,
 * `[Chorus]`) stays as it is.
 */
export function transposeChordPro(content: string, semitones: number, options: TransposeOptions = {}): string {
  if (!content || semitones === 0) return content;
  const chordPro = convertChordsOverLyricsToChordPro(content);
  // Without a written key, the first chord stands in for it (songs usually start on the tonic).
  // Spelling follows the key in effect: the song key first, then each `{key:}` directive for the lines after it (a song
  // that changes key halfway is spelled per section). It follows the key signature, not harmonic function: in G, the
  // dominant of the subdominant comes back as D#7, not Eb7.
  const accidentalFor = (key: string | null | undefined) => accidentalForKey(transposeKey(key, semitones));
  let accidental = accidentalFor(options.key || firstChord(chordPro));
  return chordPro
    .split('\n')
    .map((line) => {
      const directive = line.match(KEY_DIRECTIVE);
      if (directive?.[1].trim()) accidental = accidentalFor(directive[1].trim());
      return isChordLine(line)
        ? line.replace(/\S+/g, (tok) => transposeToken(tok, semitones, accidental))
        : line.replace(/\[([^\]\n]+)\]/g, (_m, chord: string) => `[${transposeToken(chord, semitones, accidental)}]`);
    })
    .join('\n');
}
