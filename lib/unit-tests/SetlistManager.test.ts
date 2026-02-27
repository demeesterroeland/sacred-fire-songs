import { describe, it, expect } from 'vitest';
// @ts-expect-error - Component is a client component but imported in unit test
import SetlistManager from '@/components/playlists/SetlistManager';

describe('SetlistManager Component', () => {
    it('should be a function (component)', () => {
        expect(typeof SetlistManager).toBe('function');
    });
});
