// Curated order of the top-level categories, shared by the home grid and the search chips.
export const CATEGORY_ORDER = [
  'The Elements',
  'Nature',
  'Lineage & Tradition',
  'Medicine & Healing',
  'Spiritual Concepts',
  'Languages',
];

/** Curated categories first (in CATEGORY_ORDER), the rest alphabetically. Does not mutate. */
export function sortCategories<T extends { name: string }>(categories: readonly T[]): T[] {
  return [...categories].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.name);
    const indexB = CATEGORY_ORDER.indexOf(b.name);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
}
