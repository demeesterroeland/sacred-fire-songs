import { describe, it, expect } from 'vitest';
import { parseChordProForDisplay } from '../chordUtils';

describe('parseChordPro', () => {
    it('parses a basic ChordPro string', () => {
        const chordPro = "{title: Test Song}\n[Am]Hello [G]World";
        const lines = parseChordProForDisplay(chordPro);

        // Let's verify we have lines
        expect(lines.length).toBe(1);

        // Verify the first line contains our chords and lyrics
        const contentLine = lines[0] as any;
        // chordsheetjs puts chords in 'items' with property 'chords'
        expect(contentLine.items[0].chords).toBe('Am');
        expect(contentLine.items[0].lyrics).toBe('Hello ');
        expect(contentLine.items[1].chords).toBe('G');
        expect(contentLine.items[1].lyrics).toBe('World');
    });
});