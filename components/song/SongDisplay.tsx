'use client';

import { parseChordProForDisplay, ChordProSection, ChordProLine, ChordProItem, ChordProRepeatMark } from '@/lib/chordUtils';
import { useLocale } from '@/context/LocaleContext';
import { REPEAT_START, repeatEndText } from '@/lib/songs/repeatMarks';
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

/** Width of the bar gutter on repeated lines, in the lyric size, so it scales with the reader font size. */
const REPEAT_GUTTER = '1.25em';

function repeatState(repeat: ChordProRepeatMark): 'single' | 'start' | 'end' | 'inside' {
    if (repeat.start && repeat.end) return 'single';
    if (repeat.start) return 'start';
    return repeat.end ? 'end' : 'inside';
}

export default function SongDisplay({ content, melodyNotation, hasChords = false, sizeStep = DEFAULT_LYRIC_STEP, showChords = true }: SongDisplayProps) {
    const { t } = useLocale();
    const sections: ChordProSection[] = parseChordProForDisplay(content);
    const lyricSize = lyricPx(sizeStep);
    const chordSize = chordPx(sizeStep);
    // Hidden chords render nothing (not even spacers); each lyric line keeps its own row.
    const chordsOn = hasChords && showChords;

    return (
        <div className={chordsOn ? 'space-y-6' : 'space-y-4'} data-testid="song-display" data-chords={chordsOn ? 'on' : 'off'}>
            {sections.map((section, sectionIdx) => (
                <div
                    key={sectionIdx}
                    className={`relative ${sectionIdx > 0 ? (chordsOn ? 'mt-8' : 'mt-6') : ''} ${section.type === 'chorus' ? 'border-l-2 border-line-strong pl-3 md:pl-4 py-1 ml-1' : ''}`}
                >
                    {/* Section Label */}
                    {section.label && (
                        <span
                            className={`absolute -left-2 md:-left-4 top-1/2 -translate-x-full -translate-y-1/2 text-caption font-semibold rotate-180 text-fg-muted`}
                            style={{ writingMode: 'vertical-rl' }}
                        >
                            {section.label}
                        </span>
                    )}

                    {/* Section Content */}
                    <div className={`${chordsOn ? 'space-y-4' : 'space-y-1'} ${section.type === 'chorus' ? 'pl-2' : ''}`}>
                        {section.lines.map((line: ChordProLine, lineIdx) => {
                            const row = (
                                <div className={`flex flex-wrap pl-4 md:pl-6`}>
                                    {line.items.map((item: ChordProItem, itemIdx) => {
                                        // Inline comment item — {c:} or {ci:}
                                        if (item.comment !== undefined) {
                                            return (
                                                <span
                                                    key={itemIdx}
                                                    style={{ marginBottom: chordsOn ? '0.1rem' : '0.15rem' }}
                                                    className={`self-end text-caption text-fg-muted border-l-2 border-line pl-1 mr-2 leading-tight ${item.italic ? 'italic' : ''} ${itemIdx === 0 ? '-ml-4 md:-ml-6' : 'ml-1'}`}
                                                >
                                                    {item.comment}
                                                </span>
                                            );
                                        }

                                        return (
                                            <div
                                                key={itemIdx}
                                                className={`flex flex-col align-top shrink-0 ${itemIdx === 0 ? '-ml-4 md:-ml-6' : ''}`}
                                            >
                                                {/* The Chord (Red and Bold) — only render if song has chords */}
                                                {chordsOn && (
                                                    item.chords ? (
                                                        <span className="text-chord font-bold font-mono mb-0.5" style={{ fontSize: chordSize, lineHeight: 1.2, height: chordSize * 1.2 }} data-testid="chord">
                                                            {item.chords}
                                                        </span>
                                                    ) : (
                                                        <div className="mb-0.5" style={{ height: chordSize * 1.2 }} /> // Spacer to align lines without chords
                                                    )
                                                )}
                                                {/* The Lyric */}
                                                <span className="text-fg font-medium tracking-tight font-sans whitespace-pre" style={{ fontSize: lyricSize, lineHeight: 1.35 }} data-testid="lyric">
                                                    {item.lyrics || '\u00A0'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                            const { repeat } = line;
                            return (
                                <div key={lineIdx} data-testid="lyric-line" data-repeat={repeat ? repeatState(repeat) : undefined}>
                                    {repeat ? (
                                        // ‖: … :‖ around repeated lines (Story 6.2.15). Every line of a repeat gets the same
                                        // fixed-width gutter (the start bar sits in it), so the repeated lyrics share one left edge.
                                        <div className="flex items-end gap-1">
                                            <span
                                                data-testid={repeat.start ? 'repeat-start' : 'repeat-gutter'}
                                                role={repeat.start ? 'img' : undefined}
                                                aria-label={repeat.start ? t('song.repeat.start') : undefined}
                                                aria-hidden={repeat.start ? undefined : true}
                                                className="shrink-0 font-semibold text-fg-muted whitespace-nowrap"
                                                style={{ fontSize: lyricSize, lineHeight: 1.35, width: REPEAT_GUTTER }}
                                            >
                                                {repeat.start ? REPEAT_START : null}
                                            </span>
                                            <div className="min-w-0">{row}</div>
                                            {repeat.end && (
                                                <span
                                                    data-testid="repeat-end"
                                                    role="img"
                                                    aria-label={repeat.times ? t('song.repeat.endTimes', { count: repeat.times }) : t('song.repeat.end')}
                                                    className="shrink-0 font-semibold text-fg-muted whitespace-nowrap"
                                                    style={{ fontSize: lyricSize, lineHeight: 1.35 }}
                                                >
                                                    {repeatEndText(repeat.times)}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        row
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Melody Notation Section */}
            {melodyNotation && (
                <div className="pt-8 border-t border-line">
                    <h3 className="text-meta font-semibold text-fg-muted mb-4">{t('song.melodyNotation')}</h3>
                    <div className="bg-surface-2 rounded-panel p-6 border border-line font-mono text-meta text-fg-muted whitespace-pre-wrap leading-relaxed">
                        {melodyNotation}
                    </div>
                </div>
            )}
        </div>
    );
}