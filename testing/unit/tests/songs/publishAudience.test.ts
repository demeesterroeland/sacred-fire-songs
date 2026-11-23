import { describe, expect, it } from 'vitest';
import {
  canPublishTake,
  publishAudience,
  publishAudienceKey,
  publishOffer,
  songIsPublicOfTake,
} from '@/lib/songs/publishAudience';

// Story 6.1.21 / G4.8 (#405): a take can only be published on a public song.
describe('publishAudience', () => {
  it('a public song publishes to everyone', () => {
    expect(publishAudience({ songIsPublic: true })).toBe('everyone');
    expect(publishAudienceKey({ songIsPublic: true })).toBe('recording.publish.description');
    expect(canPublishTake({ songIsPublic: true })).toBe(true);
  });

  it('a private song cannot be published: the song comes first', () => {
    expect(publishAudience({ songIsPublic: false })).toBe('song-private');
    expect(publishAudienceKey({ songIsPublic: false })).toBe('recording.publish.descriptionPrivateSong');
    expect(canPublishTake({ songIsPublic: false })).toBe(false);
  });

  it('an unknown visibility waits and does not allow publishing', () => {
    expect(publishAudience({ songIsPublic: null })).toBe('checking');
    expect(publishAudienceKey({ songIsPublic: null })).toBe('recording.publish.checkingSong');
    expect(canPublishTake({ songIsPublic: null })).toBe(false);
  });
});

describe('a visibility that could not be read', () => {
  const unreadable = { songIsPublic: null, unreadable: true };
  it('says so instead of calling the song private, and does not allow publishing', () => {
    expect(publishAudience(unreadable)).toBe('unreadable');
    expect(publishAudienceKey(unreadable)).toBe('recording.publish.checkFailed');
    expect(canPublishTake(unreadable)).toBe(false);
    expect(publishOffer({ ...unreadable, canMakeSongPublic: true })).toBe('wait');
  });
});

describe('songIsPublicOfTake', () => {
  it('reads the visibility of the song behind the take', () => {
    expect(songIsPublicOfTake({ song_versions: { compositions: { is_public: true } } })).toBe(true);
    expect(songIsPublicOfTake({ song_versions: [{ compositions: [{ is_public: true }] }] })).toBe(true);
  });

  it.each([
    ['private', { song_versions: { compositions: { is_public: false } } }],
    ['null', { song_versions: { compositions: { is_public: null } } }],
    ['no song', { song_versions: null }],
    ['no row', null],
    ['undefined', undefined],
  ])('treats a %s song as not public', (_label, row) => {
    expect(songIsPublicOfTake(row)).toBe(false);
  });
});

describe('publishOffer', () => {
  it('offers publishing on a public song', () => {
    expect(publishOffer({ songIsPublic: true, canMakeSongPublic: false })).toBe('publish');
  });
  it('sends the song owner (or an admin) to make the song public first', () => {
    expect(publishOffer({ songIsPublic: false, canMakeSongPublic: true })).toBe('make-song-public');
  });
  it('asks anyone else to ask the owner', () => {
    expect(publishOffer({ songIsPublic: false, canMakeSongPublic: false })).toBe('ask-owner');
  });
  it('waits while the visibility is unknown', () => {
    expect(publishOffer({ songIsPublic: null, canMakeSongPublic: true })).toBe('wait');
  });
});
