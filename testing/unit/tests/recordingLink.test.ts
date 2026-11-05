import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseRecordingParam,
  recordingPermalink,
  songRecordingPath,
  RECORDING_PARAM,
} from '@/lib/songs/recordingLink';
import { notificationLink } from '@/lib/notifications/email';

const REC = '0ee67b53-1d2c-4a8f-9a3b-2c1d0e9f8a7b';

describe('recordingPermalink', () => {
  it('is a short, song-independent link', () => {
    expect(recordingPermalink(REC)).toBe(`/recordings/${REC}`);
  });
});

describe('songRecordingPath', () => {
  it('focuses a recording on its song page', () => {
    expect(songRecordingPath('comp-1', REC)).toBe(`/songs/comp-1?${RECORDING_PARAM}=${REC}`);
  });
});

describe('parseRecordingParam', () => {
  it('accepts a recording id', () => {
    expect(parseRecordingParam(REC)).toBe(REC);
    expect(parseRecordingParam(REC.toUpperCase())).toBe(REC.toUpperCase());
  });

  it('ignores missing or malformed values', () => {
    expect(parseRecordingParam(null)).toBeNull();
    expect(parseRecordingParam('')).toBeNull();
    expect(parseRecordingParam('not-a-uuid')).toBeNull();
    expect(parseRecordingParam(`${REC}' or 1=1`)).toBeNull();
  });
});

describe('notificationLink', () => {
  it('uses the recording permalink when there is a recording', () => {
    expect(notificationLink('comp-1', 'https://songs.example.org', 'http://localhost:3000', REC)).toBe(
      `https://songs.example.org/recordings/${REC}`,
    );
  });

  it('links to the song otherwise', () => {
    expect(notificationLink('comp-1', 'https://songs.example.org', 'http://localhost:3000')).toBe(
      'https://songs.example.org/songs/comp-1',
    );
  });
});

// ─── /recordings/[id] permalink route ─────────────────────────────────────────

const mockGetUser = vi.fn();
const mockMaybeSingle = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }) }),
  }),
}));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => { throw new Error(`REDIRECT ${url}`); },
  notFound: () => { throw new Error('NOT_FOUND'); },
}));

describe('/recordings/[id]', () => {
  const open = async (id: string) => {
    const { default: Page } = await import('@/app/recordings/[id]/page');
    return Page({ params: Promise.resolve({ id }) });
  };

  beforeEach(() => {
    mockGetUser.mockReset().mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockMaybeSingle.mockReset().mockResolvedValue({ data: null });
  });

  it('redirects to the recording on its song page when the viewer may see it', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: REC, song_versions: { composition_id: 'comp-1' } } });
    await expect(open(REC)).rejects.toThrow(`REDIRECT /songs/comp-1?recording=${REC}`);
  });

  it('shows guests the GuestGate (sign in, then back to the recording)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const page = (await open(REC)) as { props: { children: { props: { feature: string; next: string } } } };
    expect(page.props.children.props).toMatchObject({ feature: 'sharing', next: `/recordings/${REC}` });
  });

  it('is not found for signed-in users without access, without revealing that it exists', async () => {
    await expect(open(REC)).rejects.toThrow('NOT_FOUND');
  });

  it('is not found for malformed ids', async () => {
    await expect(open('not-a-uuid')).rejects.toThrow('NOT_FOUND');
    expect(mockMaybeSingle).not.toHaveBeenCalled();
  });
});
