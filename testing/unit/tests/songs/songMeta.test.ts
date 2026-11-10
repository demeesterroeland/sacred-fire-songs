// Story 6.1.7 / G2.2 (#391): song meta on one grey line, technical values on another.
import { describe, expect, it } from 'vitest';
import { songMetaItems, technicalItems } from '@/lib/songs/songMeta';

const t = (key: string, vars?: Record<string, string | number>) =>
  ({
    'song.traditional': 'Traditional',
    'song.meta.key': `Key ${vars?.key}`,
    'song.meta.capo': `Capo ${vars?.capo}`,
    'song.metadata.standard': 'Standard',
  })[key] ?? key;

describe('songMetaItems', () => {
  it('lists the authors, then the tags', () => {
    expect(
      songMetaItems('Herbert Quinteros', [{ name: 'Fire' }, { name: 'Healing' }, { name: 'Spanish' }], t)
    ).toEqual(['Herbert Quinteros', 'Fire', 'Healing', 'Spanish']);
  });

  it('falls back to Traditional and translates it', () => {
    expect(songMetaItems('', [], t)).toEqual(['Traditional']);
    expect(songMetaItems('traditional', [{ name: 'Water' }], t)).toEqual(['Traditional', 'Water']);
  });
});

describe('technicalItems', () => {
  it('joins key, capo and tuning in one line', () => {
    expect(technicalItems({ key: 'E', capo: 3, tuning: null }, t)).toEqual(['Key E', 'Capo 3', 'Standard']);
    expect(technicalItems({ key: 'D', capo: null, tuning: 'DADGAD' }, t)).toEqual(['Key D', 'DADGAD']);
  });

  it('is empty when there is nothing to tell', () => {
    expect(technicalItems({ key: null, capo: 0, tuning: 'Standard' }, t)).toEqual([]);
    expect(technicalItems(undefined, t)).toEqual([]);
  });
});
