import { describe, it, expect } from 'vitest';
import { parseChordProForDisplay } from '../chordUtils';

describe('parseChordPro', () => {
    it('parses a basic ChordPro string', () => {
        const chordPro = "{title: Test Song}\n[Am]Hello [G]World";
        const sections = parseChordProForDisplay(chordPro);

        // Based on chordUtils.ts implementation:
        // 1. Metadata lines are processed by ChordSheetJS
        // 2. Content lines without section tags go into 'pendingLines'
        // 3. Final flush puts pendingLines into a section with type 'none'
        
        expect(sections.length).toBe(1);
        expect(sections[0].type).toBe('none');
        expect(sections[0].lines.length).toBe(1);

        const contentLine = sections[0].lines[0];
        // The implementation "atomizes" items by splitting lyrics by spaces
        // "[Am]Hello " becomes {chords: 'Am', lyrics: 'Hello '}
        // "[G]World" becomes {chords: 'G', lyrics: 'World'}
        
        expect(contentLine.items[0].chords).toBe('Am');
        expect(contentLine.items[0].lyrics).toBe('Hello ');
        expect(contentLine.items[1].chords).toBe('G');
        expect(contentLine.items[1].lyrics).toBe('World');
    });
});
