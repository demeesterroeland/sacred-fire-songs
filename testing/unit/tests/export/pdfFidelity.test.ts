// Story 6.2.17 (#520): the PDF sheet of a song matches the screen — book, capo, beats, repeat bars.
import { describe, expect, it } from 'vitest';
import { DEJAVU_SANS_BOLD_B64, DEJAVU_SANS_REGULAR_B64 } from '@/lib/export/dejavuFonts';
import { recordPlaylistPdf } from '../../../bdd/support/pdfRecorder';
import { formatSongForPdf, getPdfLabels, type ExportSongData } from '@/lib/export/pdfExport';
import { PLAYLIST_EXPORT_SELECT, exportSongFromItem } from '@/lib/export/exportSong';
import { exportFingerprint } from '@/lib/export/pdfCache';
import { VERSION_SOURCES_SELECT } from '@/lib/songs/versionSources';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';

const source = { id: 's1', is_primary: true, page: '38', original_title: null, songbooks: { id: 'b1', title: 'Songbook A', short_name: null, compiler: 'Compiler A' } };
const song = (over: Partial<ExportSongData> = {}): ExportSongData => ({
  title: 'Rise Up',
  author: 'Author A',
  key: 'E',
  capo: 5,
  beats: '8',
  tuning: 'Standard',
  sources: [source],
  content: '[E]Rise up\n{start_of_repeat}\n[A]Fire burning\n[E]Sing it\n{end_of_repeat: x2}\n[B]Amen',
  ...over,
});
const sheet = async (songs: ExportSongData[], locale?: 'en' | 'nl') => recordPlaylistPdf({ title: 'Circle', songs, locale });

/** Code points the TTF maps to a glyph, from its cmap (format 4 and 12 subtables). */
function cmapCodePoints(ttf: Buffer): Set<number> {
  const tables = ttf.readUInt16BE(4);
  let cmapAt = -1;
  for (let i = 0; i < tables; i++) if (ttf.toString('latin1', 12 + i * 16, 16 + i * 16) === 'cmap') cmapAt = ttf.readUInt32BE(20 + i * 16);
  if (cmapAt < 0) throw new Error('no cmap table');
  const found = new Set<number>();
  const subtables = ttf.readUInt16BE(cmapAt + 2);
  for (let i = 0; i < subtables; i++) {
    const at = cmapAt + ttf.readUInt32BE(cmapAt + 8 + i * 8);
    const format = ttf.readUInt16BE(at);
    if (format === 4) {
      const segs = ttf.readUInt16BE(at + 6) / 2;
      const ends = at + 14;
      const starts = ends + segs * 2 + 2;
      const deltas = starts + segs * 2;
      const rangeOffsets = deltas + segs * 2;
      for (let s = 0; s < segs; s++) {
        const end = ttf.readUInt16BE(ends + s * 2);
        const start = ttf.readUInt16BE(starts + s * 2);
        const delta = ttf.readUInt16BE(deltas + s * 2);
        const rangeOffset = ttf.readUInt16BE(rangeOffsets + s * 2);
        for (let c = start; c <= end && c < 0xffff; c++) {
          const glyph = rangeOffset === 0 ? (c + delta) & 0xffff : ttf.readUInt16BE(rangeOffsets + s * 2 + rangeOffset + (c - start) * 2);
          if (glyph !== 0 && (rangeOffset === 0 || ((glyph + delta) & 0xffff) !== 0)) found.add(c);
        }
      }
    } else if (format === 12) {
      const groups = ttf.readUInt32BE(at + 12);
      for (let g = 0; g < groups; g++) {
        const start = ttf.readUInt32BE(at + 16 + g * 12);
        const end = ttf.readUInt32BE(at + 20 + g * 12);
        for (let c = start; c <= end; c++) found.add(c);
      }
    }
  }
  return found;
}

