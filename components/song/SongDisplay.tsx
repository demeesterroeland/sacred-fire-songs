'use client';

import { parseChordProForDisplay, ChordProSection, ChordProLine, ChordProItem } from '@/lib/chordUtils';

interface SongDisplayProps {
    content: string;
    melodyNotation?: string;
}

export default function SongDisplay({ content, melodyNotation }: SongDisplayProps) {
    const sections: ChordProSection[] = parseChordProForDisplay(content);

    return (
        <div className="space-y-12">
            {sections.map((section, sectionIdx) => (
                <div key={sectionIdx} className="relative">
                    {/* Section Label */}
                    {section.label && (
                        <>
                            {/* Desktop: Vertical Label */}
                            <span
                                className="absolute -left-4 top-0 -translate-x-full hidden md:block text-xs font-black text-gray-600 uppercase tracking-widest rotate-180"
                                style={{ writingMode: 'vertical-rl' }}
                            >
                                {section.label}
                            </span>
                            {/* Mobile: Horizontal Label */}
                            <span className="md:hidden block text-xs font-black text-gray-600 uppercase tracking-widest mb-4">
                                {section.label}
                            </span>
                        </>
                    )}

                    {/* Section Content */}
                    <div className="space-y-6">
                        {section.lines.map((line: ChordProLine, lineIdx) => (
                            <div key={lineIdx}>
                                <div className="flex flex-wrap pl-6 md:pl-8 leading-loose">
                                    {line.items.map((item: ChordProItem, itemIdx) => (
                                        <div
                                            key={itemIdx}
                                            className={`flex flex-col align-top shrink-0 ${itemIdx === 0 ? '-ml-6 md:-ml-8' : ''}`}
                                        >
                                            {/* The Chord (Red and Bold) */}
                                            {item.chords ? (
                                                <span className="text-[#ff4400] font-bold text-xs h-4 font-mono mb-1">
                                                    {item.chords}
                                                </span>
                                            ) : (
                                                <div className="h-4 mb-1" /> // Spacer
                                            )}
                                            {/* The Lyric (White) - using whitespace-pre to preserve atomized spaces */}
                                            <span className="text-gray-300 text-xl md:text-2xl font-medium tracking-tight font-sans whitespace-pre">
                                                {item.lyrics || '\u00A0'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Melody Notation Section */}
            {melodyNotation && (
                <div className="pt-8 border-t border-gray-800/30">
                    <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Melody Notation</h3>
                    <div className="bg-black/20 rounded-xl p-6 border border-white/5 font-mono text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                        {melodyNotation}
                    </div>
                </div>
            )}
        </div>
    );
}