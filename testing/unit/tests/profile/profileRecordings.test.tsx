// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DICTIONARIES } from '@/lib/i18n';
import { signedUrlByPath, toBrowserStorageUrl, toPlayableRecording, type ProfileRecording } from '@/lib/users/profileRecordings';

const audio = {
  activePlaybackId: null as string | null,
  isRecordingPlaying: false,
  handleTogglePlay: vi.fn(),
};

vi.mock('@/components/song/AudioProvider', () => ({ useAudio: () => audio }));
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    t: (k: string, vars?: Record<string, string>) => {
      let s = (DICTIONARIES.en as Record<string, string>)[k] ?? k;
      for (const [name, v] of Object.entries(vars ?? {})) s = s.replace(`{${name}}`, v);
      return s;
    },
  }),
}));

import UserProfileView from '@/components/profile/UserProfileView';

const rec = (over: Partial<ProfileRecording> = {}): ProfileRecording => ({
  id: 'rec-1',
  user_id: 'owner-1',
  recording_name: 'Tempo check',
  song_version_id: 'v-1',
  storage_path: 'owner-1/a.mp3',
  song_id: 'song-1',
  song_title: 'Abuelo Cielo',
  created_at: '2026-11-04T10:00:00Z',
  audio_url: 'https://storage.test/a.mp3?token=x',
  ...over,
});

const profile = (recordings: ProfileRecording[]) => ({
  id: 'singer-1',
  full_name: 'Ana',
  avatar_url: null,
  is_musician: true,
  attributed_recordings: recordings,
});

afterEach(cleanup);
beforeEach(() => {
  audio.activePlaybackId = null;
  audio.isRecordingPlaying = false;
  audio.handleTogglePlay.mockReset();
});

describe('signedUrlByPath', () => {
  it('keeps signed paths and drops failures', () => {
    const map = signedUrlByPath([
      { path: 'a.mp3', signedUrl: 'http://127.0.0.1:54321/storage/v1/object/sign/rehearsals/a.mp3?token=t', error: null },
      { path: 'b.mp3', signedUrl: null, error: 'Object not found' },
      { path: null, signedUrl: null, error: 'x' },
    ]);
    expect([...map.entries()]).toEqual([['a.mp3', '/supabase-api/storage/v1/object/sign/rehearsals/a.mp3?token=t']]);
    expect(signedUrlByPath(null).size).toBe(0);
  });
});

describe('toBrowserStorageUrl', () => {
  it('routes a server-signed URL through the same-origin proxy, whatever host the server used', () => {
    // A self-hosted server signs with its internal Supabase address, which the browser cannot resolve.
    expect(toBrowserStorageUrl('http://kong:8000/storage/v1/object/sign/rehearsals/u/s/t.webm?token=abc')).toBe(
      '/supabase-api/storage/v1/object/sign/rehearsals/u/s/t.webm?token=abc'
    );
    expect(toBrowserStorageUrl('https://db.example.org/storage/v1/object/sign/rehearsals/x.mp3?token=1')).toBe(
      '/supabase-api/storage/v1/object/sign/rehearsals/x.mp3?token=1'
    );
  });

  it('leaves a URL without a storage path untouched', () => {
    expect(toBrowserStorageUrl('https://cdn.example.org/a.mp3')).toBe('https://cdn.example.org/a.mp3');
  });
});

describe('toPlayableRecording', () => {
  it('passes the signed URL and storage path to the shared player', () => {
    const r = toPlayableRecording(rec());
    expect(r.audioUrl).toBe('https://storage.test/a.mp3?token=x');
    expect(r.storage_path).toBe('owner-1/a.mp3');
    expect(toPlayableRecording(rec({ audio_url: null })).audioUrl).toBeUndefined();
  });
});

describe('UserProfileView recordings', () => {
  it('each row has a play button and links to the recording permalink', () => {
    render(<UserProfileView profile={profile([rec()])} />);
    expect(screen.getByRole('button', { name: 'Play Tempo check' })).toBeTruthy();
    const link = screen.getByRole('link', { name: /Tempo check/ });
    expect(link.getAttribute('href')).toBe('/recordings/rec-1');
    expect(link.textContent).toContain('Abuelo Cielo');
  });

  it('plays through the shared audio player', () => {
    render(<UserProfileView profile={profile([rec()])} />);
    fireEvent.click(screen.getByRole('button', { name: 'Play Tempo check' }));
    expect(audio.handleTogglePlay).toHaveBeenCalledTimes(1);
    const [recording, url] = audio.handleTogglePlay.mock.calls[0];
    expect(recording.id).toBe('rec-1');
    expect(url).toBe('https://storage.test/a.mp3?token=x');
  });

  it('shows Pause for the recording that is playing', () => {
    audio.activePlaybackId = 'rec-1';
    audio.isRecordingPlaying = true;
    render(<UserProfileView profile={profile([rec(), rec({ id: 'rec-2', recording_name: 'Second' })])} />);
    expect(screen.getByRole('button', { name: 'Pause Tempo check' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Play Second' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Pause Second' })).toBeNull();
  });

  it('a recording without a playable file has no play button but still links to the song', () => {
    render(<UserProfileView profile={profile([rec({ audio_url: null })])} />);
    expect(screen.queryByRole('button', { name: /Play/ })).toBeNull();
    expect(screen.getByRole('link', { name: /Tempo check/ }).getAttribute('href')).toBe('/recordings/rec-1');
  });

  it('has no "Back to song" button per row any more', () => {
    render(<UserProfileView profile={profile([rec()])} />);
    const row = screen.getByTestId('profile-recording');
    expect(row.textContent).not.toContain('Back to song');
    expect(row.querySelectorAll('a')).toHaveLength(1);
  });
});
