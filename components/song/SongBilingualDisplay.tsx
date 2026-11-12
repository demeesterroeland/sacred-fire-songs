'use client';

import { useMemo } from 'react';
import SongSection from '@/components/song/SongSection';
import { MelodyNotation } from '@/components/song/SongDisplay';
import { DEFAULT_LYRIC_STEP } from '@/lib/design/tokens';
import { bilingualRows } from '@/lib/songs/stanzas';

interface SongBilingualDisplayProps {
  /** The original text as shown (transposed when the reader transposes). */
  original: string;
  /** The translation's lyrics; shown without chords. */
  translation: string;
  /** Tag of the translation (`lang` of its column). The original's language is not stored, so it inherits the page's. */
  translationLanguage: string;
  /** The original has chords (the translation never shows any here). */
  hasChords?: boolean;
  sizeStep?: number;
  showChords?: boolean;
  melodyNotation?: string;
}

/**
 * Story 6.2.14 (#517): the original and its translation, stanza by stanza. Every pair is one grid row: one column on a
 * phone (the stanza, then its translation under it), two columns from md up, so the two stanzas start on the same line.
 * A stanza without a partner keeps its own column (a lone translation stays on the right). Each column carries its
 * language and `dir="auto"`, so a right-to-left translation flows right to left; spacing uses logical sides only.
 * A− / A+ sizes both columns alike; chords (and the Chords switch) apply to the original only.
 */
export default function SongBilingualDisplay({
  original,
  translation,
  translationLanguage,
  hasChords = false,
  sizeStep = DEFAULT_LYRIC_STEP,
  showChords = true,
  melodyNotation,
}: SongBilingualDisplayProps) {
  const rows = useMemo(
    () => bilingualRows(original, translation, { language: translationLanguage, step: sizeStep, hasChords, showChords }),
    [original, translation, translationLanguage, sizeStep, hasChords, showChords]
  );
  const chordsOn = hasChords && showChords;

  return (
    <div data-testid="song-bilingual" data-chords={chordsOn ? 'on' : 'off'} className={chordsOn ? 'space-y-8' : 'space-y-6'}>
      {rows.map((row, i) => (
        <div key={i} data-testid="stanza-pair" className="grid grid-cols-1 gap-y-3 md:grid-cols-2 md:gap-x-10">
          {row.original && (
            <div data-testid="stanza-original" lang={row.original.lang} dir={row.original.dir} className="min-w-0">
              <SongSection
                section={row.original.section}
                first
                chordsOn={row.original.chordsOn}
                lyricSize={row.original.lyricPx}
                chordSize={row.original.chordPx}
              />
            </div>
          )}
          {row.translation && (
            <div
              data-testid="stanza-translation"
              lang={row.translation.lang}
              dir={row.translation.dir}
              // Phone: a thin rule on the start side ties the translation to the stanza above it. Desktop: the column says it.
              className="min-w-0 border-s-2 border-line ps-3 md:col-start-2 md:border-s-0 md:ps-0"
            >
              <SongSection
                section={row.translation.section}
                first
                chordsOn={row.translation.chordsOn}
                lyricSize={row.translation.lyricPx}
                chordSize={row.translation.chordPx}
                tone="muted"
              />
            </div>
          )}
        </div>
      ))}
      {melodyNotation && <MelodyNotation notation={melodyNotation} />}
    </div>
  );
}
