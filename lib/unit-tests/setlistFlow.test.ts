import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { getSetlists, createSetlist, getSetlistDetail } from '@/app/actions/setlists';

// Mock server actions
vi.mock('@/app/actions/setlists', () => ({
    getSetlists: vi.fn(),
    createSetlist: vi.fn(),
    getSetlistDetail: vi.fn(),
    addSongToSetlist: vi.fn(),
    removeSongFromSetlist: vi.fn(),
    updateSetlistItemOrder: vi.fn(),
}));

describe('Setlist Data Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('successfully fetches setlists', async () => {
        const mockSetlists = [{ id: '1', title: 'Test Setlist' }];
        (getSetlists as Mock).mockResolvedValue({ success: true, setlists: mockSetlists });

        const result = await getSetlists();
        expect(result).toEqual({ success: true, setlists: mockSetlists });
        expect(getSetlists).toHaveBeenCalledTimes(1);
    });

    it('successfully creates a setlist', async () => {
        (createSetlist as Mock).mockResolvedValue({ success: true, id: 'new-id' });

        const result = await createSetlist('New Title', 'New Description');
        expect(result).toEqual({ success: true, id: 'new-id' });
        expect(createSetlist).toHaveBeenCalledWith('New Title', 'New Description');
    });

    it('successfully fetches setlist detail', async () => {
        const mockDetail = { id: '1', title: 'Test', items: [] };
        (getSetlistDetail as Mock).mockResolvedValue({ success: true, setlist: mockDetail });

        const result = await getSetlistDetail('1');
        expect(result).toEqual({ success: true, setlist: mockDetail });
        expect(getSetlistDetail).toHaveBeenCalledWith('1');
    });
});
