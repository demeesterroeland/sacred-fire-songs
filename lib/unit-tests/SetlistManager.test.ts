import { describe, it, expect } from 'vitest';
// @ts-ignore
import SetlistManager from '../../components/playlists/SetlistManager';

describe('SetlistManager Component', () => {
    it('should be a function (component)', () => {
        expect(typeof SetlistManager).toBe('function');
    });
});
