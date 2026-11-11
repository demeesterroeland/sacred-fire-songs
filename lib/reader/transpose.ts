import { convertChordsOverLyricsToChordPro, isChordLine, isChordOrAlternative, isChordToken, splitAlternativeChords } from '@/lib/chordProParsing';

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
const KEY_PARTS = /^([A-G])([#b]?)(m(?!aj))?(.*)$/;

function pitchClass(letter: string, accidental: string): number {
  const offset = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  return (((NATURAL[letter] + offset) % 12) + 12) % 12;
}

function shiftPc(pc: number, semitones: number): number {
  return (((pc + semitones) % 12) + 12) % 12;
}

/** Spelling a key asks for: flats in F, Bb, Dm, Gm …; sharps in G, D, E, F#m …; none for C and Am. */
function accidentalForKey(key: string | null | undefined): Accidental | undefined {
  const m = (key ?? '').trim().match(KEY_PARTS);
  if (!m) return undefined;
  const root = `${m[1]}${m[2]}${m[3] ?? ''}`;
  if (FLAT_KEYS.has(root) || m[2] === 'b') return 'b';
  if (SHARP_KEYS.has(root) || m[2] === '#') return '#';
  return undefined;
}

function noteName(pc: number, accidental?: Accidental): string {
  const names = accidental === 'b' ? FLAT_NAMES : accidental === '#' ? SHARP_NAMES : USUAL_NAMES;
  return names[pc];
}

/** Root and optional /bass; the quality in between is kept as written. */
const CHORD_PARTS = /^([A-G])([#b]?)(.*?)(?:\/([A-G])([#b]?))?$/;

function transposeChord(chord: string, semitones: number, accidental?: Accidental): string {
  const m = chord.match(CHORD_PARTS);
  if (!m) return chord;
  const [, letter, acc, quality, bassLetter, bassAcc] = m;
  const root = noteName(shiftPc(pitchClass(letter, acc), semitones), accidental);
  const bass = bassLetter ? `/${noteName(shiftPc(pitchClass(bassLetter, bassAcc), semitones), accidental)}` : '';
  return `${root}${quality}${bass}`;
}

/** A key such as "E", "Am" or "F#m7", named the way musicians write it (Bb, not A#); unreadable keys are returned unchanged. */
export function transposeKey<T extends string | null | undefined>(key: T, semitones: number): T {
  if (!key || semitones === 0) return key;
  const m = key.trim().match(KEY_PARTS);
  if (!m) return key;
  const pc = shiftPc(pitchClass(m[1], m[2]), semitones);
  const name = m[3] ? MINOR_KEYS[pc] : MAJOR_KEYS[pc];
  return `${name}${m[4]}` as T;
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

/** `A7/C7` (alternative chords) moves both chords; `C/E` (bass note) and every other chord go through `transposeChord`. */
function transposeToken(token: string, semitones: number, accidental?: Accidental): string {
  const alternatives = splitAlternativeChords(token);
  if (alternatives) return alternatives.map((c) => transposeChord(c, semitones, accidental)).join('/');
  return isChordToken(token) ? transposeChord(token, semitones, accidental) : token;
}

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
  const key = options.key || firstChord(chordPro);
  const accidental = accidentalForKey(transposeKey(key, semitones));
  return chordPro
    .split('\n')
    .map((line) =>
      isChordLine(line)
        ? line.replace(/\S+/g, (tok) => transposeToken(tok, semitones, accidental))
        : line.replace(/\[([^\]\n]+)\]/g, (_m, chord: string) => `[${transposeToken(chord, semitones, accidental)}]`),
    )
    .join('\n');
}
