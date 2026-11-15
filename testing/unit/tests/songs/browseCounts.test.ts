// Story 6.2.25 / G5.8 (#570): pure mapping and RPC fetch for global search songbook and language counts.
import { describe, expect, it, vi } from 'vitest';
import { browseOptionsFromRows } from '@/lib/songs/browseFilters';
import { fetchBrowseFilterCounts } from '@/lib/songs/browseCounts';

describe('browseOptionsFromRows', () => {
  it('splits songbook and language rows into sorted BrowseOptions', () => {
    const rows = [
      { kind: 'songbook', value: 'bk-b', label: 'Zebra Book', song_count: 4 },
      { kind: 'songbook', value: 'bk-a', label: 'alpha book', song_count: 12 },
      { kind: 'language', value: 'spanish', label: 'Spanish', song_count: 9 },
      { kind: 'language', value: 'english', label: 'English', song_count: 15 },
    ];

    const result = browseOptionsFromRows(rows, 'en');

    expect(result.songbooks).toEqual([
      { value: 'bk-a', label: 'alpha book', count: 12 },
      { value: 'bk-b', label: 'Zebra Book', count: 4 },
    ]);
    expect(result.languages).toEqual([
      { value: 'english', label: 'English', count: 15 },
      { value: 'spanish', label: 'Spanish', count: 9 },
    ]);
  });

  it('returns empty arrays for null, undefined, or unknown kinds', () => {
    expect(browseOptionsFromRows(null)).toEqual({ songbooks: [], languages: [] });
    expect(browseOptionsFromRows(undefined)).toEqual({ songbooks: [], languages: [] });
    expect(
      browseOptionsFromRows([{ kind: 'other', value: 'x', label: 'X', song_count: 3 }])
    ).toEqual({ songbooks: [], languages: [] });
  });
});

describe('fetchBrowseFilterCounts', () => {
  it('calls fn_search_filter_counts via rpc and returns rows', async () => {
    const rows = [{ kind: 'songbook', value: 'bk-a', label: 'Book A', song_count: 3 }];
    const rpc = vi.fn().mockResolvedValue({ data: rows, error: null });

    const data = await fetchBrowseFilterCounts({ rpc });

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('fn_search_filter_counts');
    expect(data).toEqual(rows);
  });

  it('returns an empty array when rpc errors', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });

    const data = await fetchBrowseFilterCounts({ rpc });

    expect(data).toEqual([]);
    errSpy.mockRestore();
  });
});
