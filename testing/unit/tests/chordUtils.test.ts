import { describe, it, expect } from 'vitest';
import { parseChordProForDisplay } from '@/lib/chordUtils';

describe('parseChordPro', () => {
    it('parses a basic ChordPro string', () => {
        const chordPro = "{title: Test Song}\n[Am]Hello [G]World";
        const sections = parseChordProForDisplay(chordPro);

        // Should produce one section containing one line
        expect(sections.length).toBe(1);
        expect(sections[0].lines.length).toBe(1);

        const contentLine = sections[0].lines[0];
        expect(contentLine.items[0].chords).toBe('Am');
        expect(contentLine.items[0].lyrics).toBe('Hello ');
        expect(contentLine.items[1].chords).toBe('G');
        expect(contentLine.items[1].lyrics).toBe('World');
    });
});