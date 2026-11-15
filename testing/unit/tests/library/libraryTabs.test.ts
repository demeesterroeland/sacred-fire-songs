// Story 6.1.23 / G5.2 (#407): the Library tab row has no dead tab (UXD-4: Albums hidden).
import { describe, expect, it } from 'vitest';
import { FEATURES } from '@/lib/features';
import { libraryTabs } from '@/lib/navigation';

describe('libraryTabs', () => {
  it('hides Albums while the albums feature is off', () => {
    expect(FEATURES.albums).toBe(false);
    expect(libraryTabs().map((t) => t.href)).toEqual([
      '/library/playlists',
      '/library/smart',
      '/library/recently-viewed',
      '/library/new',
      '/library/artists',
      '/songbooks',
    ]);
  });

  it('shows Albums last once the feature is switched on', () => {
    expect(libraryTabs({ ...FEATURES, albums: true }).map((t) => t.href).at(-1)).toBe('/library/albums');
  });
});
