import { describe, it, expect } from 'vitest';
import { filterSongs } from '../songUtils';

describe('filterSongs', () => {
    const mockSongs = [
        { id: "1", title: "Grandmother Earth", author: "Traditional", songKey: "Am", color: "red", createdAt: "2024-01-01", categories: [] },
        { id: "2", title: "Aguita de la Vida", author: "Danit", songKey: "Em", color: "orange", createdAt: "2024-01-02", categories: [] },
        { id: "3", title: "Pachamama", author: "Medicine Family", songKey: "G", color: "yellow", createdAt: "2024-01-03", categories: [] },
    ];
    it('filters by title (case insensitive)', () => {
        const result = filterSongs(mockSongs, 'GRAND');
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Grandmother Earth');
    });

    it('filters by author', () => {
        const result = filterSongs(mockSongs, 'Danit');
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Aguita de la Vida');
    });

    it('returns all songs for an empty query', () => {
        const result = filterSongs(mockSongs, '');
        expect(result).toHaveLength(3);
    });

    it('returns an empty array for no match', () => {
        const result = filterSongs(mockSongs, 'xyz');
        expect(result).toHaveLength(0);
    });
});