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

  it('keeps a row whose catalog key was removed in the app (review N5)', () => {
    const keyless = {
      songs: [{ ...sample.songs[0], catalog_slug: null, edited_fields: ['catalog_slug'], values: { catalog_slug: null } }],
      versions: [{ ...sample.versions[0], catalog_source_id: null }],
    };
    expect(parseCatalogEditsExport(keyless)).toEqual(keyless);
  });

  const EDITED_AT = '2026-11-12T11:00:00.123456+00:00';

  it.each(['cleared', 'not_marked', 'changed'] as const)(
    'passes the downloaded edited_at and returns the %s answer (review S1)',
    async (answer) => {
      const rpc = vi.fn().mockResolvedValue({ data: answer, error: null });
      await expect(clearCatalogEdit({ rpc }, 'version', 'v1', EDITED_AT)).resolves.toBe(answer);
      expect(rpc).toHaveBeenCalledWith('fn_clear_catalog_edit', { p_kind: 'version', p_id: 'v1', p_edited_at: EDITED_AT });
    }
  );

  it('reports a refused clear as forbidden and anything else as an error (review N2)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const refused = vi.fn().mockResolvedValue({ data: null, error: { code: '42501', message: 'Only admins' } });
    await expect(clearCatalogEdit({ rpc: refused }, 'song', 's1', EDITED_AT)).resolves.toBe('forbidden');
    const failed = vi.fn().mockResolvedValue({ data: null, error: { code: 'XX000', message: 'boom' } });
    await expect(clearCatalogEdit({ rpc: failed }, 'song', 's1', EDITED_AT)).resolves.toBe('error');
    const odd = vi.fn().mockResolvedValue({ data: true, error: null });
    await expect(clearCatalogEdit({ rpc: odd }, 'song', 's1', EDITED_AT)).resolves.toBe('error');
  });
});
