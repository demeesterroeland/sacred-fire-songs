// Story 6.1.7 / G2.2 (#391): song meta on one grey line, technical values on another.
import { describe, expect, it } from 'vitest';
import { songMetaItems, technicalItems } from '@/lib/songs/songMeta';

const t = (key: string, vars?: Record<string, string | number>) =>
  ({
    'song.traditional': 'Traditional',
    'song.noArtist': 'No artist',
    'song.meta.key': `Key ${vars?.key}`,
    'song.meta.capo': `Capo ${vars?.capo}`,
    'song.metadata.standard': 'Standard',
    'song.meta.tuning': `Tuning: ${vars?.tuning}`,
    'song.meta.beats': `Beats ${vars?.beats}`,
  })[key] ?? key;

describe('songMetaItems', () => {
  it('lists the authors, then the tags', () => {
    expect(
      songMetaItems('Herbert Quinteros', [{ name: 'Fire' }, { name: 'Healing' }, { name: 'Spanish' }], t)
    ).toEqual(['Herbert Quinteros', 'Fire', 'Healing', 'Spanish']);
  });

  it('shows No artist when there is no author (#565)', () => {
    expect(songMetaItems('', [], t)).toEqual(['No artist']);
    expect(songMetaItems(null, [{ name: 'Water' }], t)).toEqual(['No artist', 'Water']);
  });

  it('translates an author entered as Traditional', () => {
    expect(songMetaItems('traditional', [{ name: 'Water' }], t)).toEqual(['Traditional', 'Water']);
  });
});

describe('technicalItems', () => {
  it('joins key, capo and non-standard tuning in one line, omitting standard tuning', () => {
    expect(technicalItems({ key: 'E', capo: 3, tuning: null }, t)).toEqual(['Key E', 'Capo 3']);
    expect(technicalItems({ key: 'E', capo: 3, tuning: '' }, t)).toEqual(['Key E', 'Capo 3']);
    expect(technicalItems({ key: 'E', capo: 3, tuning: 'Standard' }, t)).toEqual(['Key E', 'Capo 3']);
    expect(technicalItems({ key: 'D', capo: null, tuning: 'DADGAD' }, t)).toEqual(['Key D', 'Tuning: DADGAD']);
  });

  it('is empty when there is nothing to tell', () => {
    expect(technicalItems({ key: null, capo: 0, tuning: 'Standard' }, t)).toEqual([]);
    expect(technicalItems(undefined, t)).toEqual([]);
  });

  // Story 6.2.7 / G1.2 (#510): the beats of the version (songbook notation such as "8" or "8y4") join the line.
  it('adds the beats after the tuning (when non-standard) or capo', () => {
    expect(technicalItems({ key: 'E', capo: 5, tuning: null, beats: '8' }, t)).toEqual(['Key E', 'Capo 5', 'Beats 8']);
    expect(technicalItems({ key: 'Am', capo: 2, tuning: 'Standard', beats: '8' }, t)).toEqual(['Key Am', 'Capo 2', 'Beats 8']);
    expect(technicalItems({ key: 'E', capo: 5, tuning: 'DADGAD', beats: '8y4' }, t)).toEqual(['Key E', 'Capo 5', 'Tuning: DADGAD', 'Beats 8y4']);
  });

  it('shows the beats alone when the version has no key, capo or tuning', () => {
    expect(technicalItems({ key: null, capo: null, tuning: null, beats: '8' }, t)).toEqual(['Beats 8']);
    expect(technicalItems({ key: null, capo: 0, tuning: 'Standard', beats: '8y4' }, t)).toEqual(['Beats 8y4']);
  });

  it('shows nothing for an empty or whitespace beats value', () => {
    expect(technicalItems({ key: null, capo: null, tuning: null, beats: '' }, t)).toEqual([]);
    expect(technicalItems({ key: null, capo: null, tuning: null, beats: '   ' }, t)).toEqual([]);
    expect(technicalItems({ key: 'G', capo: null, tuning: null, beats: '  ' }, t)).toEqual(['Key G']);
  });

  it('trims the beats value', () => {
    expect(technicalItems({ key: null, capo: null, tuning: null, beats: ' 8 ' }, t)).toEqual(['Beats 8']);
  });
});

// Chord tools in one place (#566): key, capo and tuning only while chords are on; beats stay (owner default).
describe('technicalItems — chords off', () => {
  it('keeps today’s output when the option is left out or chords are on (the PDF meta line relies on this)', () => {
    const v = { key: 'D', capo: 2, tuning: 'Drop D', beats: '8' };
    expect(technicalItems(v, t, { chordsOn: true })).toEqual(technicalItems(v, t));
    expect(technicalItems(v, t)).toEqual(['Key D', 'Capo 2', 'Tuning: Drop D', 'Beats 8']);
  });

  it('drops key, capo and tuning while chords are off', () => {
    expect(technicalItems({ key: 'D', capo: 2, tuning: 'Drop D' }, t, { chordsOn: false })).toEqual([]);
  });

  it('leaves the beats while chords are off', () => {
    expect(technicalItems({ key: 'D', capo: 2, tuning: null, beats: '8y4' }, t, { chordsOn: false })).toEqual(['Beats 8y4']);
  });
});

// Owner decisions (#566): non-standard tuning is named in the meta line; standard tuning is omitted completely.
describe('technicalItems — tuning label', () => {
  it('reads "Key D · Tuning: Drop D" for non-standard tuning and omits Standard', () => {
    expect(technicalItems({ key: 'D', capo: null, tuning: 'Drop D' }, t).join(' · ')).toBe('Key D · Tuning: Drop D');
    expect(technicalItems({ key: 'D', capo: 3, tuning: 'Drop D', beats: '4' }, t).join(' · ')).toBe('Key D · Capo 3 · Tuning: Drop D · Beats 4');
    expect(technicalItems({ key: 'Am', capo: 2, tuning: 'Standard', beats: '8' }, t).join(' · ')).toBe('Key Am · Capo 2 · Beats 8');
  });

  it('after a transpose only the key changes: "Key E · Tuning: Drop D", no hint of the original key', () => {
    const line = technicalItems({ key: 'E', capo: null, tuning: 'Drop D' }, t).join(' · ');
    expect(line).toBe('Key E · Tuning: Drop D');
    expect(line).not.toMatch(/was|original|\(|D\b.*E\b/i);
  });
});
