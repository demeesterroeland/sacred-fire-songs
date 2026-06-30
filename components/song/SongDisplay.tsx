'use client';

import { parseChordProForDisplay, ChordProSection, ChordProLine, ChordProItem } from '@/lib/chordUtils';

interface SongDisplayProps {
    content: string;
    melodyNotation?: string;
    hasChords?: boolean;
}

export default function SongDisplay({ content, melodyNotation, hasChords = false }: SongDisplayProps) {
    const sections: ChordProSection[] = parseChordProForDisplay(content);

    return (
        <div className={hasChords ? 'space-y-6' : 'space-y-4'}>
            {sections.map((section, sectionIdx) => (
                <div
                    key={sectionIdx}
                    className={`relative ${sectionIdx > 0 ? (hasChords ? 'mt-8' : 'mt-6') : ''} ${section.type === 'chorus' ? 'border-l-2 border-[#ff4400]/40 pl-3 md:pl-4 py-1 ml-1' : ''}`}
                >
                    {/* Section Label */}
                    {section.label && (
                        <span
                            className={`absolute -left-2 md:-left-4 top-1/2 -translate-x-full -translate-y-1/2 text-[9px] md:text-xs font-black uppercase tracking-widest rotate-180 ${section.type === 'chorus' ? 'text-[#ff4400]/60' : 'text-gray-600'}`}
                            style={{ writingMode: 'vertical-rl' }}
                        >
                            {section.label}
                        </span>
                    )}

                    {/* Section Content */}
                    <div className={`${hasChords ? 'space-y-4' : 'space-y-1'} ${section.type === 'chorus' ? 'pl-2' : ''}`}>
                        {section.lines.map((line: ChordProLine, lineIdx) => (
                            <div key={lineIdx}>
                                <div className={`flex flex-wrap pl-4 md:pl-6`}>
                                    {line.items.map((item: ChordProItem, itemIdx) => {
                                        // Inline comment item — {c:} or {ci:}
                                        if (item.comment !== undefined) {
                                            return (
                                                <span
                                                    key={itemIdx}
                                                    style={{ marginBottom: hasChords ? '0.1rem' : '0.15rem' }}
                                                    className={`self-end text-xs text-gray-500 border-l-2 border-gray-300 dark:border-gray-700 pl-1 mr-2 leading-tight ${item.italic ? 'italic' : ''} ${itemIdx === 0 ? '-ml-4 md:-ml-6' : 'ml-1'}`}
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
                                                {hasChords && (
                                                    item.chords ? (
                                                        <span className="text-[#ff4400] font-bold text-[10px] h-3 font-mono mb-0.5">
                                                            {item.chords}
                                                        </span>
                                                    ) : (
                                                        <div className="h-3 mb-0.5" /> // Spacer to align lines without chords
                                                    )
                                                )}
                                                {/* The Lyric (White) */}
                                                <span className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl font-medium tracking-tight font-sans whitespace-pre-wrap break-words">
                                                    {item.lyrics || '\u00A0'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Melody Notation Section */}
            {melodyNotation && (
                <div className="pt-8 border-t border-gray-200/30 dark:border-gray-800/30">
                    <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Melody Notation</h3>
                    <div className="bg-gray-100/50 dark:bg-black/20 rounded-xl p-6 border border-gray-200 dark:border-white/5 font-mono text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                        {melodyNotation}
                    </div>
                </div>
            )}
        </div>
    );
}