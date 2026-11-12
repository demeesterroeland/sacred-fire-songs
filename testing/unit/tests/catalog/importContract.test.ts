import { describe, expect, it } from 'vitest';
import {
  catalogVersionKey,
  formatSkippedReport,
  planCatalogImport,
  type CatalogEditMarker,
} from '@/lib/catalog/importContract';

/** Story 6.2.21 (#524): an importer that follows the contract skips app-edited rows and reports them. */
describe('planCatalogImport', () => {
  const edited: CatalogEditMarker = {
    edited_in_app: true,
    edited_at: '2026-11-12T10:00:00.000Z',
    edited_fields: ['content_chordpro', 'key'],
  };
  const untouched: CatalogEditMarker = { edited_in_app: false, edited_at: null, edited_fields: [] };

  const incoming = [
    { slug: 'song-a', source: 'book-1', lyrics: 'from catalog' },
    { slug: 'song-a', source: 'book-2', lyrics: 'from catalog' },
    { slug: 'song-b', source: 'book-1', lyrics: 'new song' },
  ];
  const keyOf = (row: (typeof incoming)[number]) => catalogVersionKey(row.slug, row.source);

  it('writes new and unedited rows and skips rows edited in the app', () => {
    const existing = new Map([
      [catalogVersionKey('song-a', 'book-1'), edited],
      [catalogVersionKey('song-a', 'book-2'), untouched],
    ]);

    const plan = planCatalogImport(incoming, existing, keyOf);

    expect(plan.write).toEqual([incoming[1], incoming[2]]);
    expect(plan.skipped).toEqual([
      { key: 'song-a/book-1', editedAt: '2026-11-12T10:00:00.000Z', editedFields: ['content_chordpro', 'key'] },
    ]);
  });

  it('writes everything when nothing was edited', () => {
    const plan = planCatalogImport(incoming, new Map(), keyOf);
    expect(plan.write).toEqual(incoming);
    expect(plan.skipped).toEqual([]);
  });

  it('reports each skipped row on its own line, with its fields', () => {
    const report = formatSkippedReport([
      { key: 'song-a/book-1', editedAt: '2026-11-12T10:00:00.000Z', editedFields: ['content_chordpro', 'key'] },
    ]);
    expect(report).toBe(
      'Skipped 1 row edited in the app:\n  song-a/book-1 (edited 2026-11-12T10:00:00.000Z: content_chordpro, key)'
    );
    expect(formatSkippedReport([])).toBe('Skipped 0 rows edited in the app.');
  });

  it('builds a version key from the song slug and the catalog source id', () => {
    expect(catalogVersionKey('song-a', 'book-1')).toBe('song-a/book-1');
  });
});
