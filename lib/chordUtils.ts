import ChordSheetJS from 'chordsheetjs';

import { convertChordsOverLyricsToChordPro, isChordToken } from './chordProParsing';

export interface ChordProItem {
    chords?: string;
    lyrics?: string;
    comment?: string;  // from {c: text} or {ci: text}
    italic?: boolean;  // true for {ci: text}
}

/**
 * A line inside a `{start_of_repeat}` … `{end_of_repeat}` pair (Story 6.2.15). `start` is true on the first line and `end` on
 * the last one (both on a one-line repeat); lines between carry both as false. `times` is the count given as `x2` / `2x` / `×2`
 * on either directive, left out when none is given (plain bars). The reader draws ‖: … :‖ from this; the PDF export reads it too.
 */
export interface ChordProRepeatMark {
    start: boolean;
    end: boolean;
    times?: number;
}

export interface ChordProLine {
    items: ChordProItem[];
    repeat?: ChordProRepeatMark;
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
const CHORD_LIKE = /^[A-G][#b♯♭]?(?:maj|min|dim|aug|sus|add|m|M|\d|[#b♯♭+°ø\-(),.]|\/(?:[A-G][#b♯♭]?)?)*$/;
/** No chord is longer than this. */
const MAX_CHORD_LENGTH = 32;

function looksLikeChord(token: string): boolean {
    return token.length <= MAX_CHORD_LENGTH && (isChordToken(token) || CHORD_LIKE.test(token));
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

/** A directive tag as ChordSheetJS parses it: `{name: value}` gives `_name` and `_value`. */
interface DirectiveItem {
    _name?: string;
    _value?: string;
}

const MAX_REPEAT_TIMES = 99;

/**
 * The count of a repeat directive value: `x2`, `2x`, `×2`, `2`, or a label ending in one (`Chorus x2`).
 * Only 2..99 counts, so "x1", "twice" and "" give undefined.
 */
export function parseRepeatTimes(value: string | undefined): number | undefined {
    const text = (value ?? '').trim();
    const match = /^(\d+)$/.exec(text) ?? /(?:^|\s)(?:[x×]\s*(\d+)|(\d+)\s*[x×])$/i.exec(text);
    const times = match ? Number(match[1] ?? match[2]) : NaN;
    return times >= 2 && times <= MAX_REPEAT_TIMES ? times : undefined;
}

export function parseChordProForDisplay(content: string): ChordProSection[] {
    const parser = new ChordSheetJS.ChordProParser();
    const chordProContent = convertChordsOverLyricsToChordPro(content);

    try {
        const song = parser.parse(chordProContent);
        const sections: ChordProSection[] = [];
        let currentSection: ChordProSection | null = null;
        let pendingLines: ChordProLine[] = [];
        // The repeat in progress: the count of its start directive, whether the next line is its first, and its last line so far.
        let repeat: { times?: number; first: boolean; last?: ChordProLine } | null = null;
        const closeRepeat = (endValue?: string) => {
            if (repeat?.last?.repeat) {
                repeat.last.repeat.end = true;
                const times = parseRepeatTimes(endValue) ?? repeat.times;
                if (times) repeat.last.repeat.times = times;
            }
            repeat = null;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        song.lines.forEach((line: any) => {
            // Check for section tags in the items
            const sectionStartItem = line.items.find((item: any) =>
                item._name && ['start_of_verse', 'start_of_chorus', 'start_of_bridge'].includes(item._name)
            );

            const sectionEndItem = line.items.find((item: any) =>
                item._name && ['end_of_verse', 'end_of_chorus', 'end_of_bridge'].includes(item._name)
            );

            // Repeat directives mark the lines between them; they never split a section or a stanza.
            // Directive names compare case-insensitively. Repeats do not nest: a start inside an open repeat closes it first.
            const repeatStartItem = (line.items as DirectiveItem[]).find((item) => item._name?.toLowerCase() === 'start_of_repeat');
            const repeatEndItem = (line.items as DirectiveItem[]).find((item) => item._name?.toLowerCase() === 'end_of_repeat');
            if (repeatStartItem) {
                closeRepeat();
                repeat = { times: parseRepeatTimes(repeatStartItem._value), first: true };
            }

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
                // A label or comment line right after the start is not sung: the start bar goes on the first sung line.
                const labelOnly = cleanLine.items.every((i) => i.comment !== undefined);
                if (repeat && !(repeat.first && labelOnly)) {
                    cleanLine.repeat = { start: repeat.first, end: false };
                    repeat.first = false;
                    repeat.last = cleanLine;
                }
                if (currentSection) {
                    currentSection.lines.push(cleanLine);
                } else {
                    pendingLines.push(cleanLine);
                }
            } else if (!sectionStartItem && !sectionEndItem && !repeatStartItem && !repeatEndItem) {
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

            if (repeatEndItem) closeRepeat(repeatEndItem._value);

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