describe('PDF sheet fidelity (#520)', () => {
  it('prints key, capo, tuning and beats like the screen meta line, and the source line under the lyrics', async () => {
    const { lines } = await sheet([song()]);
    expect(lines).toContain('By Author A · Key E · Capo 5 · Standard · Beats 8');
    expect(lines).toContain('Songbook A · p. 38 · compiled by Compiler A');
    expect(lines.indexOf('Songbook A · p. 38 · compiled by Compiler A')).toBeGreaterThan(lines.findIndex((l) => l.includes('Amen')));
  });

  it('prints no empty labels for a song without capo, beats or source', async () => {
    const { lines } = await sheet([song({ capo: 0, beats: undefined, tuning: undefined, sources: [], key: undefined, author: undefined })]);
    const all = lines.join('\n');
    expect(all).not.toMatch(/Capo|Beats|Key|Standard|Source|compiled|Tuning/);
    expect(all).not.toMatch(/undefined|null|NaN/);
  });

  it('names beats alone, like the screen', async () => {
    const { lines } = await sheet([song({ key: undefined, capo: undefined, tuning: undefined, author: undefined, beats: '8y4' })]);
    expect(lines).toContain('Beats 8y4');
  });

  it('draws repeat bars: ‖: on the first line, :‖ ×N after the last, an indent for every repeated line', async () => {
    const { drawn, lines } = await sheet([song()]);
    expect(lines.some((l) => l.startsWith('‖:') && l.includes('Fire burning'))).toBe(true);
    expect(lines.some((l) => l.includes('Sing it') && l.endsWith(':‖ ×2'))).toBe(true);
    // Words are drawn one by one at lyric size (9.5 pt); the first word of a line marks where the line starts.
    const x = (word: string) => drawn.find((d) => d.text.trim() === word && d.size === 9.5)!.x;
    expect(x('Fire')).toBeGreaterThan(x('Rise'));
    expect(x('Sing')).toBe(x('Fire'));
    expect(x('Amen')).toBe(x('Rise'));
  });

  it('draws plain bars without a count', async () => {
    const { lines } = await sheet([song({ content: '{start_of_repeat}\nRise up\n{end_of_repeat}' })]);
    expect(lines.some((l) => l.startsWith('‖:') && l.endsWith(':‖') && l.includes('Rise up'))).toBe(true);
  });

  it('prints no bars for a song without repeats', async () => {
    const { lines } = await sheet([song({ content: '[E]Rise up' })]);
    expect(lines.join('')).not.toMatch(/‖/);
  });

  it('prints everything the new lines add at 9 pt or larger', async () => {
    const { drawn } = await sheet([song()]);
    for (const needle of ['Key E', 'Songbook A', '‖:', ':‖']) {
      expect(drawn.find((d) => d.text.includes(needle))!.size).toBeGreaterThanOrEqual(9);
    }
  });

  it('prints the transposed key and chords of a transposed item', async () => {
    const { lines } = await sheet([song({ transposition: 2, content: '[E]Rise up\n[A]Fire' })]);
    expect(lines.some((l) => l.includes('Key F#'))).toBe(true);
    expect(lines).toContain('F#'); // [E] two semitones up
    expect(lines).toContain('B'); // [A] two semitones up
  });

  it('labels follow the exporting user\'s language', async () => {
    const { lines } = await sheet([song()], 'nl');
    expect(lines.find((l) => l.includes('Capo 5'))).toBe(`Door Author A · ${DICTIONARIES.nl['song.meta.key'].replace('{key}', 'E')} · Capo 5 · ${DICTIONARIES.nl['song.metadata.standard']} · ${DICTIONARIES.nl['song.meta.beats'].replace('{beats}', '8')}`);
    expect(lines.some((l) => l.includes(DICTIONARIES.nl['song.source.compiledBy'].replace('{compiler}', 'Compiler A')))).toBe(true);
  });

  it('the repeat and source signs are in both embedded fonts, so they print as such', () => {
    // ‖ (repeat bar), × (count) and · (meta separator), read from the font's own cmap.
    for (const [name, b64] of [['regular', DEJAVU_SANS_REGULAR_B64], ['bold', DEJAVU_SANS_BOLD_B64]]) {
      const cmap = cmapCodePoints(Buffer.from(b64, 'base64'));
      for (const sign of ['‖', '×', '·', ':']) expect(cmap.has(sign.codePointAt(0)!), `${name} font lacks ${sign}`).toBe(true);
    }
  });

  it('formatSongForPdf carries beats and sources', () => {
    const f = formatSongForPdf(song());
    expect(f.beats).toBe('8');
    expect(f.sources).toHaveLength(1);
  });

  it('every language has the labels the sheet prints', () => {
    for (const l of SUPPORTED_LOCALES) {
      const labels = getPdfLabels(l);
      expect(labels.technical({ key: 'E', capo: 5, beats: '8' }).length).toBeGreaterThanOrEqual(3);
      expect(labels.sourceLines([source], 'Rise Up')).toEqual([expect.stringContaining('Songbook A')]);
      expect(labels.repeatEnd(2)).toBe(':‖ ×2');
    }
  });
});

