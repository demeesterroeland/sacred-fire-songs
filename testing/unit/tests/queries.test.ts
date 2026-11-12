import { describe, it, expect } from 'vitest';
import { mapCompositionToSong } from '@/lib/songs/queries';

describe('mapCompositionToSong', () => {
  const baseItem = {
    id: 'abc-123',
    title: 'Test Song',
    original_author: 'Test Author',
    owner_id: 'user-1',
    is_public: true,
    has_chords: true,
    has_melody: false,
    created_at: '2026-01-01T00:00:00Z',
    song_versions: [{ key: 'Am', content_chordpro: '[Am]Hello', melody_notation: '' }],
    song_category_map: [
      { categories: { name: 'Healing', slug: 'healing', parent: { name: 'Theme', slug: 'theme' } } },
    ],
  };

  it('maps a complete row correctly', () => {
    const song = mapCompositionToSong(baseItem);
    expect(song.id).toBe('abc-123');
    expect(song.title).toBe('Test Song');
    expect(song.author).toBe('Test Author');
    expect(song.songKey).toBe('Am');
    expect(song.content).toBe('[Am]Hello');
    expect(song.categories).toHaveLength(1);
    expect(song.categories[0].name).toBe('Healing');
    expect(song.categories[0].parent).toBe('Theme');
    expect(song.isFavorite).toBe(false);
  });

  it('shows the first (oldest) version on the card, whatever order the rows arrive in (UXA-049)', () => {
    const song = mapCompositionToSong({
      ...baseItem,
      song_versions: [
        { id: 'v2', created_at: '2026-02-01T00:00:00Z', key: 'G', content_chordpro: '[G]Later', melody_notation: '' },
        { id: 'v1', created_at: '2026-01-01T00:00:00Z', key: 'Am', content_chordpro: '[Am]First', melody_notation: '' },
      ],
    });
    expect(song.songKey).toBe('Am');
    expect(song.content).toBe('[Am]First');
  });

  it('handles missing author', () => {
    const song = mapCompositionToSong({ ...baseItem, original_author: null });
    expect(song.author).toBe('');
  });

  // Story 6.2.12 / G2.3 (#515): every credit travels with the song; original_author stays the display text.
  it('maps every credit of compositions.authors next to the display author', () => {
    const song = mapCompositionToSong({ ...baseItem, original_author: 'Anna Lee, Ben Cruz', authors: ['Anna Lee', 'Ben Cruz'] } as typeof baseItem);
    expect(song.authors).toEqual(['Anna Lee', 'Ben Cruz']);
    expect(song.author).toBe('Anna Lee, Ben Cruz');
  });

  // Story 6.2.18 / G5.1 (#521): what the search reads besides the title and the authors.
  it('maps the aliases and the original titles of every version for the search', () => {
    const song = mapCompositionToSong({
      ...baseItem,
      aliases: ['Gran Venerable Madre Tierra', '  '],
      song_versions: [
        { id: 'v1', created_at: '2026-01-01T00:00:00Z', key: 'Am', content_chordpro: '', melody_notation: '', song_version_sources: [{ original_title: 'Huey Tonantzin' }] },
        { id: 'v2', created_at: '2026-02-01T00:00:00Z', key: 'G', content_chordpro: '', melody_notation: '', song_version_sources: [{ original_title: 'Madre Tierra' }, { original_title: null }, { original_title: 'huey tonantzin' }] },
      ],
    } as typeof baseItem);
    expect(song.aliases).toEqual(['Gran Venerable Madre Tierra']);
    expect(song.sourceTitles).toEqual(['Huey Tonantzin', 'Madre Tierra']);
  });

  it('gives empty alias and title lists when the row has none', () => {
    const song = mapCompositionToSong({ ...baseItem, aliases: null } as typeof baseItem);
    expect(song.aliases).toEqual([]);
    expect(song.sourceTitles).toEqual([]);
  });

  it('gives no credits when the row has none', () => {
    const song = mapCompositionToSong({ ...baseItem, authors: null } as typeof baseItem);
    expect(song.authors).toEqual([]);
  });

  it('handles missing song_versions', () => {
    const song = mapCompositionToSong({ ...baseItem, song_versions: [] });
    expect(song.songKey).toBeNull();
    expect(song.content).toBe('');
  });

  it('handles empty categories', () => {
    const song = mapCompositionToSong({ ...baseItem, song_category_map: [] });
    expect(song.categories).toEqual([]);
  });

  it('marks favorite when in favoriteIds set', () => {
    const favs = new Set(['abc-123']);
    const song = mapCompositionToSong(baseItem, favs);
    expect(song.isFavorite).toBe(true);
  });

  it('marks not favorite when not in set', () => {
    const favs = new Set(['other-id']);
    const song = mapCompositionToSong(baseItem, favs);
    expect(song.isFavorite).toBe(false);
  });
});
