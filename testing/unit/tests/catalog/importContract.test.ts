import { describe, expect, it } from 'vitest';
import {
  catalogVersionKey,
  formatSkippedReport,
  planCatalogImport,
  resolveCatalogSlug,
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

/**
 * Review of PR #540 (S3): a song merged in the app by linking it as a version of another song
 * leaves a redirect (old song id, new song id, the old song's catalog slug). The importer must not
 * recreate the old song; it follows the redirects it was given to the song that now holds it.
 */
describe('resolveCatalogSlug', () => {
  const A = '00000000-0000-4000-8000-00000000000a';
  const B = '00000000-0000-4000-8000-00000000000b';
  const C = '00000000-0000-4000-8000-00000000000c';

  it('imports a slug that was never merged away', () => {
    expect(resolveCatalogSlug('song-a', [])).toEqual({ action: 'import', slug: 'song-a' });
    expect(resolveCatalogSlug('song-a', [{ old_id: B, new_id: C, catalog_slug: 'song-b' }])).toEqual({
      action: 'import',
      slug: 'song-a',
    });
  });

  it('sends a merged slug to the song that now holds it and tells the importer not to recreate it', () => {
    expect(resolveCatalogSlug('song-a', [{ old_id: A, new_id: B, catalog_slug: 'song-a' }])).toEqual({
      action: 'redirect',
      slug: 'song-a',
      targetSongId: B,
    });
  });

  it('follows a chain of merges to the last song', () => {
    const redirects = [
      { old_id: B, new_id: C, catalog_slug: 'song-b' },
      { old_id: A, new_id: B, catalog_slug: 'song-a' },
    ];
    expect(resolveCatalogSlug('song-a', redirects)).toEqual({ action: 'redirect', slug: 'song-a', targetSongId: C });
  });

  it('stops on a cycle instead of looping', () => {
    const redirects = [
      { old_id: A, new_id: B, catalog_slug: 'song-a' },
      { old_id: B, new_id: A, catalog_slug: 'song-b' },
    ];
    expect(resolveCatalogSlug('song-a', redirects)).toEqual({ action: 'redirect', slug: 'song-a', targetSongId: A });
  });

  it('ignores redirects without a catalog slug', () => {
    expect(resolveCatalogSlug('song-a', [{ old_id: A, new_id: B, catalog_slug: null }])).toEqual({
      action: 'import',
      slug: 'song-a',
    });
  });
});