describe('PDF layout of long and repeated lines (#520 review)', () => {
  const PAGE_HEIGHT = 841.89;
  const BOTTOM = PAGE_HEIGHT - 52;
  const RIGHT = 595.28 - 40;
  const long = Array.from({ length: 60 }, () => 'ab').join(' ');

  it('a wrapped row never lands in the footer area, whatever line it starts on', async () => {
    for (let n = 20; n <= 50; n++) {
      for (const chords of [false, true]) {
        const lines = Array.from({ length: n }, (_, i) => (chords ? `[E]short ${i}` : `short ${i}`)).join('\n');
        const { drawn } = await sheet([song({ content: `${lines}\n${chords ? '[A]' : ''}${long} ${long} ${long}` })]);
        const low = drawn.filter((d) => d.size === 9.5 && d.y > BOTTOM);
        expect(low.map((d) => `${d.page}:${d.y}:${d.text}`), `n=${n} chords=${chords}`).toEqual([]);
      }
    }
  });

  it('a wrapped row of a repeated line never lands in the footer area', async () => {
    for (let n = 20; n <= 50; n++) {
      const lines = Array.from({ length: n }, (_, i) => `short ${i}`).join('\n');
      const { drawn } = await sheet([song({ content: `${lines}\n{start_of_repeat}\n${long} ${long}\n{end_of_repeat}` })]);
      expect(drawn.filter((d) => d.size === 9.5 && d.y > BOTTOM), `n=${n}`).toEqual([]);
    }
  });

  it('the closing bar never overlaps text, also when the text reaches the right margin', async () => {
    const words = (count: number) => Array.from({ length: count }, () => 'ab ').join('');
    for (let count = 55; count <= 75; count++) {
      for (const end of ['{end_of_repeat: x3}', '{end_of_repeat}']) {
        const { drawn } = await sheet([song({ content: `{start_of_repeat}\n${words(count)}\n${end}` })]);
        const text = drawn.filter((d) => d.size >= 9 && d.text.trim() !== '');
        for (const a of text) {
          expect(a.x + a.width, `${count}: ${a.text} passes the margin`).toBeLessThanOrEqual(RIGHT + 0.5);
          for (const b of text) {
            if (a === b || a.page !== b.page || Math.abs(a.y - b.y) > 1) continue;
            const overlap = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
            // trailing spaces of a lyric word may touch the next word, never cover it
            expect(overlap, `${count}: "${a.text}"@${a.x} and "${b.text}"@${b.x} overlap`).toBeLessThanOrEqual(0.01);
          }
        }
        expect(drawn.some((d) => d.text.startsWith(':‖')), `count ${count} closing bar`).toBe(true);
      }
    }
  });

  it('a closing bar on a comment line follows the comment closely and never overlaps it', async () => {
    const { drawn } = await sheet([song({ content: '{start_of_repeat}\nSing it\n{comment: Repeat after me}\n{end_of_repeat: x2}' })]);
    const comment = drawn.find((d) => d.text === 'Repeat after me')!;
    const bar = drawn.find((d) => d.text.startsWith(':‖'))!;
    expect(bar.x).toBeGreaterThanOrEqual(comment.x + comment.width);
    expect(bar.x - (comment.x + comment.width)).toBeLessThanOrEqual(5);
  });
});

