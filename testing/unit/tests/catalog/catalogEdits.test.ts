import { describe, expect, it, vi } from 'vitest';
import {
  CATALOG_EDITS_FORMAT,
  buildCatalogEditsFile,
  catalogEditsFileName,
  clearCatalogEdit,
  fetchCatalogEdits,
  parseCatalogEditsExport,
  type CatalogEditsExport,
} from '@/lib/catalog/catalogEdits';

/** Story 6.2.21 (#524): the admin export of catalog rows corrected in the app. */
const sample: CatalogEditsExport = {
  songs: [
    {
      song_id: 's1',
      catalog_slug: 'song-a',
      title: 'Song A (corrected)',
      edited_at: '2026-11-12T10:00:00+00:00',
      edited_fields: ['title'],
      values: { title: 'Song A (corrected)' },
    },
  ],
  versions: [
    {
      song_id: 's1',
      version_id: 'v1',
      catalog_slug: 'song-a',
      catalog_source_id: 'book-1',
      title: 'Song A (corrected)',
      version_name: 'Book 1',
      edited_at: '2026-11-12T11:00:00+00:00',
      edited_fields: ['capo', 'key'],
      values: { capo: 2, key: 'G' },
    },
  ],
};

describe('catalog edits export', () => {
  it('names the file after the export day', () => {
    expect(catalogEditsFileName(new Date('2026-11-12T23:30:00Z'))).toBe('catalog-edits-2026-11-12.json');
  });

  it('wraps the rows in a versioned file', () => {
    const file = buildCatalogEditsFile(sample, new Date('2026-11-12T12:00:00Z'));
    expect(file).toEqual({
      format: CATALOG_EDITS_FORMAT,
      version: 1,
      exported_at: '2026-11-12T12:00:00.000Z',
      ...sample,
    });
  });

  it('parses the RPC result and drops malformed rows', () => {
    expect(parseCatalogEditsExport(sample)).toEqual(sample);
    expect(parseCatalogEditsExport(null)).toEqual({ songs: [], versions: [] });
    expect(
      parseCatalogEditsExport({ songs: [{ song_id: 1 }], versions: 'nope' })
    ).toEqual({ songs: [], versions: [] });
  });

  it('fetches the export through the admin-only RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: sample, error: null });
    await expect(fetchCatalogEdits({ rpc })).resolves.toEqual(sample);
    expect(rpc).toHaveBeenCalledWith('fn_catalog_edits_export');
  });

  it('returns null when the RPC refuses the caller', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { code: '42501', message: 'Only admins' } });
    await expect(fetchCatalogEdits({ rpc })).resolves.toBeNull();
  });

  it('clears one marker through the admin-only RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    await expect(clearCatalogEdit({ rpc }, 'version', 'v1')).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith('fn_clear_catalog_edit', { p_kind: 'version', p_id: 'v1' });
  });

  it('reports a refused clear as false', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { code: '42501', message: 'Only admins' } });
    await expect(clearCatalogEdit({ rpc }, 'song', 's1')).resolves.toBe(false);
  });
});
