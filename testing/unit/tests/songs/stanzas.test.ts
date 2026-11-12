// Story 6.2.14 (#517): stanzas of the original and the translation, paired for the "both" reading view.
import { describe, expect, it } from 'vitest';
import type { ChordProSection } from '@/lib/chordUtils';
import { bilingualRows, bilingualStanzas, isSung, lyricsOnly, pairStanzas, stanzas } from '@/lib/songs/stanzas';
import { chordPx, lyricPx } from '@/lib/reader/readerPrefs';

const text = (section: ChordProSection | null) =>
  section?.lines.map((l) => l.items.map((i) => i.lyrics ?? i.comment ?? '').join('').trim()).join(' / ') ?? null;

describe('stanzas', () => {
  it('splits on blank lines', () => {
    expect(stanzas('One a\nOne b\n\nTwo a\n\n\nThree a').map(text)).toEqual(['One a / One b', 'Two a', 'Three a']);
  });

  it('treats CRLF like LF', () => {
    expect(stanzas('One a\r\nOne b\r\n\r\nTwo a\r\n').map(text)).toEqual(['One a / One b', 'Two a']);
  });

  it('keeps {start_of_verse} and {soc} sections as stanzas', () => {
    const content = '{start_of_verse}\nVerse line\n{end_of_verse}\n{soc}\nChorus line\n{eoc}\nLast line';
    const result = stanzas(content);
    expect(result.map(text)).toEqual(['Verse line', 'Chorus line', 'Last line']);
    expect(result.map((s) => s.type)).toEqual(['verse', 'chorus', 'none']);
  });

  it('is empty for empty content', () => {
    expect(stanzas('')).toEqual([]);
    expect(stanzas('\n\n')).toEqual([]);
  });
});

describe('lyricsOnly', () => {
  it('drops the chords, chord-only lines and a stanza with nothing left', () => {
    const [verse, intro] = [stanzas('[G]Mother [C]earth\n[D] [G]')[0], stanzas('[G] [C] [D]')[0]];
    const clean = lyricsOnly(verse)!;
    expect(clean.lines).toHaveLength(1);
    expect(clean.lines[0].items.every((i) => i.chords === undefined)).toBe(true);
    expect(text(clean)).toBe('Mother earth');
    expect(lyricsOnly(intro)).toBeNull();
  });

  it('keeps comments and repeat marks', () => {
    const [s] = stanzas('{c: slowly}\n{start_of_repeat: x2}\n[Am]Rise up\n{end_of_repeat}');
    const clean = lyricsOnly(s)!;
    expect(clean.lines[0].items[0].comment).toBe('slowly');
    expect(clean.lines[1].repeat).toMatchObject({ start: true, end: true, times: 2 });
  });
});

describe('isSung', () => {
  it('is true only for a stanza with lyrics', () => {
    expect(isSung(stanzas('Sing')[0])).toBe(true);
    expect(isSung(stanzas('[G] [C]')[0])).toBe(false);
    expect(isSung(stanzas('{c: Intro}')[0])).toBe(false);
  });
});

describe('pairStanzas', () => {
  const s = (content: string) => stanzas(content);

  it('pairs stanza n of the original with stanza n of the translation', () => {
    const pairs = pairStanzas(s('uno\n\ndos'), s('one\n\ntwo'));
    expect(pairs.map((p) => [text(p.original), text(p.translation)])).toEqual([['uno', 'one'], ['dos', 'two']]);
  });

  it('drops nothing when the original has more stanzas', () => {
    const pairs = pairStanzas(s('uno\n\ndos\n\ntres'), s('one'));
    expect(pairs.map((p) => [text(p.original), text(p.translation)])).toEqual([['uno', 'one'], ['dos', null], ['tres', null]]);
  });

  it('drops nothing when the translation has more stanzas', () => {
    const pairs = pairStanzas(s('uno'), s('one\n\ntwo'));
    expect(pairs.map((p) => [text(p.original), text(p.translation)])).toEqual([['uno', 'one'], [null, 'two']]);
  });

  it('gives a stanza without lyrics (a chord intro, a comment) a row of its own, so the sung stanzas stay aligned', () => {
    const pairs = pairStanzas(s('[G] [C]\n\nuno\n\ndos'), s('{c: Langzaam}\n\none\n\ntwo'));
    expect(pairs.map((p) => [text(p.original), text(p.translation)])).toEqual([
      ['', null],
      [null, 'Langzaam'],
      ['uno', 'one'],
      ['dos', 'two'],
    ]);
  });
});

describe('bilingualStanzas', () => {
  it('parses both texts and keeps the chords on the original only', () => {
    const pairs = bilingualStanzas('[G]Mother [C]earth\n\n[D]Sky', '[G]Moeder [C]aarde\n\n[D]Lucht');
    expect(pairs).toHaveLength(2);
    expect(pairs[0].original!.lines[0].items.some((i) => i.chords === 'G')).toBe(true);
    expect(pairs.every((p) => p.translation!.lines.every((l) => l.items.every((i) => i.chords === undefined)))).toBe(true);
    expect(text(pairs[1].translation)).toBe('Lucht');
  });

  it('is empty when both texts are empty', () => {
    expect(bilingualStanzas('', '')).toEqual([]);
  });
});

describe('bilingualRows', () => {
  const rows = (step: number, showChords = true) =>
    bilingualRows('[G]Mother [C]earth\n\n[D]Sky', 'Madre tierra\n\nCielo\n\nMar', { language: 'he', step, hasChords: true, showChords });

  it('sizes both columns alike, following A− / A+', () => {
    for (const step of [0, 4]) {
      for (const row of rows(step)) {
        for (const col of [row.original, row.translation].filter(Boolean)) {
          expect(col!.lyricPx).toBe(lyricPx(step));
          expect(col!.chordPx).toBe(chordPx(step));
        }
      }
    }
  });

  it('draws chords on the original only, and only with the Chords switch on', () => {
    expect(rows(2).map((r) => [r.original?.chordsOn ?? null, r.translation?.chordsOn ?? null])).toEqual([
      [true, false],
      [true, false],
      [null, false],
    ]);
    expect(rows(2, false).every((r) => !r.original?.chordsOn)).toBe(true);
  });

  it('gives every column dir="auto" and the translation its language', () => {
    const [row] = rows(2);
    expect(row.original).toMatchObject({ dir: 'auto', lang: undefined });
    expect(row.translation).toMatchObject({ dir: 'auto', lang: 'he' });
  });
});
