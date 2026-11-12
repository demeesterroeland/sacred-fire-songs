// Story 6.2.12 / G2.3 (#515): the artists index and its counts match the author filter (authors[] ∪ original_author).
import { describe, expect, it } from 'vitest';
import { aggregateArtists } from '@/lib/songs/artistIndex';
import { songFilterConfig } from '@/lib/songs/filterConfig';
import type { Song } from '@/lib/songUtils';

const names = (rows: Parameters<typeof aggregateArtists>[0]) => aggregateArtists(rows).map((a) => a.name);

describe('aggregateArtists', () => {
  it('lists a co-author that is only in authors[]', () => {
    const result = aggregateArtists([
      { title: 'Song 1', original_author: 'Anna Lee', authors: ['Anna Lee', 'Ben Cruz'] },
    ]);
    expect(result.map((a) => a.name)).toEqual(['Anna Lee', 'Ben Cruz']);
    expect(result.every((a) => a.songCount === 1)).toBe(true);
  });

  it('uses original_author when authors is empty or missing', () => {
    expect(names([{ title: 'A', original_author: 'Anna Lee, Ben Cruz', authors: [] }])).toEqual(['Anna Lee', 'Ben Cruz']);
    expect(names([{ title: 'A', original_author: 'Cari El' }])).toEqual(['Cari El']);
  });

  it('counts a song once per author even when both columns name the same person', () => {
    const result = aggregateArtists([
      { title: 'Song 1', original_author: 'Anna Lee, Ben Cruz', authors: ['anna  lee', 'Ben Cruz'] },
      { title: 'Song 2', original_author: 'Anna Lee', authors: [] },
    ]);
    expect(result.find((a) => a.name === 'Anna Lee')?.songCount).toBe(2);
    expect(result.find((a) => a.name === 'Ben Cruz')?.songCount).toBe(1);
  });

  it('puts a song with no author at all under No Artist', () => {
    const result = aggregateArtists([
      { title: 'Song 1', original_author: null, authors: [] },
      { title: 'Song 2', original_author: '  ', authors: ['  '] },
    ]);
    expect(result).toEqual([{ name: 'No Artist', songCount: 2, songTitles: ['Song 1', 'Song 2'] }]);
  });

  it('a song with only authors[] is not "No Artist"', () => {
    expect(names([{ title: 'Song 1', original_author: '', authors: ['Ben Cruz'] }])).toEqual(['Ben Cruz']);
  });

  it('merges spelling variants by case, spacing and accents', () => {
    const result = aggregateArtists([
      { title: 'S1', original_author: 'José  María', authors: [] },
      { title: 'S2', original_author: 'jose maria', authors: ['José María'] },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].songCount).toBe(2);
  });

  // The index and the filter must agree: every listed name finds exactly the songs counted for it.
  it('every listed artist and its count match the artist filter over the same songs', () => {
    const rows = [
      { title: 'S1', original_author: 'Anna Lee', authors: ['Anna Lee', 'Ben Cruz'] },
      { title: 'S2', original_author: 'Ben Cruz, Cari El', authors: [] },
      { title: 'S3', original_author: '', authors: ['Cari El'] },
      { title: 'S4', original_author: null, authors: [] },
    ];
    const rule = songFilterConfig.artist!;
    for (const artist of aggregateArtists(rows)) {
      const matching = rows.filter((r) =>
        rule.match({ title: r.title, author: r.original_author ?? '', authors: r.authors } as unknown as Song, artist.name)
      );
      expect(matching.length, artist.name).toBe(artist.songCount);
    }
  });
});
