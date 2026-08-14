import { describe, it, expect } from 'vitest';
import { parseArtists, formatArtists, sortTagSuggestions } from '../songs/artistUtils';

describe('artistUtils', () => {
  describe('parseArtists', () => {
    it('returns empty array for null/undefined/empty string', () => {
      expect(parseArtists(null)).toEqual([]);
      expect(parseArtists(undefined)).toEqual([]);
      expect(parseArtists('')).toEqual([]);
      expect(parseArtists('   ')).toEqual([]);
    });

    it('parses single artist', () => {
      expect(parseArtists('Herbert Quinteros')).toEqual(['Herbert Quinteros']);
    });

    it('parses comma-separated artists', () => {
      expect(parseArtists('Herbert Quinteros, Cari El')).toEqual(['Herbert Quinteros', 'Cari El']);
      expect(parseArtists('Herbert Quinteros, Cari El, Shimshai')).toEqual([
        'Herbert Quinteros',
        'Cari El',
        'Shimshai',
      ]);
    });

    it('parses slash and & separated artists', () => {
      expect(parseArtists('Herbert Quinteros / Cari El')).toEqual(['Herbert Quinteros', 'Cari El']);
      expect(parseArtists('Herbert Quinteros & Cari El')).toEqual(['Herbert Quinteros', 'Cari El']);
      expect(parseArtists('Herbert Quinteros and Cari El')).toEqual(['Herbert Quinteros', 'Cari El']);
    });

    it('deduplicates case-insensitively while preserving first seen casing', () => {
      expect(parseArtists('Shimshai, shimshai, Cari El')).toEqual(['Shimshai', 'Cari El']);
    });
  });

  describe('formatArtists', () => {
    it('returns empty string for empty array', () => {
      expect(formatArtists([])).toBe('');
    });

    it('formats multiple artists into comma-separated string', () => {
      expect(formatArtists(['Herbert Quinteros', 'Cari El'])).toBe('Herbert Quinteros, Cari El');
    });

    it('trims and deduplicates artists', () => {
      expect(formatArtists([' Herbert Quinteros ', 'Cari El', 'Herbert Quinteros'])).toBe(
        'Herbert Quinteros, Cari El'
      );
    });
  });

  describe('sortTagSuggestions', () => {
    it('sorts by song_count descending, then alphabetically', () => {
      const items = [
        { name: 'Cari El', song_count: 5 },
        { name: 'Danit', song_count: 12 },
        { name: 'Herbert Quinteros', song_count: 5 },
        { name: 'Ayla Nereo', song_count: 2 },
      ];

      const sorted = sortTagSuggestions(items);

      expect(sorted.map((i) => i.name)).toEqual([
        'Danit',
        'Cari El',
        'Herbert Quinteros',
        'Ayla Nereo',
      ]);
    });
  });
});
