// #564: a song that is not public is "Private" in every locale, never "Draft".
// #565: a song without an author shows "No artist"; an author entered as "Traditional" still shows "Traditional".
import { describe, expect, it } from 'vitest';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';
import { DRAFT_WORD, SONG_VISIBILITY_KEYS } from '../../../support/songVisibilityKeys';

const dict = (l: string) => DICTIONARIES[l as keyof typeof DICTIONARIES] as Record<string, string>;

describe('English song visibility labels (#564)', () => {
  const en = dict('en');
  it('the search filter reads Public and Private', () => {
    expect(en['search.status.public']).toBe('Public');
    expect(en['search.status.draft']).toBe('Private');
    expect(en['search.status.drafts']).toBe('Private');
  });

  it('the song form saves a song that is not public "as private"', () => {
    expect(en['songForm.saveAsDraft']).toBe('Save as private');
    expect(en['songForm.status.draft']).toBe('Private');
    expect(en['song.status.draft']).toBe('Private');
  });
});

describe.each([...SUPPORTED_LOCALES])('Song visibility wording (%s)', (locale) => {
  it('no song-visibility label uses the local word for "draft" (#564)', () => {
    const d = dict(locale);
    for (const key of SONG_VISIBILITY_KEYS) {
      expect(d[key], key).toBeTruthy();
      expect(d[key], key).not.toMatch(DRAFT_WORD);
    }
  });

  it('has its own "No artist", different from "Traditional" (#565)', () => {
    const d = dict(locale);
    expect(d['song.noArtist'], 'song.noArtist').toBeTruthy();
    expect(d['song.noArtist']).not.toBe(d['song.traditional']);
    expect(d['admin.detail.unknownArtist']).toBe(d['song.noArtist']);
  });
});
