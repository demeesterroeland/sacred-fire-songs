import { describe, it, expect } from 'vitest';
import { normalizeWhitespace } from '../utils';

// Helper mimicking fetchArtistsServer aggregation logic
function aggregateArtistsMock(rows: { title: string; original_author: string | null }[]) {
  const authorCounts = new Map<string, number>();
  const authorTitles = new Map<string, string[]>();
  const authorCanonicalNames = new Map<string, string>();

  for (const row of rows || []) {
    const originalName = row.original_author as string;
    if (!originalName) continue;

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

  return Array.from(authorCounts.entries())
    .map(([key, songCount]) => ({
      name: authorCanonicalNames.get(key) || key,
      songCount,
      songTitles: authorTitles.get(key) || [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
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
});
