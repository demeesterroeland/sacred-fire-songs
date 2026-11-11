// Story 6.1.10 / G2.5 (#394): transpose from the reader toolbar (L2, pure logic).
import { describe, expect, it } from 'vitest';
import {
  MAX_SEMITONES,
  MIN_SEMITONES,
  canTranspose,
  formatSemitones,
  shiftSemitones,
  transposeChordPro,
  transposeKey,
} from '@/lib/reader/transpose';

describe('transposeKey', () => {
  it('moves a key up by semitones (E +2 → F#)', () => {
    expect(transposeKey('E', 2)).toBe('F#');
  });
  it('keeps minor and extensions', () => {
    expect(transposeKey('Am', 3)).toBe('Cm');
    expect(transposeKey('F#m7', 1)).toBe('Gm7');
  });
  it('is the identity at 0 and for unreadable keys', () => {
    expect(transposeKey('E', 0)).toBe('E');
    expect(transposeKey('???', 2)).toBe('???');
    expect(transposeKey(null, 2)).toBeNull();
    expect(transposeKey('', 2)).toBe('');
  });
});

describe('transposeChordPro', () => {
  const song = ['{start_of_verse: Verse 1}', '[E]Danza del [A]cielo', '[B]Baila con el [E/G#]viento', '{end_of_verse}'].join('\n');

  it('shifts every chord and leaves lyrics and directives untouched', () => {
    expect(transposeChordPro(song, 2)).toBe(
      ['{start_of_verse: Verse 1}', '[F#]Danza del [B]cielo', '[C#]Baila con el [F#/A#]viento', '{end_of_verse}'].join('\n'),
    );
  });
  it('returns the very same text at 0 semitones', () => {
    expect(transposeChordPro(song, 0)).toBe(song);
  });
  it('keeps tokens that are not chords (N.C., *)', () => {
    expect(transposeChordPro('[N.C.]Hush [E]now [*]x', 2)).toBe('[N.C.]Hush [F#]now [*]x');
  });
  it('also reads chords written above the lyrics', () => {
    const over = 'E        A\nDanza del cielo';
    expect(transposeChordPro(over, 2)).toContain('[F#]');
    expect(transposeChordPro(over, 2)).toContain('[B]');
  });
  it('a full octave is the original again', () => {
    expect(transposeChordPro('[Em7/B]x', 12)).toBe('[Em7/B]x');
  });
});

describe('transposeChordPro: section labels are not chords', () => {
  it.each(['Chorus', 'Coro', 'Bridge', 'Coda', 'Estribillo', 'Intro', 'Fine', 'Ending'])('leaves [%s] alone', (label) => {
    expect(transposeChordPro(`[${label}]\n[E]Hola`, 2)).toBe(`[${label}]\n[F#]Hola`);
  });
  it('still shifts slash chords, extensions and flats', () => {
    expect(transposeChordPro('[C/E]a [Am7]b [Bb]c [Gsus4]d [Em7b5]e [D(add9)]f [F#m]g', 2)).toBe(
      '[D/F#]a [Bm7]b [C]c [Asus4]d [F#m7b5]e [E(add9)]f [G#m]g',
    );
  });
  it('does not touch D.C. or N.C.', () => {
    expect(transposeChordPro('[D.C.]x [N.C.]y', 3)).toBe('[D.C.]x [N.C.]y');
  });
});

describe('transposeChordPro: bare chord lines without a lyric below', () => {
  it('shifts a chord line at the end of the song', () => {
    expect(transposeChordPro('E        A\nDanza del cielo\nE   A', 2)).toBe('[F#]Danza del[B] cielo\nF#   B');
  });
  it('shifts consecutive chord lines (an intro)', () => {
    expect(transposeChordPro('E A\nB E\nDanza', 2)).toBe('F# B\n[C#]Da[F#]nza');
  });
  it('shifts a chord line right before a directive', () => {
    expect(transposeChordPro('E A\n{start_of_verse}\n[E]Hola', 2)).toBe('F# B\n{start_of_verse}\n[F#]Hola');
  });
  it('keeps bars and comments in a bare chord line', () => {
    expect(transposeChordPro('| E | A | (intro)\n{c: x}', 2)).toBe('| F# | B | (intro)\n{c: x}');
  });
});

describe('transposeChordPro: spelling follows the target key', () => {
  it('uses flats in a flat target key (A +1 in F → Bb, not A#)', () => {
    // song in E, +1 gives F; its chords are spelled with flats
    expect(transposeChordPro('[A]x [C#m]y', 1, { key: 'E' })).toBe('[Bb]x [Dm]y');
    expect(transposeChordPro('[D]x [E]y', 3, { key: 'D' })).toBe('[F]x [G]y');
    expect(transposeChordPro('[A]x', 1, { key: 'E' })).toBe('[Bb]x');
  });
  it('keeps sharps in a sharp target key', () => {
    expect(transposeChordPro('[E]x [A]y', 2, { key: 'E' })).toBe('[F#]x [B]y');
  });
  it('uses flats for the bass note too', () => {
    expect(transposeChordPro('[A/E]x', 1, { key: 'E' })).toBe('[Bb/F]x');
  });
  it('without a key, the first chord stands in for it', () => {
    expect(transposeChordPro('[A]x', 1)).toBe('[Bb]x');
    expect(transposeChordPro('[C]x [F]y [G]z', 1)).toBe('[Db]x [Gb]y [Ab]z');
    expect(transposeChordPro('[E]x [G#m]y', 2)).toBe('[F#]x [A#m]y');
  });
  it('never spells a natural note as E#, B#, Cb or Fb', () => {
    // key A +1 → Bb: E moves to F, not E#
    expect(transposeChordPro('[A]x [D]y [E]z', 1, { key: 'A' })).toBe('[Bb]x [Eb]y [F]z');
    // key D −1 → Db: C# … C moves to B, not Cb
    expect(transposeChordPro('[C]x', -1, { key: 'D' })).toBe('[B]x');
    // key G +2 → A: Bb moves to C, not B#
    expect(transposeChordPro('[Bb]x', 2, { key: 'G' })).toBe('[C]x');
    expect(transposeChordPro('[Am7/G]x [F#m7b5]y', 1, { key: 'G' })).toBe('[Bbm7/Ab]x [Gm7b5]y');
  });
});

