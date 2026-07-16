import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isSmartPlaylist } from '@/lib/playlists/smartPlaylists';
import { uuid, playlistTitle, playlistDescription, safeParse } from '@/lib/validation/schemas';

describe('isSmartPlaylist', () => {
    it('returns true for My Favorites', () => {
        expect(isSmartPlaylist('My Favorites')).toBe(true);
    });
    it('returns true for My Songs', () => {
        expect(isSmartPlaylist('My Songs')).toBe(true);
    });
    it('returns true for My Drafts', () => {
        expect(isSmartPlaylist('My Drafts')).toBe(true);
    });
    it('returns false for user-created playlists', () => {
        expect(isSmartPlaylist('My Weekend Set')).toBe(false);
    });
    it('is case-sensitive', () => {
        expect(isSmartPlaylist('my favorites')).toBe(false);
    });
    it('returns false for empty string', () => {
        expect(isSmartPlaylist('')).toBe(false);
    });
});

describe('createPlaylist validation', () => {
    it('rejects empty title', () => {
        const result = safeParse(playlistTitle, '');
        expect(result).toHaveProperty('error');
    });

    it('rejects whitespace-only title', () => {
        const result = safeParse(playlistTitle, '   ');
        expect(result).toHaveProperty('error');
    });

    it('rejects title over 200 chars', () => {
        const result = safeParse(playlistTitle, 'x'.repeat(201));
        expect(result).toHaveProperty('error');
    });

    it('accepts valid title', () => {
        const result = safeParse(playlistTitle, 'My Playlist');
        expect(result).toEqual({ data: 'My Playlist' });
    });

    it('trims whitespace from title', () => {
        const result = safeParse(playlistTitle, '  My Playlist  ');
        expect(result).toEqual({ data: 'My Playlist' });
    });
});

describe('deletePlaylist validation', () => {
    it('rejects non-UUID id', () => {
        const result = safeParse(uuid, 'not-a-uuid');
        expect(result).toHaveProperty('error');
    });

    it('accepts valid UUID', () => {
        const result = safeParse(uuid, '550e8400-e29b-41d4-a716-446655440000');
        expect(result).toEqual({ data: '550e8400-e29b-41d4-a716-446655440000' });
    });
});

describe('playlistDescription validation', () => {
    it('accepts valid description', () => {
        const result = safeParse(playlistDescription, 'My playlist description');
        expect(result).toEqual({ data: 'My playlist description' });
    });

    it('accepts undefined', () => {
        const result = safeParse(playlistDescription, undefined);
        expect(result).toEqual({ data: undefined });
    });

    it('rejects description over 2000 chars', () => {
        const result = safeParse(playlistDescription, 'x'.repeat(2001));
        expect(result).toHaveProperty('error');
    });
});
