// Story 6.1.2 / G1.2 (#386): song rows show "Author · Category · Language".
import { describe, expect, it } from 'vitest';
import { songRowMeta } from '@/lib/songs/songMeta';

const t = (k: string) => ({ 'song.traditional': 'Traditional', 'song.noArtist': 'No artist' })[k] ?? k;
const cat = (name: string, parent: string | null) => ({ name, slug: name.toLowerCase(), parent });

describe('songRowMeta', () => {
  it('gives author, first category and language in that order', () => {
    const cats = [cat('Spanish', 'Languages'), cat('Fire', 'The Elements'), cat('Healing', 'Medicine & Healing')];
    expect(songRowMeta('Herbert Quinteros', cats, t)).toEqual(['Herbert Quinteros', 'Fire', 'Spanish']);
  });

  it('skips artist tags and joins several authors into one item', () => {
    const cats = [cat('Xavier Rudd', 'Artists'), cat('Love', 'Spiritual Concepts')];
    expect(songRowMeta('Xavier Rudd, Huni Kuin', cats, t)).toEqual(['Xavier Rudd, Huni Kuin', 'Love']);
  });

  it('shows No artist when there is no author and drops missing parts (#565)', () => {
    expect(songRowMeta(null, [], t)).toEqual(['No artist']);
    expect(songRowMeta('', [cat('Quechua', 'Languages')], t)).toEqual(['No artist', 'Quechua']);
    // The server queries' English 'Unknown' placeholder is not shown.
    expect(songRowMeta('Unknown', [], t)).toEqual(['No artist']);
  });

  it('keeps an author entered as Traditional (#565)', () => {
    expect(songRowMeta('Traditional', [], t)).toEqual(['Traditional']);
  });
});
