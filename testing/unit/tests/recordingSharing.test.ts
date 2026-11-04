import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  publishRecording,
  unpublishRecording,
  shareRecording,
  unshareRecording,
  makeSongPublic,
  updateSingerAttribution,
  getRecordingDownloadUrl,
} from '@/lib/actions/rehearsal';

// Mock Supabase client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockRpc = vi.fn();
const mockStorageFrom = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
    rpc: mockRpc,
    storage: {
      from: mockStorageFrom,
    },
  }),
}));

describe('Recording Sharing & DRM-lite Permissions', () => {
  const ownerUser = { id: 'user-owner-123', email: 'owner@example.com' };
  const recipientUser = { id: 'user-recipient-456', email: 'recipient@example.com' };
  const recordingId = 'rec-789';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('publishRecording with singer consent disclaimer', () => {
    it('rejects publishing when singer consent is not confirmed', async () => {
      mockGetUser.mockResolvedValue({ data: { user: ownerUser } });

      const result = await publishRecording(recordingId, false);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Singer consent must be explicitly confirmed/i);
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('succeeds in publishing when consent is confirmed by the owner', async () => {
      mockGetUser.mockResolvedValue({ data: { user: ownerUser } });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await publishRecording(recordingId, true);
      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('user_recordings');
      expect(mockUpdate).toHaveBeenCalledWith({
        is_public: true,
        singer_consent_confirmed: true,
      });
    });

    it('rejects unpublishing if not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const result = await unpublishRecording(recordingId);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Not authenticated/i);
    });

    it('unpublishes recording back to private', async () => {
      mockGetUser.mockResolvedValue({ data: { user: ownerUser } });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await unpublishRecording(recordingId);
      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ is_public: false });
    });
  });

  describe('User-to-User Private Sharing (DRM-lite)', () => {
    it('prevents non-owners / shared recipients from sharing a recording', async () => {
      mockGetUser.mockResolvedValue({ data: { user: recipientUser } });
      // Return that the recording belongs to ownerUser, NOT recipientUser
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { user_id: ownerUser.id },
              error: null,
            }),
          }),
        }),
      });

      const result = await shareRecording(recordingId, 'third-user-999');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Only the recording owner can share/i);
    });

    it('prevents sharing with oneself', async () => {
      mockGetUser.mockResolvedValue({ data: { user: ownerUser } });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { user_id: ownerUser.id },
              error: null,
            }),
          }),
        }),
      });

      const result = await shareRecording(recordingId, ownerUser.id);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Cannot share recording with yourself/i);
    });

    it('allows owner to share with another user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: ownerUser } });
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_recordings') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { user_id: ownerUser.id },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'recording_shares') {
          return { insert: mockInsert };
        }
        return {};
      });

      const result = await shareRecording(recordingId, recipientUser.id);
      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        recording_id: recordingId,
        shared_with_user_id: recipientUser.id,
      });
    });

    it('prevents sharing a recording if the underlying song is private', async () => {
      mockGetUser.mockResolvedValue({ data: { user: ownerUser } });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                user_id: ownerUser.id,
                song_versions: {
                  compositions: { is_public: false, owner_id: ownerUser.id },
                },
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await shareRecording(recordingId, recipientUser.id);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/song is private/i);
    });

    it('allows revoking share access', async () => {
      mockGetUser.mockResolvedValue({ data: { user: ownerUser } });
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });
      mockFrom.mockReturnValue({ delete: mockDelete });

      const result = await unshareRecording(recordingId, recipientUser.id);
      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('recording_shares');
    });
  });

  describe('Song Public Publishing', () => {
    it('allows song owner to make a song public', async () => {
      mockGetUser.mockResolvedValue({ data: { user: ownerUser } });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'member' } }),
              }),
            }),
          };
        }
        if (table === 'compositions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'comp-1', owner_id: ownerUser.id, is_public: false },
                }),
              }),
            }),
            update: mockUpdate,
          };
        }
        return {};
      });

      const result = await makeSongPublic('comp-1');
      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ is_public: true });
    });
  });

  describe('Strict Permissions / DRM-lite Download Guard', () => {
    it('strictly forbids shared recipients from downloading audio', async () => {
      mockGetUser.mockResolvedValue({ data: { user: recipientUser } });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { user_id: ownerUser.id, storage_path: 'owner/audio.webm' },
              error: null,
            }),
          }),
        }),
      });

      const result = await getRecordingDownloadUrl(recordingId);
      expect(result.downloadUrl).toBeUndefined();
      expect(result.error).toMatch(/Shared recordings cannot be downloaded/i);
    });

    it('allows owner to generate signed download URL', async () => {
      mockGetUser.mockResolvedValue({ data: { user: ownerUser } });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { user_id: ownerUser.id, storage_path: 'owner/audio.webm', recording_name: 'Take 1' },
              error: null,
            }),
          }),
        }),
      });

      mockStorageFrom.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://storage.supabase.co/signed-download-url' },
          error: null,
        }),
      });

      const result = await getRecordingDownloadUrl(recordingId);
      expect(result.downloadUrl).toBe('https://storage.supabase.co/signed-download-url');
      expect(result.error).toBeUndefined();
    });
  });

  describe('Singer Attribution & Linking', () => {
    it('allows owner to attribute a registered singer with profile link', async () => {
      mockGetUser.mockResolvedValue({ data: { user: ownerUser } });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await updateSingerAttribution(recordingId, {
        singerProfileId: 'musician-user-uuid',
        singerName: 'Cari El',
        singerEmail: 'cari@example.com',
      });

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({
        singer_profile_id: 'musician-user-uuid',
        singer_name: 'Cari El',
        singer_email: 'cari@example.com',
      });
    });

    it('gracefully handles singer without an account (pending invite / unregistered)', async () => {
      mockGetUser.mockResolvedValue({ data: { user: ownerUser } });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await updateSingerAttribution(recordingId, {
        singerProfileId: null,
        singerName: 'Guest Musician Jane',
        singerEmail: 'jane@example.com',
      });

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({
        singer_profile_id: null,
        singer_name: 'Guest Musician Jane',
        singer_email: 'jane@example.com',
      });
    });
  });
});
