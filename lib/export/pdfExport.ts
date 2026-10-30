import ChordSheetJS from 'chordsheetjs';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { parseChordProForDisplay, ChordProSection } from '@/lib/chordUtils';
import { parseChordPro, convertChordsOverLyricsToChordPro } from '@/lib/chordProParsing';
import { DEJAVU_SANS_REGULAR_B64, DEJAVU_SANS_BOLD_B64 } from './dejavuFonts';
import { DEFAULT_LOCALE, LOCALE_DATE_TAGS, tWithLocale, type Locale, type TranslationKey } from '@/lib/i18n';

export interface ExportSongData {
    title: string;
    author?: string;
    key?: string;
    capo?: number;
    transposition?: number;
    tuning?: string;
    content: string;
    url?: string;
}

export interface ExportPlaylistData {
    title: string;
    description?: string | null;
    songs: ExportSongData[];
    baseUrl?: string;
    /** Interface language for the document labels (page footer, metadata). Defaults to English. */
    locale?: Locale;
}

/** 1 cm in PDF points (jsPDF unit "pt"): size of the per-page song QR code. */
export const QR_SIZE_PT = 28.35;

/** Footer label: only the site's host (no protocol, path or song id). */
export function footerSiteLabel(baseUrl?: string): string {
    if (!baseUrl) return '';
    try {
        return new URL(baseUrl).host;
    } catch {
        return '';
    }
}

/** Absolute song page URL for the QR code, or undefined when it can't be built. */
export function songPageUrl(baseUrl?: string, path?: string): string | undefined {
    if (!baseUrl || !path) return undefined;
    try {
        return new URL(path, baseUrl).href;
    } catch {
        return undefined;
    }
}

/** QR code as PNG data URL; error level M keeps it scannable at 1 cm, margin 2 = quiet zone. */
async function qrDataUrl(url: string): Promise<string> {
    return QRCode.toDataURL(url, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 240, // ~600 dpi at 1 cm
        color: { dark: '#000000', light: '#ffffff' },
    });
}

/** Document labels in the given interface language (song content is never translated). */
export function getPdfLabels(locale: Locale = DEFAULT_LOCALE) {
    const tr = (key: TranslationKey, params?: Record<string, string | number>) => tWithLocale(locale, key, params);
    return {
        dateLocale: LOCALE_DATE_TAGS[locale] ?? 'en-US',
        untitledSong: tr('pdf.untitledSong'),
        untitledPlaylist: tr('pdf.untitledPlaylist'),
        page: (page: number, total: number) => tr('pdf.page', { page, total }),
        subtitle: (count: number, date: string) => tr(count === 1 ? 'pdf.subtitle.one' : 'pdf.subtitle.other', { count, date }),
        by: (author: string) => tr('pdf.by', { author }),
        key: (key: string) => tr('pdf.key', { key }),
        capo: (capo: number) => tr('pdf.capo', { capo }),
        tuning: (tuning: string) => tr('pdf.tuning', { tuning }),
        continued: (title: string) => tr('pdf.continued', { title }),
        playlist: (title: string) => tr('pdf.playlist', { title }),
    };
}

export interface FormattedSongForPdf {
    title: string;
    author?: string;
    key?: string;
    capo?: number;
    tuning?: string;
    sections: ChordProSection[];
    url?: string;
}

/**
 * Cleans string for PDF rendering, trimming whitespace while preserving all
 * Unicode characters (such as acute accents on ź, ñ, ā, ī, ū, etc.).
 */
export function sanitizeForPdf(str: string): string {
    return str || '';
}

/**
 * Sanitizes a playlist or song title for safe file downloading.
 * e.g., "Ceremony Setlist" -> "Ceremony_Setlist.pdf"
 */
export function sanitizeFilename(title: string): string {
    if (!title || typeof title !== 'string') {
        return 'setlist.pdf';
    }

    // Strip unsafe characters, preserve alphanumeric, dashes, dots, and spaces
    let clean = title.trim().replace(/[^\w\s.-]/g, '');

    // Replace whitespace with underscores and consolidate multiple underscores
    clean = clean.replace(/\s+/g, '_').replace(/_+/g, '_').trim();

    // Strip leading or trailing dots and underscores
    clean = clean.replace(/^[_.-]+|[_.-]+$/g, '');

    if (!clean) {
        return 'setlist.pdf';
    }

    // Ensure .pdf extension (case-insensitive check)
    if (!/\.pdf$/i.test(clean)) {
        clean = `${clean}.pdf`;
    }

    return clean;
}

