import { describe, it, expect } from 'vitest';
import { mapCompositionToSong } from '../songs/queries';

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

  it('handles missing author', () => {
    const song = mapCompositionToSong({ ...baseItem, original_author: null });
    expect(song.author).toBe('');
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
