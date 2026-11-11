// Story 6.2.15 (#518, G4.1): {start_of_repeat} / {end_of_repeat} are parsed into a repeat mark on the lines they wrap.
// The mark lives on ChordProLine, so the reader and the PDF exporter (#520) read the same structure.
import { describe, expect, it } from 'vitest';
import { parseChordProForDisplay, parseRepeatTimes } from '@/lib/chordUtils';

const lines = (content: string) => parseChordProForDisplay(content).flatMap((s) => s.lines);
const marks = (content: string) => lines(content).map((l) => l.repeat ?? null);

describe('parseRepeatTimes', () => {
  it.each([
    ['x2', 2],
    ['X3', 3],
    ['2x', 2],
    ['×4', 4],
    ['2×', 2],
    ['3', 3],
    [' x 2 ', 2],
  ])('reads %j as %i', (value, times) => expect(parseRepeatTimes(value)).toBe(times));

  it.each(['', undefined, 'twice', 'x', 'x1', 'x0', 'x100', '2x3', '-2'])('ignores %j', (value) => {
    expect(parseRepeatTimes(value as string | undefined)).toBeUndefined();
  });
});

describe('repeat marks on lines', () => {
  it('marks the first and the last line of a repeat and keeps the others between them', () => {
    const m = marks('{start_of_repeat}\nOne\nTwo\nThree\n{end_of_repeat}\nAfter');
    expect(m).toEqual([{ start: true, end: false }, { start: false, end: false }, { start: false, end: true }, null]);
  });

  it('puts both marks on a one-line repeat', () => {
    expect(marks('Before\n{start_of_repeat}\nOnly\n{end_of_repeat}\nAfter')).toEqual([null, { start: true, end: true }, null]);
  });

  it('carries the count of the end directive, or of the start directive', () => {
    expect(marks('{start_of_repeat}\nOne\n{end_of_repeat: x2}')[0]).toEqual({ start: true, end: true, times: 2 });
    expect(marks('{start_of_repeat: 3x}\nOne\n{end_of_repeat}')[0]).toEqual({ start: true, end: true, times: 3 });
    expect(marks('{start_of_repeat: 3x}\nOne\n{end_of_repeat: x2}')[0]?.times).toBe(2);
  });

  it('leaves out the count when none is given or it makes no sense', () => {
    expect(marks('{start_of_repeat}\nOne\n{end_of_repeat}')[0]).toEqual({ start: true, end: true });
    expect(marks('{start_of_repeat}\nOne\n{end_of_repeat: whenever}')[0]).toEqual({ start: true, end: true });
  });

  it('shows the lyrics and chords of repeated lines as before', () => {
    const [line] = lines('{start_of_repeat}\n[Am]Hello [G]world\n{end_of_repeat}');
    expect(line.items.map((i) => i.chords)).toEqual(['Am', 'G']);
    expect(line.items.map((i) => i.lyrics?.trim())).toEqual(['Hello', 'world']);
  });

  it('keeps a stanza break inside a repeat and marks the whole repeat across it', () => {
    const m = marks('{start_of_repeat}\nOne\n\nTwo\n{end_of_repeat: x2}');
    expect(m).toEqual([{ start: true, end: false }, { start: false, end: true, times: 2 }]);
  });

  it('does not split a verse at the repeat directives', () => {
    const sections = parseChordProForDisplay('{start_of_verse}\nA\n{start_of_repeat}\nB\n{end_of_repeat: x2}\nC\n{end_of_verse}');
    expect(sections).toHaveLength(1);
    expect(sections[0].lines.map((l) => l.repeat ?? null)).toEqual([null, { start: true, end: true, times: 2 }, null]);
  });

  it('works inside a chorus', () => {
    const sections = parseChordProForDisplay('{start_of_chorus}\n{start_of_repeat}\nSing\n{end_of_repeat}\n{end_of_chorus}');
    expect(sections[0].type).toBe('chorus');
    expect(sections[0].lines[0].repeat).toEqual({ start: true, end: true });
  });

  it('works for chords written over the lyrics', () => {
    const content = '{start_of_repeat}\nAm      G\nHello   world\n{end_of_repeat: x2}\nF\nSlowly home';
    const [first, second] = lines(content);
    expect(first.repeat).toEqual({ start: true, end: true, times: 2 });
    expect(first.items.some((i) => i.chords === 'Am')).toBe(true);
    expect(second.repeat).toBeUndefined();
  });

  it('ignores an end without a start', () => {
    expect(marks('One\n{end_of_repeat}\nTwo')).toEqual([null, null]);
  });

  it('keeps the start bar when the repeat is never closed', () => {
    expect(marks('{start_of_repeat}\nOne\nTwo')).toEqual([{ start: true, end: false }, { start: false, end: false }]);
  });

  it('closes a repeat that is still open when the next one starts', () => {
    expect(marks('{start_of_repeat}\nOne\n{start_of_repeat}\nTwo\n{end_of_repeat}')).toEqual([
      { start: true, end: true },
      { start: true, end: true },
    ]);
  });

  it('ignores an empty repeat', () => {
    expect(marks('{start_of_repeat}\n{end_of_repeat}\nOne')).toEqual([null]);
  });

  it('leaves songs without a repeat unchanged', () => {
    expect(lines('[Am]Hello\nWorld').every((l) => l.repeat === undefined)).toBe(true);
  });
});
