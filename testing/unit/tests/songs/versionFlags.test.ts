// Story 6.1.11 / G2.6 (#395, review round 2): a song's has_chords / has_melody cover ALL its versions.
import { describe, expect, it } from 'vitest';
import { songFlags, type VersionFlagSource } from '@/lib/songs/versionFlags';

const withChords: VersionFlagSource = { content_chordpro: '[Am]Hello [G]world' };
const lyricsOnly: VersionFlagSource = { content_chordpro: 'Hello world' };
const withMelody: VersionFlagSource = { content_chordpro: 'Hello', youtube_url: 'https://www.youtube.com/watch?v=x' };

describe('songFlags', () => {
  it('a lyrics-only version does not clear chords that another version has', () => {
    expect(songFlags([lyricsOnly, withChords]).has_chords).toBe(true);
  });
  it('is false only when no version has chords', () => {
    expect(songFlags([lyricsOnly, { content_chordpro: 'More words' }]).has_chords).toBe(false);
    expect(songFlags([]).has_chords).toBe(false);
  });
  it('melody: any reference link or notation on any version counts', () => {
    expect(songFlags([lyricsOnly, withMelody]).has_melody).toBe(true);
    expect(songFlags([{ melody_notation: 'C D E' }]).has_melody).toBe(true);
    expect(songFlags([{ soundcloud_url: 'https://soundcloud.com/a/b' }]).has_melody).toBe(true);
    expect(songFlags([lyricsOnly, withChords]).has_melody).toBe(false);
  });
  it('treats missing, null and blank fields as absent', () => {
    expect(songFlags([{ content_chordpro: null, youtube_url: '', spotify_url: null, melody_notation: undefined }])).toEqual({
      has_chords: false,
      has_melody: false,
    });
  });
});