/**
 * Parses and prepares a song for PDF printing:
 * - Extracts embedded ChordPro directives (key, capo, title, author).
 * - Applies musical transposition if requested.
 * - Formats sections with structured lines, chords, lyrics, and annotations.
 */
export function formatSongForPdf(song: ExportSongData, untitled = 'Untitled Song'): FormattedSongForPdf {
    let contentToProcess = song.content || '';
    let songKey = song.key;

    // 1. Apply transposition if specified
    if (song.transposition && song.transposition !== 0) {
        try {
            const parser = new ChordSheetJS.ChordProParser();
            const chordProFormat = convertChordsOverLyricsToChordPro(contentToProcess);
            const parsedSong = parser.parse(chordProFormat);
            const transposedSong = parsedSong.transpose(song.transposition);
            const formatter = new ChordSheetJS.ChordProFormatter();
            contentToProcess = formatter.format(transposedSong);

            const newMetaKey = transposedSong.metadata.get('key');
            if (newMetaKey) {
                songKey = Array.isArray(newMetaKey) ? newMetaKey[0] : newMetaKey;
            } else if (songKey) {
                try {
                    const keyChord = ChordSheetJS.Chord.parse(songKey);
                    if (keyChord) {
                        songKey = keyChord.transpose(song.transposition).toString();
                    }
                } catch {
                    // Fall back to original key if chord parsing fails
                }
            }
        } catch (err) {
            console.warn('Failed to transpose song for PDF export:', err);
        }
    }

    // 2. Parse embedded metadata directives
    const embedded = parseChordPro(contentToProcess);

    const title = sanitizeForPdf(embedded.title || song.title || untitled);
    const author = sanitizeForPdf(song.author || embedded.author || '');
    const key = songKey || embedded.key;
    const capo = song.capo !== undefined
        ? song.capo
        : (embedded.capo ? parseInt(embedded.capo, 10) : undefined);

    // 3. Parse ChordPro content into structured sections
    const sections = parseChordProForDisplay(contentToProcess);

    // Sanitize lyrics and comments in sections to avoid WinAnsi encoding blowout
    sections.forEach(section => {
        if (section.label) {
            section.label = sanitizeForPdf(section.label);
        }
        section.lines.forEach(line => {
            line.items.forEach(item => {
                if (item.lyrics) {
                    item.lyrics = sanitizeForPdf(item.lyrics);
                }
                if (item.comment) {
                    item.comment = sanitizeForPdf(item.comment);
                }
            });
        });
    });

    return {
        title,
        author: author || undefined,
        key,
        capo,
        tuning: song.tuning ? sanitizeForPdf(song.tuning) : undefined,
        sections,
        url: song.url,
    };
}

/**
 * Generates a clean, professional printable PDF document of a setlist tailored
 * for musicians in ceremony.
 */
