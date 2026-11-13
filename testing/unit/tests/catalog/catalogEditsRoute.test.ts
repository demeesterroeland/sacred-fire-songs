import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Story 6.2.21 (#524): the JSON download is for admins only. */
const rpc = vi.fn();
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ rpc }) }));

const { GET } = await import('@/app/admin/catalog-edits/export/route');

describe('GET /admin/catalog-edits/export', () => {
  beforeEach(() => rpc.mockReset());

  it('answers 403 when the RPC refuses the caller', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'Only admins can export catalog edits' } });
    const response = await GET();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'forbidden' });
  });

  it('downloads the versioned JSON file for an admin', async () => {
    rpc.mockResolvedValue({
      data: {
        songs: [],
        versions: [
          {
            song_id: 's1',
            version_id: 'v1',
            catalog_slug: 'song-a',
            catalog_source_id: 'book-1',
            title: 'Song A',
            version_name: 'Book 1',
            edited_at: '2026-11-12T11:00:00+00:00',
            edited_fields: ['key'],
            values: { key: 'G' },
          },
        ],
      },
      error: null,
    });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('content-disposition')).toMatch(/^attachment; filename="catalog-edits-\d{4}-\d{2}-\d{2}\.json"$/);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const body = await response.json();
    expect(body.format).toBe('sacred-fire-songs/catalog-edits');
    expect(body.versions[0]).toMatchObject({ catalog_slug: 'song-a', catalog_source_id: 'book-1', values: { key: 'G' } });
  });
});
