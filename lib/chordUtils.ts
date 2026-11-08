import ChordSheetJS from 'chordsheetjs';

import { convertChordsOverLyricsToChordPro, isChordToken } from './chordProParsing';

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

/**
 * What a musician writes as a chord, wider than `isChordToken` (which the transposer and the deployed SQL helper share
 * and which stays as it is): flat and sharp signs (B♭, F♯m7), extensions with a slash (C6/9), a bass note after the slash.
 * Used only to keep a real chord alone on a line in the chord row. It starts with an upper-case A-G and allows only
 * chord-quality pieces after it, so `am`, `Hm`, `Re`, `Do`, `Chorus`, `Coda` and `N.C.` are not chord-like.
 */
const CHORD_LIKE = /^[A-G][#b♯♭]?(?:maj|min|dim|aug|sus|add|m|M|\d|[#b♯♭+°ø\-(),.]|\/[A-G]?[#b♯♭]?)*$/;

function looksLikeChord(token: string): boolean {
    return isChordToken(token) || CHORD_LIKE.test(token);
}

/**
 * A line holding nothing but bracketed words that are not chords ("[Chorus]", "[Bridge] [Coda]") names a section.
 * It is text for the reader, shown like a {c:} comment, whether chords are on or off. Returns null for any other line.
 */
function sectionLabelItems(items: ChordProItem[]): ChordProItem[] | null {
    const filled = items.filter((i) => i.comment !== undefined || i.chords || i.lyrics?.trim());
    if (filled.length === 0) return null;
    const allLabels = filled.every((i) => i.comment === undefined && i.chords && !i.lyrics?.trim() && !looksLikeChord(i.chords));
    return allLabels ? filled.map((i) => ({ comment: i.chords })) : null;
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
                const items: ChordProItem[] = line.items.map((item: any) => {
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

                const cleanLine: ChordProLine = { items: sectionLabelItems(atomizedItems) ?? atomizedItems };
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