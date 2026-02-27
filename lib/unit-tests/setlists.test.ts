import { describe, it, expect } from 'vitest';
import { createSetlist, getSetlists, addSongToSetlist, removeSongFromSetlist } from '@/app/actions/setlists';

// Note: Direct testing of server actions using Supabase is complex in unit tests.
// These tests define the expected interface and behavior.

describe('Setlist Server Actions', () => {
    describe('createSetlist', () => {
        it('should be a function', () => {
            expect(typeof createSetlist).toBe('function');
        });

        it('returns an error if title is empty', async () => {
            const result = await createSetlist('');
            expect(result).toHaveProperty('error');
        });
    });

    describe('getSetlists', () => {
        it('should be a function', () => {
            expect(typeof getSetlists).toBe('function');
        });
    });

    describe('addSongToSetlist', () => {
        it('should be a function', () => {
            expect(typeof addSongToSetlist).toBe('function');
        });

        it('returns an error if setlistId or songVersionId is missing', async () => {
            const result = await addSongToSetlist('', '');
            expect(result).toHaveProperty('error');
        });
    });

    describe('removeSongFromSetlist', () => {
        it('should be a function', () => {
            expect(typeof removeSongFromSetlist).toBe('function');
        });

        it('returns an error if setlistItemId is missing', async () => {
            const result = await removeSongFromSetlist('');
            expect(result).toHaveProperty('error');
        });
    });
});
