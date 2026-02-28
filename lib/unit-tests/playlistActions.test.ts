import { describe, it, expect } from 'vitest';
import { isSmartPlaylist } from '../playlists/smartPlaylists';

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
