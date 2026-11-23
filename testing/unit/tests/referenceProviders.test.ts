import { describe, expect, it } from 'vitest';
import { SUPPORTED_LOCALES, DICTIONARIES } from '@/lib/i18n';
import en from '@/messages/en';
import {
  availableProviders,
  defaultProvider,
  playStateKey,
  PROVIDER_NAMES,
} from '@/lib/player/referenceProviders';

// Story 6.1.13 / G3.2 (#397): the Listen tab offers only the providers that have a link,
// and the player always says in words what is playing and whether it plays or is paused.

describe('availableProviders', () => {
  it('offers YouTube only when the song has a YouTube link and no Spotify link', () => {
    expect(availableProviders({ youtubeUrl: 'https://youtu.be/x', spotifyUrl: null, soundcloudUrl: undefined })).toEqual(['youtube']);
  });
  it('keeps the fixed order YouTube, SoundCloud, Spotify', () => {
    expect(
      availableProviders({ spotifyUrl: 'https://open.spotify.com/track/1', youtubeUrl: 'https://youtu.be/x', soundcloudUrl: 'https://soundcloud.com/a/b' }),
    ).toEqual(['youtube', 'soundcloud', 'spotify']);
  });
  it('ignores empty and blank links', () => {
    expect(availableProviders({ youtubeUrl: '', spotifyUrl: '   ', soundcloudUrl: null })).toEqual([]);
  });
});

describe('defaultProvider', () => {
  it('is the first available provider, or null', () => {
    expect(defaultProvider({ soundcloudUrl: 'https://soundcloud.com/a/b', spotifyUrl: 'https://open.spotify.com/track/1' })).toBe('soundcloud');
    expect(defaultProvider({})).toBeNull();
  });
});

describe('provider names', () => {
  it('are brand names, the same in every language', () => {
    expect(PROVIDER_NAMES).toEqual({ youtube: 'YouTube', soundcloud: 'SoundCloud', spotify: 'Spotify' });
  });
});

describe('playStateKey', () => {
  it('names the state in words', () => {
    expect(playStateKey(true)).toBe('miniPlayer.playing');
    expect(playStateKey(false)).toBe('miniPlayer.paused');
  });

  it('says no state for Spotify: its embed does not report pause', () => {
    expect(playStateKey(true, 'spotify')).toBeNull();
    expect(playStateKey(false, 'spotify')).toBeNull();
    expect(playStateKey(true, 'youtube')).toBe('miniPlayer.playing');
  });
});

describe('copy', () => {
  it('"Control Track" is "Open player" in English', () => {
    expect(en['rehearsal.controlTrack']).toBe('Open player');
  });
  it('the new keys exist, translated, in every locale', () => {
    const keys = ['miniPlayer.paused', 'rehearsal.listen.status'] as const;
    for (const locale of SUPPORTED_LOCALES) {
      const dict = DICTIONARIES[locale] as Record<string, string>;
      for (const key of keys) {
        expect(dict[key], `${locale} ${key}`).toBeTruthy();
        if (locale !== 'en' && key === 'miniPlayer.paused') expect(dict[key], `${locale} ${key} is not the English copy`).not.toBe((en as Record<string, string>)[key]);
      }
      if (locale !== 'en') expect(dict['rehearsal.controlTrack']).not.toBe('Open player');
    }
  });
});