describe('what the playlist export reads (#520)', () => {
  const item = (versionId: string, over: Record<string, unknown> = {}) => ({
    id: `item-${versionId}`,
    order_index: 0,
    transposition_override: null,
    song_versions: {
      id: versionId,
      key: 'E',
      capo: 5,
      tuning: 'Standard',
      beats: '8',
      content_chordpro: `[E]Lyrics of ${versionId}`,
      song_version_sources: [source],
      compositions: { id: 'c1', title: 'Rise Up', original_author: 'Author A' },
      ...over,
    },
  });

  it('exports the version the item is pinned to, with its own key, capo, beats and source, and the item\'s transposition', () => {
    const second = { ...item('v2', { key: 'G', capo: 0, beats: null, song_version_sources: [] }), transposition_override: 2 };
    const exported = exportSongFromItem(second);
    expect(exported).toMatchObject({ key: 'G', capo: 0, transposition: 2, content: '[E]Lyrics of v2', url: '/songs/c1' });
    expect(exported.beats).toBeUndefined();
    expect(exported.sources).toEqual([]);
    const first = exportSongFromItem(item('v1'));
    expect(first).toMatchObject({ key: 'E', capo: 5, beats: '8', tuning: 'Standard', content: '[E]Lyrics of v1' });
    expect(first.sources).toEqual([source]);
  });

  it('tolerates an item without a readable version', () => {
    expect(exportSongFromItem({ id: 'x', order_index: 0, transposition_override: null, song_versions: null })).toMatchObject({ title: '', content: '' });
  });

  it('an item without a title prints the translated "untitled song" label, not an English word', async () => {
    const untitled = exportSongFromItem({ id: 'x', order_index: 0, transposition_override: null, song_versions: { id: 'v', content_chordpro: '[E]Words', compositions: null } });
    const { lines } = await sheet([untitled], 'nl');
    expect(lines).toContain(DICTIONARIES.nl['pdf.untitledSong']);
    expect(lines.join('\n')).not.toContain('Unknown');
  });

  it('selects the sources once, from the shared fragment, and no translations: a translation-only song exports its original', () => {
    expect(PLAYLIST_EXPORT_SELECT.match(/song_version_sources(![\w]+)?\s*\(/g)).toHaveLength(1);
    expect(PLAYLIST_EXPORT_SELECT).toContain(VERSION_SOURCES_SELECT);
    expect(PLAYLIST_EXPORT_SELECT).not.toMatch(/song_translations/);
    expect(PLAYLIST_EXPORT_SELECT).toMatch(/transposition_override/);
    expect(PLAYLIST_EXPORT_SELECT).toMatch(/\bbeats\b/);
  });

  it('a changed beats value or source gives a new cache fingerprint', async () => {
    const base = { userId: 'u', playlistId: 'p', locale: 'en', title: 'T', songs: [song()] };
    const a = await exportFingerprint(base);
    expect(await exportFingerprint({ ...base, songs: [song({ beats: '4' })] })).not.toBe(a);
    expect(await exportFingerprint({ ...base, songs: [song({ sources: [] })] })).not.toBe(a);
    expect(await exportFingerprint({ ...base, songs: [song({ tuning: 'Drop D' })] })).not.toBe(a);
  });

  it('the order the database returns the sources in does not change the fingerprint', async () => {
    const other = { id: 's2', is_primary: false, page: '7', original_title: null, songbooks: { id: 'b2', title: 'Songbook B', short_name: null, compiler: null } };
    const third = { id: 's3', is_primary: false, page: '9', original_title: null, songbooks: { id: 'b3', title: 'Songbook C', short_name: null, compiler: null } };
    const base = { userId: 'u', playlistId: 'p', locale: 'en', title: 'T' };
    const a = await exportFingerprint({ ...base, songs: [song({ sources: [source, other, third] })] });
    expect(await exportFingerprint({ ...base, songs: [song({ sources: [third, other, source] })] })).toBe(a);
    expect(await exportFingerprint({ ...base, songs: [song({ sources: [other, source, third] })] })).toBe(a);  });
});
