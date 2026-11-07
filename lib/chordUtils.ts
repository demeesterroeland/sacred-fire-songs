import ChordSheetJS from 'chordsheetjs';

import { convertChordsOverLyricsToChordPro, isChordToken } from './chordProParsing';

export interface ChordProItem {
    chords?: string;
    lyrics?: string;
    comment?: string;  // from {c: text} or {ci: text}
    italic?: boolean;  // true for {ci: text}
    /**
     * `comment` is a section label written as a bracket word, `[Chorus]`, `[Bridge]`, `[Coda]`: it is not a chord
     * (isChordToken says so). The song page shows it as plain section text, never as a chord, whether or not the
     * version has a chord layer. The PDF export prints it like any comment.
     */
    isSectionLabel?: boolean;
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
        let pendingLines: ChordProLine[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        song.lines.forEach((line: any) => {
            // Check for section tags in the items
            const sectionStartItem = line.items.find((item: any) =>
                item._name && ['start_of_verse', 'start_of_chorus', 'start_of_bridge'].includes(item._name)
            );

            const sectionEndItem = line.items.find((item: any) =>
                item._name && ['end_of_verse', 'end_of_chorus', 'end_of_bridge'].includes(item._name)
            );

            // 1. Handle Section Start
            if (sectionStartItem) {
                // Flush general pending lines
                if (pendingLines.length > 0) {
                    sections.push({ type: 'none', lines: [...pendingLines] });
                    pendingLines = [];
                }
                // Flush existing section if unclosed
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
            }

            // 2. Process Line Content
            const isCommentTag = (item: any) =>
                item._name && ['comment', 'c', 'comment_italic', 'ci'].includes(item._name);

            const hasContent = line.items.some((item: any) =>
                (item.lyrics && item.lyrics.trim().length > 0) || item.chords || isCommentTag(item)
            );

            if (hasContent) {
                const items: ChordProItem[] = line.items.flatMap((item: any): ChordProItem[] => {
                    if (isCommentTag(item)) {
                        return [{
                            comment: item._value || '',
                            italic: item._name === 'ci' || item._name === 'comment_italic'
                        }];
                    }
                    // A bracket that does not hold a chord is a section label: keep it as text (validation 2, item 16).
                    if (item.chords && !isChordToken(item.chords)) {
                        const label: ChordProItem = { comment: item.chords, isSectionLabel: true };
                        return item.lyrics ? [label, { lyrics: item.lyrics }] : [label];
                    }
                    return [{
                        chords: item.chords || undefined,
                        lyrics: item.lyrics || undefined
                    }];
                });

                const atomizedItems: ChordProItem[] = [];
                items.forEach((item: ChordProItem) => {
                    if (item.comment !== undefined || !item.lyrics || item.lyrics.trim().length === 0) {
                        atomizedItems.push(item);
                        return;
                    }

                    const parts = item.lyrics.split(/(\s+)/);
                    let firstPartProcessed = false;
                    let currentCombined = '';

                    parts.forEach((part: string) => {
                        if (part === '') return;
                        if (/\s+/.test(part)) {
                            atomizedItems.push({
                                chords: !firstPartProcessed ? item.chords : undefined,
                                lyrics: currentCombined + part
                            });
                            currentCombined = '';
                            firstPartProcessed = true;
                        } else {
                            if (currentCombined !== '') {
                                atomizedItems.push({
                                    chords: !firstPartProcessed ? item.chords : undefined,
                                    lyrics: currentCombined
                                });
                                firstPartProcessed = true;
                            }
                            currentCombined = part;
                        }
                    });

                    if (currentCombined !== '') {
                        atomizedItems.push({
                            chords: !firstPartProcessed ? item.chords : undefined,
                            lyrics: currentCombined
                        });
                    } else if (!firstPartProcessed && item.chords) {
                        atomizedItems.push({ chords: item.chords });
                    }
                });

                const cleanLine: ChordProLine = { items: atomizedItems };
                if (currentSection) {
                    currentSection.lines.push(cleanLine);
                } else {
                    pendingLines.push(cleanLine);
                }
            } else if (!sectionStartItem && !sectionEndItem) {
                // Truly empty line (no content AND no directives): 
                // Treat as a stanza break to preserve spacing
                if (currentSection) {
                    sections.push(currentSection);
                    currentSection = null;
                } else if (pendingLines.length > 0) {
                    sections.push({ type: 'none', lines: [...pendingLines] });
                    pendingLines = [];
                }
            }

            // 3. Handle Section End (AFTER processing line content)
            if (sectionEndItem) {
                if (currentSection) {
                    sections.push(currentSection);
                    currentSection = null;
                }
            }
        });

        // Final flushes
        if (currentSection) {
            sections.push(currentSection);
        } else if (pendingLines.length > 0) {
            sections.push({ type: 'none', lines: [...pendingLines] });
        }

        return sections;
    } catch (error) {
        console.error('Error parsing ChordPro content:', error);
        return [];
    }
}