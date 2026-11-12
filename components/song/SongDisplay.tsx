'use client';

import { parseChordProForDisplay, type ChordProSection } from '@/lib/chordUtils';
import SongSection from '@/components/song/SongSection';
import { useLocale } from '@/context/LocaleContext';
import { DEFAULT_LYRIC_STEP } from '@/lib/design/tokens';
import { chordPx, lyricPx } from '@/lib/reader/readerPrefs';

interface SongDisplayProps {
    content: string;
    melodyNotation?: string;
    hasChords?: boolean;
    /** Reader toolbar (Story 6.1.6, #390): lyric size step and chords layer. */
    sizeStep?: number;
    showChords?: boolean;
}

export default function SongDisplay({ content, melodyNotation, hasChords = false, sizeStep = DEFAULT_LYRIC_STEP, showChords = true }: SongDisplayProps) {
    const sections: ChordProSection[] = parseChordProForDisplay(content);
    const lyricSize = lyricPx(sizeStep);
    const chordSize = chordPx(sizeStep);
    // Hidden chords render nothing (not even spacers); each lyric line keeps its own row.
    const chordsOn = hasChords && showChords;

    return (
        <div className={chordsOn ? 'space-y-6' : 'space-y-4'} data-testid="song-display" data-chords={chordsOn ? 'on' : 'off'}>
            {sections.map((section, sectionIdx) => (
                <SongSection
                    key={sectionIdx}
                    section={section}
                    first={sectionIdx === 0}
                    chordsOn={chordsOn}
                    lyricSize={lyricSize}
                    chordSize={chordSize}
                />
            ))}

            {/* Melody Notation Section */}
            {melodyNotation && <MelodyNotation notation={melodyNotation} />}
        </div>
    );
}

/** The version's melody notation, below the lyrics (also below both languages, Story 6.2.14). */
export function MelodyNotation({ notation }: { notation: string }) {
    const { t } = useLocale();
    return (
        <div className="pt-8 border-t border-line">
            <h3 className="text-meta font-semibold text-fg-muted mb-4">{t('song.melodyNotation')}</h3>
            <div className="bg-surface-2 rounded-panel p-6 border border-line font-mono text-meta text-fg-muted whitespace-pre-wrap leading-relaxed">
                {notation}
            </div>
        </div>
    );
}