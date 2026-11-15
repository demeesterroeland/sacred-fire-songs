'use client';

import type { ChordProItem, ChordProLine, ChordProRepeatMark, ChordProSection } from '@/lib/chordUtils';
import { useLocale } from '@/context/LocaleContext';
import { REPEAT_START, repeatEndText } from '@/lib/songs/repeatMarks';

/** Width of the bar gutter on repeated lines, in the lyric size, so it scales with the reader font size. */
const REPEAT_GUTTER = '1.25em';

/** Space above every stanza but the first, the same in the normal reader and in the two-language view (#517). */
export function stanzaGapClass(chordsOn: boolean): string {
    return chordsOn ? 'mt-8' : 'mt-6';
}

function repeatState(repeat: ChordProRepeatMark): 'single' | 'start' | 'end' | 'inside' {
    if (repeat.start && repeat.end) return 'single';
    if (repeat.start) return 'start';
    return repeat.end ? 'end' : 'inside';
}

interface SongSectionProps {
    section: ChordProSection;
    /** The first stanza of a column has no space above it. */
    first: boolean;
    chordsOn: boolean;
    lyricSize: number;
    chordSize: number;
    /** `muted` for the translation next to the original (Story 6.2.14, #517). */
    tone?: 'default' | 'muted';
}

/**
 * One stanza (section) of the reader: its label, lines, chords, comments and repeat bars. Shared by `SongDisplay` and the
 * two-language view `SongBilingualDisplay` (Story 6.2.14, #517), so both draw a stanza the same way. Sides are logical
 * (start / end, never left / right): in a right-to-left column the label, chorus rule, indent and first-word pull flip.
 */
export default function SongSection({ section, first, chordsOn, lyricSize, chordSize, tone = 'default' }: SongSectionProps) {
    const { t } = useLocale();
    return (
        <div
            data-testid="song-section"
            className={`relative ${!first ? stanzaGapClass(chordsOn) : ''} ${section.type === 'chorus' ? 'border-s-2 border-line-strong ps-3 md:ps-4 py-1 ms-1' : ''}`}
        >
            {/* Section Label — logical sides (start), so in a right-to-left column it sits on the right (#517). */}
            {section.label && (
                <span
                    className={`absolute -start-2 md:-start-4 top-1/2 -translate-x-full rtl:translate-x-full -translate-y-1/2 text-caption font-semibold rotate-180 text-fg-muted`}
                    style={{ writingMode: 'vertical-rl' }}
                >
                    {section.label}
                </span>
            )}

            {/* Section Content */}
            <div className={`${chordsOn ? 'space-y-4' : 'space-y-1'} ${section.type === 'chorus' ? 'ps-2' : ''}`}>
                {section.lines.map((line: ChordProLine, lineIdx) => {
                    const row = (
                        <div className="flex flex-wrap ps-4 md:ps-6">
                            {line.items.map((item: ChordProItem, itemIdx) => {
                                // Inline comment item — {c:} or {ci:}
                                if (item.comment !== undefined) {
                                    return (
                                        <span
                                            key={itemIdx}
                                            style={{ marginBottom: chordsOn ? '0.1rem' : '0.15rem' }}
                                            className={`self-end text-caption text-fg-muted border-s-2 border-line ps-1 me-2 leading-tight ${item.italic ? 'italic' : ''} ${itemIdx === 0 ? '-ms-4 md:-ms-6' : 'ms-1'}`}
                                        >
                                            {item.comment}
                                        </span>
                                    );
                                }

                                return (
                                    <div
                                        key={itemIdx}
                                        className={`flex flex-col align-top shrink-0 ${itemIdx === 0 ? '-ms-4 md:-ms-6' : ''}`}
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
                                        <span className={`${tone === 'muted' ? 'text-fg-muted' : 'text-fg'} font-medium tracking-tight font-sans whitespace-pre`} style={{ fontSize: lyricSize, lineHeight: 1.35 }} data-testid="lyric">
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
    );
}
