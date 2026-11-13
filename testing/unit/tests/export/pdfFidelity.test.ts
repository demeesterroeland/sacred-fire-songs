// Story 6.2.17 (#520): the PDF sheet of a song matches the screen — book, capo, beats, repeat bars.
import { describe, expect, it } from 'vitest';
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

  it('the repeat and source signs are in the embedded font, so they print as such', async () => {
    const { blob } = await sheet([song()]);
    expect(blob.size).toBeGreaterThan(5000);
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
    expect(exportSongFromItem({ id: 'x', order_index: 0, transposition_override: null, song_versions: null })).toMatchObject({ title: 'Unknown', content: '' });
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
});
