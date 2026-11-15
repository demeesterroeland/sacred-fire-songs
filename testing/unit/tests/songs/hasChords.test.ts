// Validation 1 review, M6: a bracketed word is a chord only when it is a chord token. Section labels in
// brackets ("[Chorus]", "[Bridge]", "[Coda]", "[Ending]") start with A-G but are not chords: a lyrics-only
// version must not get a Chords switch or land in the Chords filter.
import { describe, expect, it } from 'vitest';
import { hasChords } from '@/lib/chordProParsing';
import { songFlags } from '@/lib/songs/versionFlags';

describe('hasChords: bracketed tokens', () => {
  it.each(['[Chorus]', '[Bridge]', '[Coda]', '[Ending]', '[Dance]', '[Fine]', '[Grito]', '[Echo]', '[Add]', '[Abba]', '[N.C.]'])(
    '%s is a label, not a chord',
    (label) => {
      expect(hasChords(`${label}\nla la la`)).toBe(false);
      expect(songFlags([{ content_chordpro: `${label}\nla la la` }]).has_chords).toBe(false);
    },
  );

  it.each(['[A]', '[Am]', '[C#m7/G#]', '[Dsus4]', '[Bb]', '[Gmaj7]', '[F#dim]', '[Eadd9]', '[Cm7b5]', '[G/B]', '[D5]'])(
    '%s is a chord',
    (chord) => {
      expect(hasChords(`${chord}la la`)).toBe(true);
    },
  );

  it('one real chord among labels is enough', () => {
    expect(hasChords('[Chorus]\n[Am]la [G]la\n[Bridge]\nlalala')).toBe(true);
  });

  it('a lyrics-only version next to a version with chords: the song still has chords, the lyrics-only one does not', () => {
    const flags = songFlags([{ content_chordpro: '[Am]la [G]la' }, { content_chordpro: '[Chorus]\nla la' }]);
    expect(flags.has_chords).toBe(true);
    expect(hasChords('[Chorus]\nla la')).toBe(false);
  });

  // Decision (review M6): the app's chord grammar is the one the transposer uses (root A-G, uppercase, then
  // chord-quality pieces). The renderer (ChordSheetJS) prints EVERY bracket in the chord row, so it cannot tell
  // chords from labels; these lowercase / German / solfège spellings stay as they were: not chords.
  it.each(['[am]', '[Hm]', '[Re]', '[Do]', '[chorus]'])('%s is not counted as a chord', (token) => {
    expect(hasChords(`${token}la la`)).toBe(false);
  });
});
