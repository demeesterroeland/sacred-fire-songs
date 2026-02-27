import { describe, it, expect } from 'vitest';
import AddToSetlist from '@/components/playlists/AddToSetlist';

describe('AddToSetlist Component', () => {
    it('should be a function (component)', () => {
        expect(typeof AddToSetlist).toBe('function');
    });
});
