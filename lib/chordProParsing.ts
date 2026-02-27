export interface ParsedChordPro {
    title?: string;
    author?: string;
    key?: string;
    capo?: string;
    cleanContent: string;
}

// Heuristic to check if a line is a "Chords" line
// It should mostly contain chord characters and spaces.
function isChordLine(line: string): boolean {
    const trimmed = line.trim();
    if (trimmed.length === 0) return false;

    // Pattern for a valid chord (simplified)
    // Matches: A-G, optional #/b, optional m/min/maj/sus/dim/aug, optional numbers, optional slash bass
    // e.g. C, C#m7, G/B, Dsus4
    const chordPattern = /^[A-G][#b]?(?:m|min|maj|dim|aug|sus|add)?\d*(?:\/[A-G][#b]?)?$/;

    // Split by whitespace
    const tokens = trimmed.split(/\s+/);

    // Filter out tokens that are effectively comments (in parentheses)
    // e.g. "G (intro)" -> "G" is the only relevant token
    const relevantTokens = tokens.filter(t => !t.startsWith('(') && !t.endsWith(')'));

    if (relevantTokens.length === 0) return false;

    // If more than 50% of *relevant* tokens look like chords, treat as chord line
    // Also allow common separators like "|"
    const validChords = relevantTokens.filter(t => chordPattern.test(t) || t === '|').length;

    return validChords > relevantTokens.length * 0.5;
}

/**
 * Checks if the text contains any chords (either via [] brackets or heuristic)
 */
export function hasChords(text: string): boolean {
    if (!text) return false;

    // 1. Check for ChordPro style brackets [Am]
    if (/\[[A-G]/.test(text)) return true;

    // 2. Check for Chords-over-Lyrics heuristic
    const lines = text.split('\n');
    return lines.some(line => isChordLine(line));
}

export function convertChordsOverLyricsToChordPro(text: string): string {
    const lines = text.split('\n');
    const outputLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];
        const nextLine = lines[i + 1];

        // Check if current line is chords and next line exists and is NOT chords (lyrics)
        // Also ensure next line isn't metadata (starts with {)
        if (isChordLine(currentLine) && nextLine !== undefined && !isChordLine(nextLine) && !nextLine.trim().startsWith('{')) {
            // Merge strategy
            const mergedLine = "";
            const lyricIndex = 0;
            const lastChordIndex = 0;

            // Identify chord positions in the current line
            // We need to preserve absolute positions relative to the start of the string to map to lyrics
            // Note: Tabs vs Spaces is tricky. Assuming Spaces for alignment.

            const chordMatches = [...currentLine.matchAll(/[^\s]+/g)];

            // If no chords found (weird if isChordLine true), just push current
            if (chordMatches.length === 0) {
                outputLines.push(currentLine);
                continue;
            }

            // Construct the merged line
            // We go through the lyrics char by char, or rather, insert chords at specific indices.
            // Easier: Reconstruct string by slicing lyrics.

            const currentLyricIdx = 0;
            const processedLyrics = nextLine;
            const offset = 0; // Tracks insertions into lyrics

            // Optimization: Map chords to their indices
            // We need to handle the case where lyrics are shorter than chord line (chords extend beyond text)
            // or lyrics start later.

            let buffer = "";
            let lastIdx = 0;

            for (const match of chordMatches) {
                const chord = match[0];
                const chordStart = match.index!;

                // If the lyric line is shorter than the chord position, we treat the rest as just chords appended?
                // Or we pad with spaces?
                // Standard behavior: Just append [Chord] if out of bounds.

                // Append lyrics up to this chord
                // If chordStart is beyond current lyric length, we pad spaces?
                // Actually, simpler approach: insert [Chord] at index `chordStart` in `nextLine`.

                // We need to handle multiple insertions shifting the string.
                // Let's build from left to right.

                if (chordStart >= lastIdx) {
                    if (chordStart < nextLine.length) {
                        buffer += nextLine.substring(lastIdx, chordStart);
                        lastIdx = chordStart;
                    } else {
                        // Chord is beyond lyrics
                        buffer += nextLine.substring(lastIdx);
                        // Pad spaces if needed
                        buffer += " ".repeat(chordStart - nextLine.length);
                        lastIdx = chordStart;
                        // Actually if we passed length, substring(lastIdx) returns empty if lastIdx >= length
                        // Wait, nextLine.substring(length) is empty.
                        // So if lastIdx was at length, we add nothing.
                    }
                }

                buffer += `[${chord}]`;
            }

            // Append remaining lyrics
            if (lastIdx < nextLine.length) {
                buffer += nextLine.substring(lastIdx);
            }

            outputLines.push(buffer);
            i++; // Skip next line as we consumed it
        } else {
            outputLines.push(currentLine);
        }
    }

    return outputLines.join('\n');
}

export function parseChordPro(text: string): ParsedChordPro {
    let title: string | undefined;
    let author: string | undefined;
    let key: string | undefined;
    let capo: string | undefined;

    // 0. Pre-process: Detect and convert "Chords over Lyrics" if present
    // This allows us to handle mixed formats or pure "OnSong" style
    const convertedText = convertChordsOverLyricsToChordPro(text);

    // 1. Extract Title
    const titleRegex = /{(?:title|t):\s*(.*?)}/i;
    const titleMatch = convertedText.match(titleRegex);
    if (titleMatch) {
        title = titleMatch[1].trim();
    }

    // 2. Extract Author
    const authorRegex = /{(?:author|a|artist):\s*(.*?)}/i;
    const authorMatch = convertedText.match(authorRegex);
    if (authorMatch) {
        author = authorMatch[1].trim();
    }

    // 3. Extract Key
    const keyRegex = /{(?:key|k):\s*(.*?)}/i;
    const keyMatch = convertedText.match(keyRegex);
    if (keyMatch) {
        key = keyMatch[1].trim();
    }

    // 4. Extract Capo — only match {capo:}, NOT {c:} ({c:} is a comment directive)
    const capoRegex = /{(?:capo):\s*(.*?)}/i;
    const capoMatch = convertedText.match(capoRegex);
    if (capoMatch) {
        capo = capoMatch[1].trim();
    }

    // 5. Set Content (Stripped of metadata tags, but preserve {c:} and {ci:} comment directives)
    // NOTE: {c:} is a comment directive, NOT capo shorthand — do not strip it
    const metadataRegex = /{(?:title|t|author|a|artist|key|k|capo):\s*.*?}\s*/gi;
    const cleanContent = convertedText.replace(metadataRegex, '').trim();

    return { title, author, key, capo, cleanContent };
}