export async function exportPlaylistToPdf(playlist: ExportPlaylistData): Promise<Blob> {
    const labels = getPdfLabels(playlist.locale);
    if (!playlist.songs || playlist.songs.length === 0) {
        throw new Error('Playlist has no songs to export');
    }

    const MAX_EXPORT_SONGS = 200;
    if (playlist.songs.length > MAX_EXPORT_SONGS) {
        throw new Error(`Export limit exceeded: maximum ${MAX_EXPORT_SONGS} songs allowed per PDF.`);
    }

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
    });

    // Register Unicode DejaVu Sans font for complete diacritics support (e.g. ź, ñ, ā, ī, etc.)
    doc.addFileToVFS('DejaVuSans.ttf', DEJAVU_SANS_REGULAR_B64);
    doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
    doc.addFileToVFS('DejaVuSans-Bold.ttf', DEJAVU_SANS_BOLD_B64);
    doc.addFont('DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftMargin = 40;
    const rightMargin = 40;
    const topMargin = 40;
    const bottomMargin = 52; // leaves room above the 1 cm footer QR code
    const usableWidth = pageWidth - leftMargin - rightMargin;

    let y = topMargin;

    // Track which song is active on each page (pageNumber -> { title, url })
    const pageSongMap = new Map<number, { title: string; url?: string }>();

    // Helper: add page and running header if continuing a song
    const addContinuationPage = (songTitle: string, songUrl?: string) => {
        doc.addPage();
        const newPageNum = doc.getNumberOfPages();
        pageSongMap.set(newPageNum, { title: songTitle, url: songUrl });

        y = topMargin;
        doc.setFont('DejaVuSans', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(156, 163, 175);
        doc.text(labels.continued(songTitle), leftMargin, y);
        y += 18;
    };

    // ─── Setlist Header on Page 1 ─────────────────────────────────────────────
    pageSongMap.set(1, { title: playlist.title || labels.untitledPlaylist });

    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(17, 24, 39); // deep charcoal
    doc.text(sanitizeForPdf(playlist.title || labels.untitledPlaylist), leftMargin, y);
    y += 20;

    // Date & Song Count Sub-header
    const dateStr = new Date().toLocaleDateString(labels.dateLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    const songCount = playlist.songs.length;
    const subtitle = labels.subtitle(songCount, dateStr);

    doc.setFont('DejaVuSans', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(107, 114, 128); // medium gray
    doc.text(subtitle, leftMargin, y);
    y += 14;

    if (playlist.description) {
        doc.setFont('DejaVuSans', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        const descLines = doc.splitTextToSize(sanitizeForPdf(playlist.description), usableWidth);
        doc.text(descLines, leftMargin, y);
        y += descLines.length * 11 + 4;
    }

    // Header divider rule
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(1);
    doc.line(leftMargin, y, pageWidth - rightMargin, y);
    y += 22;

    // ─── Render Each Song ─────────────────────────────────────────────────────
    playlist.songs.forEach((songData, songIdx) => {
        const formattedSong = formatSongForPdf(songData, labels.untitledSong);

        // Subsequent songs start on a fresh page
        if (songIdx > 0) {
            doc.addPage();
            y = topMargin;
        }

        const currentSongPage = doc.getNumberOfPages();
        pageSongMap.set(currentSongPage, { title: formattedSong.title, url: formattedSong.url });

        // Song Title
        doc.setFont('DejaVuSans', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(17, 24, 39);
        doc.text(formattedSong.title, leftMargin, y);
        y += 16;

        // Song Metadata Pills: Author, Key, Capo, Tuning
        const metaPills: string[] = [];
        if (formattedSong.author) metaPills.push(labels.by(formattedSong.author));
        if (formattedSong.key) metaPills.push(labels.key(formattedSong.key));
        if (formattedSong.capo !== undefined && formattedSong.capo > 0) {
            metaPills.push(labels.capo(formattedSong.capo));
        }
        if (formattedSong.tuning) metaPills.push(labels.tuning(formattedSong.tuning));

        if (metaPills.length > 0) {
            doc.setFont('DejaVuSans', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(107, 114, 128);
            const metaLine = metaPills.join('   |   ');
            doc.text(metaLine, leftMargin, y);
            y += 12;
        }

        // Subtle song separator
        doc.setDrawColor(243, 244, 246);
        doc.setLineWidth(0.75);
        doc.line(leftMargin, y, pageWidth - rightMargin, y);
        y += 14;

        // Render Sections
        for (const section of formattedSong.sections) {
            const isChorus = section.type === 'chorus';
            const label = section.label || (isChorus ? 'CHORUS' : undefined);

            if (label) {
                if (y + 20 > pageHeight - bottomMargin) {
                    addContinuationPage(formattedSong.title, formattedSong.url);
                }

                doc.setFont('DejaVuSans', 'bold');
                doc.setFontSize(8.5);
                if (isChorus) {
                    doc.setTextColor(194, 65, 12); // terracotta
                } else {
                    doc.setTextColor(107, 114, 128);
                }
                doc.text(label.toUpperCase(), leftMargin, y);
                y += 12;
            }

            const sectionStartY = y;

            for (const line of section.lines) {
                const hasChordsOnLine = line.items.some(it => !!it.chords);
                const hasComments = line.items.some(it => it.comment !== undefined);
                const lineHeight = hasChordsOnLine ? 23 : 13;

                // Check page bottom overflow
                if (y + lineHeight > pageHeight - bottomMargin) {
                    if (isChorus && y > sectionStartY) {
                        doc.setDrawColor(194, 65, 12);
                        doc.setLineWidth(1.5);
                        doc.line(leftMargin - 8, sectionStartY - 2, leftMargin - 8, y - 2);
                    }

                    addContinuationPage(formattedSong.title, formattedSong.url);
                }

                // Pure comment line
                if (hasComments && line.items.every(it => it.comment !== undefined || (!it.lyrics && !it.chords))) {
                    doc.setFont('DejaVuSans', 'normal');
                    doc.setFontSize(9);
                    doc.setTextColor(107, 114, 128);
                    const commentText = line.items.map(it => it.comment || '').join(' ').trim();
                    doc.text(commentText, leftMargin, y + 8);
                    y += 14;
                    continue;
                }

                // Render line items
                let currentX = leftMargin;
                const chordY = y + 7;
                const lyricY = hasChordsOnLine ? y + 18 : y + 9;

                for (const item of line.items) {
                    if (item.comment !== undefined) {
                        doc.setFont('DejaVuSans', 'normal');
                        doc.setFontSize(8.5);
                        doc.setTextColor(120, 120, 120);
                        const cText = item.comment;
                        doc.text(cText, currentX, lyricY);
                        currentX += doc.getTextWidth(cText) + 4;
                        continue;
                    }

                    const chordText = item.chords || '';
                    const lyricText = item.lyrics || '';

                    doc.setFont('DejaVuSans', 'bold');
                    doc.setFontSize(8.5);
                    const chordWidth = chordText ? doc.getTextWidth(chordText) : 0;

                    doc.setFont('DejaVuSans', 'normal');
                    doc.setFontSize(9.5);
                    const lyricWidth = lyricText ? doc.getTextWidth(lyricText) : 0;

                    // Check horizontal page boundary wrap
                    const itemWidth = Math.max(lyricWidth, chordWidth ? chordWidth + 3 : 0);
                    if (currentX + itemWidth > pageWidth - rightMargin && currentX > leftMargin) {
                        y += lineHeight;
                        currentX = leftMargin + 12; // Hanging indent for wrapped lyrics
                    }

                    // Draw Chord
                    if (chordText) {
                        doc.setFont('DejaVuSans', 'bold');
                        doc.setFontSize(8.5);
                        doc.setTextColor(194, 65, 12); // Terracotta / Ceremony amber
                        doc.text(chordText, currentX, chordY);
                    }

                    // Draw Lyric
                    if (lyricText) {
                        doc.setFont('DejaVuSans', 'normal');
                        doc.setFontSize(9.5);
                        doc.setTextColor(31, 41, 55); // Deep charcoal
                        doc.text(lyricText, currentX, lyricY);
                    }

                    currentX += itemWidth;
                }

                y += lineHeight;
            }

            // Draw Chorus border indicator
            if (isChorus && y > sectionStartY) {
                doc.setDrawColor(194, 65, 12);
                doc.setLineWidth(1.5);
                doc.line(leftMargin - 8, sectionStartY - 2, leftMargin - 8, y - 2);
            }

            y += 10;
        }

        y += 8;
    });

    // ─── Global 3-Part Footer on Every Page ─────────────────────────────────
    // Bottom Left: Song URL
    // Bottom Middle: Playlist: <playlist>
    // ─── Footer: [QR] site host · Playlist: <name> · Page X of Y ─────────────
    const totalPages = doc.getNumberOfPages();
    const siteLabel = footerSiteLabel(playlist.baseUrl);
    const footerBaseline = pageHeight - 20;
    const qrBottomGap = 12;

    // One QR image per distinct song; continuation pages reuse it (jsPDF alias).
    const qrBySongUrl = new Map<string, string>();
    for (let i = 1; i <= totalPages; i++) {
        const absolute = songPageUrl(playlist.baseUrl, pageSongMap.get(i)?.url);
        if (absolute && !qrBySongUrl.has(absolute)) qrBySongUrl.set(absolute, await qrDataUrl(absolute));
    }

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('DejaVuSans', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);

        const absolute = songPageUrl(playlist.baseUrl, pageSongMap.get(i)?.url);
        const qr = absolute ? qrBySongUrl.get(absolute) : undefined;
        let siteX = leftMargin;

        // Bottom Left: QR code linking to the song on this page (1 cm × 1 cm)
        if (absolute && qr) {
            const qrY = pageHeight - qrBottomGap - QR_SIZE_PT;
            doc.addImage(qr, 'PNG', leftMargin, qrY, QR_SIZE_PT, QR_SIZE_PT, absolute, 'NONE');
            doc.link(leftMargin, qrY, QR_SIZE_PT, QR_SIZE_PT, { url: absolute });
            siteX = leftMargin + QR_SIZE_PT + 6;
        }

        // Bottom Left: the site's main URL only
        if (siteLabel) {
            let display = siteLabel;
            while (doc.getTextWidth(display) > 140 && display.length > 10) {
                display = display.slice(0, -4) + '...';
            }
            doc.text(display, siteX, footerBaseline, { align: 'left' });
        }

        // Bottom Middle: Playlist: <name>
        const midFooter = labels.playlist(sanitizeForPdf(playlist.title || labels.untitledPlaylist));
        doc.text(midFooter, pageWidth / 2, footerBaseline, { align: 'center' });

        // Bottom Right: Page X of Y
        doc.text(labels.page(i, totalPages), pageWidth - rightMargin, footerBaseline, { align: 'right' });
    }

    return doc.output('blob');
}

/**
 * Triggers a browser download of the generated PDF Blob.
 */
export function downloadPdf(blob: Blob, filename: string): void {
    if (typeof window === 'undefined') return;

    const cleanFilename = sanitizeFilename(filename);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
