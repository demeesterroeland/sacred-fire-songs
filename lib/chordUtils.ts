import ChordSheetJS from 'chordsheetjs';

import { convertChordsOverLyricsToChordPro } from './chordProParsing';

export interface ChordProItem {
    chords?: string;
    lyrics?: string;
}

export interface ChordProLine {
    items: ChordProItem[];
}

export interface ChordProSection {
    type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'none';
    label?: string;
    lines: ChordProLine[];
}

export function parseChordProForDisplay(content: string): ChordProSection[] {
    const parser = new ChordSheetJS.ChordProParser();
    const chordProContent = convertChordsOverLyricsToChordPro(content);

    try {
        const song = parser.parse(chordProContent);
        const sections: ChordProSection[] = [];
        let currentSection: ChordProSection | null = null;

        // Initial generic section for content before any tag
        let pendingLines: ChordProLine[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        song.lines.forEach((line: any) => {
            // Check for section start tags in the items
            const sectionStartItem = line.items.find((item: any) =>
                item._name && ['start_of_verse', 'start_of_chorus', 'start_of_bridge'].includes(item._name)
            );

            const sectionEndItem = line.items.find((item: any) =>
                item._name && ['end_of_verse', 'end_of_chorus', 'end_of_bridge'].includes(item._name)
            );

            // Handle Section Start
            if (sectionStartItem) {
                // If there were pending lines, save them as a 'none' section
                if (pendingLines.length > 0) {
                    sections.push({
                        type: 'none',
                        lines: [...pendingLines]
                    });
                    pendingLines = [];
                }

                // If we were already in a section (e.g. unclosed previous section), close it
                if (currentSection) {
                    sections.push(currentSection);
                }

                let type: ChordProSection['type'] = 'none';
                if (sectionStartItem._name === 'start_of_verse') type = 'verse';
                if (sectionStartItem._name === 'start_of_chorus') type = 'chorus';
                if (sectionStartItem._name === 'start_of_bridge') type = 'bridge';

                currentSection = {
                    type,
                    label: sectionStartItem._value || (type === 'chorus' ? 'Chorus' : undefined),
                    lines: []
                };
                return; // Skip the tag line
            }

            // Handle Section End
            if (sectionEndItem) {
                if (currentSection) {
                    sections.push(currentSection);
                    currentSection = null;
                }
                return; // Skip the tag line
            }

            // Handle Content
            const hasContent = line.items.some((item: any) =>
                (item.lyrics && item.lyrics.trim().length > 0) || item.chords
            );

            if (hasContent) {
                const cleanItems = line.items.map((item: any) => ({
                    chords: item.chords || undefined,
                    lyrics: item.lyrics || undefined
                }));

                const cleanLine: ChordProLine = { items: cleanItems };

                if (currentSection) {
                    currentSection.lines.push(cleanLine);
                } else {
                    pendingLines.push(cleanLine);
                }
            } else {
                // Empty line: treat as a section break to preserve stanza spacing
                if (currentSection) {
                    sections.push(currentSection);
                    currentSection = null;
                } else if (pendingLines.length > 0) {
                    sections.push({
                        type: 'none',
                        lines: [...pendingLines]
                    });
                    pendingLines = [];
                }
            }
        });

        // Flush any remaining context
        if (currentSection) {
            sections.push(currentSection);
        } else if (pendingLines.length > 0) {
            sections.push({
                type: 'none',
                lines: pendingLines
            });
        }

        return sections;

    } catch (error) {
        console.error('Error parsing ChordPro content:', error);
        return [];
    }
}