describe('transposeKey: the usual key name', () => {
  it('names the new key the way musicians write it', () => {
    expect(transposeKey('G', 3)).toBe('Bb');
    expect(transposeKey('C', 3)).toBe('Eb');
    expect(transposeKey('G', 1)).toBe('Ab');
    expect(transposeKey('C', 1)).toBe('Db');
    expect(transposeKey('E', 2)).toBe('F#');
    expect(transposeKey('Am', 1)).toBe('Bbm');
    expect(transposeKey('Am', 4)).toBe('C#m');
    expect(transposeKey('Em', 4)).toBe('G#m');
    expect(transposeKey('Am', 6)).toBe('Ebm');
  });
  it('reads maj as major, not minor', () => {
    expect(transposeKey('Cmaj7', 3)).toBe('Ebmaj7');
    expect(transposeChordPro('[C]x', 1, { key: 'Cmaj7' })).toBe('[Db]x');
  });
  it('spells the chords for that key (G +3 → Bb uses flats)', () => {
    expect(transposeChordPro('[G]x [D]y [Em]z', 3, { key: 'G' })).toBe('[Bb]x [F]y [Gm]z');
  });
});

describe('semitone steps', () => {
  it('+ and − move by one and stop at ±11', () => {
    expect(shiftSemitones(0, 1)).toBe(1);
    expect(shiftSemitones(0, -1)).toBe(-1);
    expect(shiftSemitones(MAX_SEMITONES, 1)).toBe(MAX_SEMITONES);
    expect(shiftSemitones(MIN_SEMITONES, -1)).toBe(MIN_SEMITONES);
    expect(MAX_SEMITONES).toBe(11);
    expect(MIN_SEMITONES).toBe(-11);
  });
  it('formats with a sign (text, never colour)', () => {
    expect(formatSemitones(0)).toBe('0');
    expect(formatSemitones(2)).toBe('+2');
    expect(formatSemitones(-3)).toBe('−3');
  });
});

describe('canTranspose (musicians only)', () => {
  it('allows musician, expert and admin', () => {
    expect(canTranspose('musician')).toBe(true);
    expect(canTranspose('expert')).toBe(true);
    expect(canTranspose('admin')).toBe(true);
  });
  it('refuses members, gatekeepers, guests and signed-out visitors', () => {
    for (const r of ['member', 'gatekeeper', 'guest', undefined, null]) expect(canTranspose(r)).toBe(false);
  });
});

// Story 6.2.16 / G4.2 (#519): "A7/C7" is two alternative chords, not a slash chord.
describe('transposeChordPro: alternative chords (A7/C7)', () => {
  const t = (chord: string, n: number, key?: string) => transposeChordPro(`[${chord}]x`, n, { key }).slice(1, -2);

  it('transposes both chords of an alternative together', () => {
    expect(t('A7/C7', 2)).toBe('B7/D7');
    expect(t('C/G7', 2)).toBe('D/A7');
    expect(t('Am/Em', 2)).toBe('Bm/F#m');
    expect(t('G/Bm', 2)).toBe('A/C#m');
    expect(t('Asus4/D7', 2)).toBe('Bsus4/E7');
  });
  it('keeps a slash chord with a bare bass note a slash chord', () => {
    expect(t('C/E', 2)).toBe('D/F#');
    expect(t('Am/C', 2)).toBe('Bm/D');
    expect(t('D/F#', 2)).toBe('E/G#');
    expect(t('G/B', 2)).toBe('A/C#');
    expect(t('A/Bb', 1, 'E')).toBe('Bb/B');
  });
  it('keeps a chord with a quality and a bass note (Am7/D) as one chord', () => {
    expect(t('Am7/D', 2)).toBe('Bm7/E');
  });
  it('spells both halves by the target key', () => {
    expect(t('A7/C7', 1, 'E')).toBe('Bb7/Db7');
    expect(t('A7/C7', 3, 'E')).toBe('C7/D#7'); // E → G: a sharp key
    expect(t('A7/C7', 2, 'E')).toBe('B7/D7');
  });
  it('is the original again after an octave', () => {
    expect(t('A7/C7', 12)).toBe('A7/C7');
  });
  it('also reads an alternative on a chord line above the lyrics', () => {
    const over = 'A7/C7    D\nDanza del cielo';
    expect(transposeChordPro(over, 2)).toBe('[B7/D7]Danza del[E] cielo');
  });
  it('stays out of the way of section labels', () => {
    expect(t('Chorus/Coda', 2)).toBe('Chorus/Coda');
  });
});
