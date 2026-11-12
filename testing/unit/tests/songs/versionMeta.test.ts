// Story 6.2.20 / G5.3 (#523): what the edit form may write to song_versions.beats / song_note and to the primary
// source of a version. Pure helpers: the form and the BDD steps call them.
import { describe, expect, it } from 'vitest';
import {
  BEATS_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  beatsError,
  normalizeBeats,
  normalizeNote,
  noteError,
  sourceFieldsForSave,
  sourceTextError,
  versionMetaFieldsForSave,
  SOURCE_PAGE_MAX_LENGTH,
  SOURCE_TITLE_MAX_LENGTH,
} from '@/lib/songs/versionMeta';
import { technicalItems } from '@/lib/songs/songMeta';

describe('beats', () => {
  it.each(['8', '6', '4', '12', '8y4', '8 y 4', '8Y4', '3/4', '8+4', '8 & 4', '4,4', '8-4'])('accepts %s', (v) => {
    expect(beatsError(v)).toBeNull();
  });

  it.each(['0', '08', 'abc', '8y', 'y4', '8 4', '100', '-8', '8..4', '8;4', '<b>8</b>', '8\n4'])('rejects %s', (v) => {
    expect(beatsError(v)).toBe('format');
  });

  it('too long is its own error', () => {
    expect(beatsError(Array(BEATS_MAX_LENGTH).fill('8').join('y'))).toBe('tooLong');
  });

  it('blank is valid and saves NULL, never an empty string', () => {
    for (const blank of ['', '   ', '\n', null, undefined]) {
      expect(beatsError(blank)).toBeNull();
      expect(normalizeBeats(blank)).toBeNull();
    }
  });

  it('normalizes the way the meta line prints it: trimmed, one space, lowercase y', () => {
    expect(normalizeBeats('  8  Y  4 ')).toBe('8 y 4');
    expect(technicalItems({ beats: normalizeBeats(' 8Y4 ') }, (k, p) => `${k}:${p?.beats}`)).toEqual(['song.meta.beats:8y4']);
  });
});

describe('note', () => {
  it('blank saves NULL', () => {
    for (const blank of ['', '  \n \n ', null, undefined]) expect(normalizeNote(blank)).toBeNull();
  });

  it('keeps paragraph breaks and single line breaks, trims the ends, unifies line endings', () => {
    expect(normalizeNote('  First line\r\nsecond line\r\n\r\nSecond paragraph  \n')).toBe(
      'First line\nsecond line\n\nSecond paragraph'
    );
  });

  it('collapses runs of blank lines to one paragraph break and drops trailing spaces on a line', () => {
    expect(normalizeNote('A  \n\n\n\n\nB')).toBe('A\n\nB');
  });

  it('is plain text: markup is stored as typed, never interpreted', () => {
    expect(normalizeNote('<b>Bold</b> & <script>alert(1)</script>')).toBe('<b>Bold</b> & <script>alert(1)</script>');
  });

  it('drops control characters a text column cannot store (NUL) but keeps tabs and line breaks', () => {
    expect(normalizeNote('A\u0000B\u0007\tC\nD')).toBe('AB\tC\nD');
  });

  it('refuses a note over the limit', () => {
    expect(noteError('x'.repeat(NOTE_MAX_LENGTH))).toBeNull();
    expect(noteError('x'.repeat(NOTE_MAX_LENGTH + 1))).toBe('tooLong');
  });
});

describe('versionMetaFieldsForSave: only dirty fields are written', () => {
  it('an untouched form writes neither beats nor note, even when the stored text is untidy', () => {
    const initial = { beats: ' 8 ', note: 'Old note\r\n\r\n\r\nsecond' };
    expect(versionMetaFieldsForSave(initial, initial)).toEqual({});
    expect(versionMetaFieldsForSave({ beats: '8', note: 'Old note\n\nsecond' }, initial)).toEqual({});
  });

  it('an untouched legacy value that would fail the format check is not rewritten', () => {
    expect(versionMetaFieldsForSave({ beats: 'waltz' }, { beats: 'waltz' })).toEqual({});
  });

  it('changing beats from 8 to 6 writes only beats', () => {
    expect(versionMetaFieldsForSave({ beats: '6', note: 'N' }, { beats: '8', note: 'N' })).toEqual({ beats: '6' });
  });

  it('clearing writes NULL', () => {
    expect(versionMetaFieldsForSave({ beats: '', note: '  ' }, { beats: '8', note: 'N' })).toEqual({
      beats: null,
      song_note: null,
    });
  });

  it('a form without these fields (create mode) writes nothing', () => {
    expect(versionMetaFieldsForSave({}, {})).toEqual({});
  });

  it('editing the note writes the normalized note only', () => {
    expect(versionMetaFieldsForSave({ beats: '8', note: 'New\r\n\r\ntext ' }, { beats: '8', note: 'N' })).toEqual({
      song_note: 'New\n\ntext',
    });
  });
});

describe('source correction (admins)', () => {
  it('only a changed page or original title is written; blank saves NULL', () => {
    const initial = { sourcePage: '38', sourceOriginalTitle: 'Titre' };
    expect(sourceFieldsForSave(initial, initial)).toEqual({});
    expect(sourceFieldsForSave({ sourcePage: ' 39 ', sourceOriginalTitle: 'Titre' }, initial)).toEqual({ page: '39' });
    expect(sourceFieldsForSave({ sourcePage: '', sourceOriginalTitle: '' }, initial)).toEqual({
      page: null,
      original_title: null,
    });
  });

  it('limits the length', () => {
    expect(sourceTextError('page', 'x'.repeat(SOURCE_PAGE_MAX_LENGTH + 1))).toBe('tooLong');
    expect(sourceTextError('page', 'A-12')).toBeNull();
    expect(sourceTextError('originalTitle', 'x'.repeat(SOURCE_TITLE_MAX_LENGTH + 1))).toBe('tooLong');
  });
});
