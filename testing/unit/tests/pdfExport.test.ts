import { describe, it, expect, vi } from 'vitest';
import {
    sanitizeFilename,
    formatSongForPdf,
    exportPlaylistToPdf,
    downloadPdf,
    type ExportPlaylistData,
    type ExportSongData,
} from '@/lib/export/pdfExport';

describe('PDF Export - TDD Suite', () => {
    describe('sanitizeFilename', () => {
        it('sanitizes standard playlist names and appends .pdf', () => {
            expect(sanitizeFilename('Ceremony Setlist')).toBe('Ceremony_Setlist.pdf');
        });

        it('replaces special characters and slashes with underscores', () => {
            expect(sanitizeFilename('Medicine / Fire * Circle? (Night 1)')).toBe('Medicine_Fire_Circle_Night_1.pdf');
        });

        it('does not duplicate .pdf if already present in title', () => {
            expect(sanitizeFilename('Ceremony_Songs.pdf')).toBe('Ceremony_Songs.pdf');
        });

        it('falls back to default setlist.pdf for empty or whitespace-only titles', () => {
            expect(sanitizeFilename('')).toBe('setlist.pdf');
            expect(sanitizeFilename('   ')).toBe('setlist.pdf');
            expect(sanitizeFilename('???///')).toBe('setlist.pdf');
        });
    });

    describe('formatSongForPdf', () => {
        it('extracts metadata and formats chordpro content with chords over lyrics', () => {
            const song: ExportSongData = {
                title: 'Morning Sunrise',
                author: 'Shimshai',
                key: 'Am',
                capo: 2,
                content: '{c: Intro}\n[Am]Morning sun [C]shining bright\n[G]In the sky [Am]today',
            };

            const formatted = formatSongForPdf(song);

            expect(formatted.title).toBe('Morning Sunrise');
            expect(formatted.author).toBe('Shimshai');
            expect(formatted.key).toBe('Am');
            expect(formatted.capo).toBe(2);
            expect(formatted.sections.length).toBeGreaterThan(0);

            // Verify comments are parsed properly
            const introSection = formatted.sections.find(s =>
                s.lines.some(l => l.items.some(i => i.comment === 'Intro'))
            );
            expect(introSection).toBeDefined();

            // Verify chords are paired with atomized lyrics
            const lyricLine = formatted.sections.flatMap(s => s.lines).find(l =>
                l.items.some(i => i.chords === 'Am' && i.lyrics?.includes('Morning'))
            );
            expect(lyricLine).toBeDefined();
        });

        it('extracts metadata embedded directly in ChordPro directives when missing from root object', () => {
            const song: ExportSongData = {
                title: 'Embedded Directives Song',
                content: '{title: Sacred Fire}\n{author: Medicine Circle}\n{key: Dm}\n{capo: 1}\n[Dm]Heart of fire',
            };

            const formatted = formatSongForPdf(song);

            expect(formatted.title).toBe('Sacred Fire');
            expect(formatted.author).toBe('Medicine Circle');
            expect(formatted.key).toBe('Dm');
            expect(formatted.capo).toBe(1);
        });

        it('transposes chords when transposition offset is provided', () => {
            const song: ExportSongData = {
                title: 'Transposed Song',
                key: 'C',
                transposition: 2, // C + 2 semitones = D
                content: '{key: C}\n[C]Down to the [G]river to [C]pray',
            };

            const formatted = formatSongForPdf(song);

            // Key should be transposed to D
            expect(formatted.key).toBe('D');

            // Chords should be shifted to D and A
            const chords = formatted.sections
                .flatMap(s => s.lines)
                .flatMap(l => l.items)
                .map(i => i.chords)
                .filter(Boolean);

            expect(chords).toContain('D');
            expect(chords).toContain('A');
            expect(chords).not.toContain('C');
            expect(chords).not.toContain('G');
        });

        it('handles songs without chords cleanly (lyrics only)', () => {
            const song: ExportSongData = {
                title: 'Chant Only',
                content: 'Om Namah Shivaya\nGurave Namaha',
            };

            const formatted = formatSongForPdf(song);
            expect(formatted.title).toBe('Chant Only');
            expect(formatted.sections.length).toBeGreaterThan(0);

            // Verify full line lyrics match
            const reconstructedLines = formatted.sections
                .flatMap(s => s.lines)
                .map(l => l.items.map(i => i.lyrics || '').join(''));

            expect(reconstructedLines.some(line => line.includes('Om Namah Shivaya'))).toBe(true);
            expect(reconstructedLines.some(line => line.includes('Gurave Namaha'))).toBe(true);

            // Verify no chords are generated
            const allItems = formatted.sections.flatMap(s => s.lines).flatMap(l => l.items);
            expect(allItems.every(i => !i.chords)).toBe(true);
        });
    });

    describe('exportPlaylistToPdf', () => {
        it('throws an error when exporting an empty playlist', async () => {
            const emptyPlaylist: ExportPlaylistData = {
                title: 'Empty Setlist',
                songs: [],
            };

            await expect(exportPlaylistToPdf(emptyPlaylist)).rejects.toThrow(
                /no songs to export/i
            );
        });

        it('generates a valid PDF Blob for a setlist with multiple songs', async () => {
            const playlist: ExportPlaylistData = {
                title: 'Ceremony Fire Circle',
                songs: [
                    {
                        title: 'Morning Sunrise',
                        author: 'Shimshai',
                        key: 'Am',
                        capo: 2,
                        content: '{c: Chorus}\n[Am]Morning sun [C]shining bright [G]in the sky [Am]',
                    },
                    {
                        title: 'Flor das Aguas',
                        author: 'Mestre Irineu',
                        key: 'Em',
                        capo: 0,
                        content: '[Em]Flor das aguas da [B7]floresta [Em]sagrada',
                    },
                ],
            };

            const blob = await exportPlaylistToPdf(playlist);

            expect(blob).toBeInstanceOf(Blob);
            expect(blob.type).toBe('application/pdf');
            expect(blob.size).toBeGreaterThan(1000);
        });

        it('handles long multi-page songs with pagination', async () => {
            // Generate a long song that spans multiple pages
            const longVerses = Array.from({ length: 40 }, (_, idx) =>
                `{c: Stanza ${idx + 1}}\n[Am]Verse line ${idx + 1} with [C]chords and [G]lyrics and sacred [Am]fire`
            ).join('\n\n');

            const playlist: ExportPlaylistData = {
                title: 'Long Ceremony Night',
                songs: [
                    {
                        title: 'Epic Medicine Journey',
                        author: 'Sacred Circle',
                        key: 'Am',
                        content: longVerses,
                    },
                ],
            };

            const blob = await exportPlaylistToPdf(playlist);
            expect(blob).toBeInstanceOf(Blob);
            expect(blob.size).toBeGreaterThan(2000);
        });
    });

    describe('downloadPdf helper', () => {
        it('triggers a browser file download when called', () => {
            const blob = new Blob(['mock pdf content'], { type: 'application/pdf' });
            const mockLink = {
                href: '',
                download: '',
                click: vi.fn(),
            };
            const appendChildSpy = vi.fn();
            const removeChildSpy = vi.fn();

            const originalWindow = globalThis.window;
            const originalDocument = globalThis.document;
            const originalUrl = globalThis.URL;

            const mockUrl = 'blob:http://localhost:3000/mock-id';
            globalThis.window = {} as unknown as Window & typeof globalThis;
            globalThis.document = {
                body: {
                    appendChild: appendChildSpy,
                    removeChild: removeChildSpy,
                },
                createElement: vi.fn().mockReturnValue(mockLink),
            } as unknown as Document;
            globalThis.URL = {
                createObjectURL: vi.fn().mockReturnValue(mockUrl),
                revokeObjectURL: vi.fn(),
            } as unknown as typeof URL;

            try {
                downloadPdf(blob, 'Ceremony_Setlist.pdf');

                expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(blob);
                expect(mockLink.download).toBe('Ceremony_Setlist.pdf');
                expect(mockLink.href).toBe(mockUrl);
                expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
                expect(mockLink.click).toHaveBeenCalled();
                expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
                expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
            } finally {
                globalThis.window = originalWindow;
                globalThis.document = originalDocument;
                globalThis.URL = originalUrl;
            }
        });
    });
});
