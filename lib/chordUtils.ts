import ChordSheetJS from 'chordsheetjs';

import { convertChordsOverLyricsToChordPro } from './chordProParsing';

export interface ChordProItem {
    chords?: string;
    lyrics?: string;
    comment?: string;  // from {c: text} or {ci: text}
    italic?: boolean;  // true for {ci: text}
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

    // ChordSheetJS doesn't support newlines inside directives ({c:}, {ci:}, etc.)
    // Collapse any newlines within { ... } blocks into spaces before parsing
    const sanitized = chordProContent.replace(/\{[^}]*\}/g, (match) =>
        match.replace(/\r?\n/g, ' ').trim()
    );

    try {
        const song = parser.parse(sanitized);
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

            // Handle Content (includes comments as content)
            const isCommentTag = (item: any) =>
                item._name && ['comment', 'c', 'comment_italic', 'ci'].includes(item._name);

            const hasContent = line.items.some((item: any) =>
                (item.lyrics && item.lyrics.trim().length > 0) || item.chords || isCommentTag(item)
            );

            if (hasContent) {
                const items: ChordProItem[] = line.items.map((item: any) => {
                    // Comment {c:} or italic comment {ci:} directive
                    if (isCommentTag(item)) {
                        return {
                            comment: item._value || '',
                            italic: item._name === 'ci' || item._name === 'comment_italic'
                        };
                    }
                    return {
                        chords: item.chords || undefined,
                        lyrics: item.lyrics || undefined
                    };
                });

                const atomizedItems: ChordProItem[] = [];

                items.forEach((item: ChordProItem) => {
                    // Pass comment items through without atomization
                    if (item.comment !== undefined) {
                        atomizedItems.push(item);
                        return;
                    }
                    if (!item.lyrics || item.lyrics.trim().length === 0) {
                        atomizedItems.push(item);
                        return;
                    }

                    // Split lyrics by whitespace, keeping the whitespace with the word it follows
                    const parts = item.lyrics.split(/(\s+)/);
                    let firstPartProcessed = false;
                    let currentCombined = '';

                    parts.forEach((part: string) => {
                        if (part === '') return;

                        if (/\s+/.test(part)) {
                            // It's a whitespace part. Join with previous word and push as atom.
                            atomizedItems.push({
                                chords: !firstPartProcessed ? item.chords : undefined,
                                lyrics: currentCombined + part
                            });
                            currentCombined = '';
                            firstPartProcessed = true;
                        } else {
                            // It's a word part.
                            if (currentCombined !== '') {
                                // If we have a pending word without trailing space, push it now
                                atomizedItems.push({
                                    chords: !firstPartProcessed ? item.chords : undefined,
                                    lyrics: currentCombined
                                });
                                firstPartProcessed = true;
                            }
                            currentCombined = part;
                        }
                    });

                    // Handle remaining part
                    if (currentCombined !== '') {
                        atomizedItems.push({
                            chords: !firstPartProcessed ? item.chords : undefined,
                            lyrics: currentCombined
                        });
                    } else if (!firstPartProcessed && item.chords) {
                        // If no lyrics were processed but there was a chord
                        atomizedItems.push({ chords: item.chords });
                    }
                });

                const cleanLine: ChordProLine = { items: atomizedItems };

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