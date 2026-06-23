import { describe, it, expect } from 'vitest';
import { normalizeWhitespace } from '../utils';
import { songFilterConfig } from '../songs/filterConfig';

// Helper mimicking fetchArtistsServer aggregation logic
function aggregateArtistsMock(rows: { title: string; original_author: string | null }[]) {
  const authorCounts = new Map<string, number>();
  const authorTitles = new Map<string, string[]>();
  const authorCanonicalNames = new Map<string, string>();
  let unspecifiedCount = 0;
  const unspecifiedTitles: string[] = [];

  for (const row of rows || []) {
    const originalName = row.original_author as string;
    if (!originalName) {
      unspecifiedCount++;
      if (unspecifiedTitles.length < 5 && row.title) {
        unspecifiedTitles.push(row.title as string);
      }
      continue;
    }

    const normalized = normalizeWhitespace(originalName);
    if (!normalized) continue;

    const key = normalized.toLowerCase();

    authorCounts.set(key, (authorCounts.get(key) || 0) + 1);

    if (!authorTitles.has(key)) authorTitles.set(key, []);
    const titles = authorTitles.get(key)!;
    if (titles.length < 5 && row.title) titles.push(row.title as string);

    const existingCanonical = authorCanonicalNames.get(key);
    if (!existingCanonical) {
      authorCanonicalNames.set(key, normalized);
    } else {
      const existingUppers = (existingCanonical.match(/[A-Z]/g) || []).length;
      const newUppers = (normalized.match(/[A-Z]/g) || []).length;
      if (newUppers > existingUppers) {
        authorCanonicalNames.set(key, normalized);
      }
    }
  }

  const result = Array.from(authorCounts.entries())
    .map(([key, songCount]) => ({
      name: authorCanonicalNames.get(key) || key,
      songCount,
      songTitles: authorTitles.get(key) || [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (unspecifiedCount > 0) {
    result.push({
      name: 'No Artist',
      songCount: unspecifiedCount,
      songTitles: unspecifiedTitles,
    });
  }

  return result;
}

describe('Artist Normalization & Aggregation', () => {
  it('collapses multiple spaces in normalizeWhitespace', () => {
    expect(normalizeWhitespace('FirstName  SecondName')).toBe('FirstName SecondName');
    expect(normalizeWhitespace('  FirstName   SecondName  ')).toBe('FirstName SecondName');
  });

  it('aggregates same artist with different spacing or casing into a single canonical entry', () => {
    const rows = [
      { title: 'Song 1', original_author: 'FirstName SecondName' },
      { title: 'Song 2', original_author: 'FirstName  SecondName' }, // double space
      { title: 'Song 3', original_author: 'firstname secondname' }, // lower case
      { title: 'Song 4', original_author: '  FirstName SecondName  ' }, // padded
    ];

    const result = aggregateArtistsMock(rows);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('FirstName SecondName');
    expect(result[0].songCount).toBe(4);
    expect(result[0].songTitles).toEqual(['Song 1', 'Song 2', 'Song 3', 'Song 4']);
  });

  it('chooses the canonical name casing with more uppercase characters', () => {
    const rows = [
      { title: 'Song 1', original_author: 'traditional' },
      { title: 'Song 2', original_author: 'Traditional' },
    ];
    const result = aggregateArtistsMock(rows);
    expect(result[0].name).toBe('Traditional');
    expect(result[0].songCount).toBe(2);
  });

  it('aggregates null/empty authors under No Artist at the end', () => {
    const rows = [
      { title: 'Song A', original_author: 'Traditional' },
      { title: 'Song B', original_author: null },
      { title: 'Song C', original_author: '' },
      { title: 'Song D', original_author: 'Danit' },
    ];
    const result = aggregateArtistsMock(rows);
    expect(result).toHaveLength(3);
    // alphabetical sort: Danit, Traditional, then No Artist at the end
    expect(result[0].name).toBe('Danit');
    expect(result[1].name).toBe('Traditional');
    expect(result[2].name).toBe('No Artist');
    expect(result[2].songCount).toBe(2);
    expect(result[2].songTitles).toEqual(['Song B', 'Song C']);
  });
});

import { Song } from '../songUtils';

describe('songFilterConfig artist matching', () => {
  const matchingRule = songFilterConfig.artist;

  it('is active only for non-empty trimmed values', () => {
    expect(matchingRule.isActive(undefined)).toBe(false);
    expect(matchingRule.isActive('')).toBe(false);
    expect(matchingRule.isActive('  ')).toBe(false);
    expect(matchingRule.isActive('Danit')).toBe(true);
  });

  it('matches artist name case-insensitively and with collapsed spaces', () => {
    const mockSong = { author: 'First  Last' } as unknown as Song;
    expect(matchingRule.match(mockSong, 'First Last')).toBe(true);
    expect(matchingRule.match(mockSong, 'first   last')).toBe(true);
    expect(matchingRule.match(mockSong, 'Other')).toBe(false);
  });

  it('matches empty/null author if filter is No Artist or unspecified', () => {
    const mockSongNoAuthor1 = { author: '' } as unknown as Song;
    const mockSongNoAuthor2 = { author: undefined } as unknown as Song;
    const mockSongWithAuthor = { author: 'Danit' } as unknown as Song;

    expect(matchingRule.match(mockSongNoAuthor1, 'No Artist')).toBe(true);
    expect(matchingRule.match(mockSongNoAuthor2, 'unspecified')).toBe(true);
    expect(matchingRule.match(mockSongWithAuthor, 'No Artist')).toBe(false);
  });
});
