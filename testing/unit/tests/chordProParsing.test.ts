
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseChordPro } from '@/lib/chordProParsing';

describe('ChordPro Parsing', () => {

    it('should parse "Down to the River" (chords over lyrics)', () => {
        const filePath = path.join(__dirname, 'DownToTheRiver-chordsOverLyrics.txt');
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = parseChordPro(content);

        expect(parsed.cleanContent).toContain('As I went [G]down in the river to pray');
        expect(parsed.cleanContent).toContain('[D]Studying about that [G]good old way');
        expect(parsed.cleanContent).toContain('[D]O sisters, [G]let\'s go down');
        expect(parsed.cleanContent).toContain('Page 1/3');
        expect(parsed.cleanContent).toContain('And [G]who shall wear the robe and crown');
    });

    it('should extract metadata from "Morning Sunrise" (.cho)', () => {
        const filePath = path.join(__dirname, 'morning_sunrise.cho');

        // Ensure file exists (setup)
        if (!fs.existsSync(filePath)) {
            const dummyContent = "{title: Morning Sunrise}\n{author: Shimshai}\n\n[Am]Morning sun...";
            fs.writeFileSync(filePath, dummyContent);
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = parseChordPro(content);

        expect(parsed.title).toBe('Morning Sunrise');
        expect(parsed.author).toBe('Shimshai'); // Updated to match actual test data
    });

    it('should parse "Donne Ricche" (Italian chords over lyrics)', () => {
        const filePath = path.join(__dirname, 'DonneRiccheChordsOverLyrics.txt');
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = parseChordPro(content);

        expect(parsed.cleanContent).toContain('[Gbmaj7]Mia nonna quando è morta');
        expect(parsed.cleanContent).toContain('[Db]Non mi ha lasciato niente');
        expect(parsed.cleanContent).toContain('[Gbmaj7]Comprami-');
    });

    it('should extract Key and Capo directives', () => {
        const keyCapoContent = `
{title: Test Key Capo}
{author: Tester}
{key: Em}
{capo: 3}
[Em]Testing [G]Key and Capo
`;
        const parsed = parseChordPro(keyCapoContent);

        expect(parsed.key).toBe('Em');
        expect(parsed.capo).toBe('3');
        expect(parsed.title).toBe('Test Key Capo');
        expect(parsed.cleanContent).not.toContain('{key:');
        expect(parsed.cleanContent).not.toContain('{capo:');
    });

});
