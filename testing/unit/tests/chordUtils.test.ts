import { describe, it, expect } from 'vitest';
import { parseChordProForDisplay } from '@/lib/chordUtils';

describe('parseChordPro', () => {
    it('parses a basic ChordPro string', () => {
        const chordPro = "{title: Test Song}\n[Am]Hello [G]World";
        const sections = parseChordProForDisplay(chordPro);

        // Should produce one section containing one line
        expect(sections.length).toBe(1);
        expect(sections[0].lines.length).toBe(1);

        const contentLine = sections[0].lines[0];
        expect(contentLine.items[0].chords).toBe('Am');
        expect(contentLine.items[0].lyrics).toBe('Hello ');
        expect(contentLine.items[1].chords).toBe('G');
        expect(contentLine.items[1].lyrics).toBe('World');
    });
});

// A bracketed section label alone on its line is text for the reader, not a chord (validation 1 review, M6).
describe('section labels in brackets', () => {
  const lineItems = (content: string) => parseChordProForDisplay(content).flatMap((s) => s.lines.map((l) => l.items));

  it('turns a label alone on its line into a comment, so it shows with chords on and off', () => {
    expect(lineItems('[Chorus]\nSing the morning')[0]).toEqual([{ comment: 'Chorus' }]);
  });

  it('keeps several labels on one line', () => {
    expect(lineItems('[Bridge] [Coda]')[0].map((i) => i.comment)).toEqual(['Bridge', 'Coda']);
  });

  it('leaves a chord alone on its line, and a chord line with one unknown token, as chords', () => {
    expect(lineItems('[Am]')[0][0]).toMatchObject({ chords: 'Am' });
    expect(lineItems('[Am] [N.C.]')[0].some((i) => i.chords === 'Am')).toBe(true);
    expect(lineItems('[Am] [N.C.]')[0].every((i) => i.comment === undefined)).toBe(true);
  });

  it('leaves a bracket in front of lyrics as it was', () => {
    expect(lineItems('[Chorus]Sing')[0][0]).toMatchObject({ chords: 'Chorus', lyrics: 'Sing' });
  });
});

// Review round: a label-only line must not swallow a real chord. `isChordToken` (shared with the transposer and a
// deployed SQL helper) is narrower than what musicians write, so the display rule has its own wider "looks like a chord".
describe('a chord alone on its line stays a chord', () => {
  const lineItems = (content: string) => parseChordProForDisplay(content).flatMap((s) => s.lines.map((l) => l.items));

  it.each(['B♭', 'C6/9', 'F♯m7', 'Cmaj7#11', 'G/B', 'Dsus4', 'A7(b9)', 'E♭/G', 'Bb', 'Am'])('[%s] alone is in the chord row', (chord) => {
    const items = lineItems(`[${chord}]`)[0];
    expect(items[0]).toMatchObject({ chords: chord });
    expect(items.every((i) => i.comment === undefined)).toBe(true);
  });

  it.each(['am', 'Hm', 'Re', 'Do', 'Chorus', 'Coda', 'Bridge', 'Intro', 'N.C.'])('[%s] alone is comment text', (word) => {
    const items = lineItems(`[${word}]`)[0];
    expect(items.map((i) => i.comment)).toEqual([word]);
    expect(items.every((i) => !i.chords)).toBe(true);
  });

  it('a line of only chords and a label-like word stays chords', () => {
    expect(lineItems('[B♭] [Chorus]')[0].every((i) => i.comment === undefined)).toBe(true);
  });
});


// Story 6.2.16 (#519): a chords-over-lyrics line with an alternative chord is now read as chords.
describe('alternative chords on a chord line above the lyrics', () => {
    it('shows A7/C7 as one chord over its syllable, not as lyric text', () => {
        const sections = parseChordProForDisplay('A7/C7   D\nla la la');
        const items = sections.flatMap((s) => s.lines).flatMap((l) => l.items);
        expect(items.map((i) => i.chords).filter(Boolean)).toEqual(['A7/C7', 'D']);
        expect(items.map((i) => i.lyrics ?? '').join('')).not.toContain('A7/C7');
    });
    it('shows a bracketed A7/C7 as written', () => {
        const items = parseChordProForDisplay('[A7/C7]la la').flatMap((s) => s.lines).flatMap((l) => l.items);
        expect(items[0].chords).toBe('A7/C7');
    });
});
