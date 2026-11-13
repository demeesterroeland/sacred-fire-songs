import type { TaxonomyNode } from '@/lib/taxonomyUtils';

interface NamedCategory {
  id: string;
  slug: string;
  name: string;
}

function findInTree(key: string, nodes: TaxonomyNode[]): string | undefined {
  for (const node of nodes) {
    if (node.slug === key || node.id === key) return node.name;
    const inChild = findInTree(key, node.children ?? []);
    if (inChild) return inChild;
  }
  return undefined;
}

/**
 * The name a person reads for a category, from its slug or id (Validation 1, fix 5). The filter keeps the
 * slug in the URL; a chip must never show it. Looks in the category tree (top-level categories), then in
 * the flat tag list, and falls back to a readable version of the slug ("medicine-and-healing" →
 * "Medicine and healing") when the taxonomy has not loaded yet.
 */
export function categoryDisplayName(key: string, tree: TaxonomyNode[] = [], flat: NamedCategory[] = []): string {
  const fromTree = findInTree(key, tree);
  if (fromTree) return fromTree;
  const fromFlat = flat.find((c) => c.slug === key || c.id === key)?.name;
  if (fromFlat) return fromFlat;
  const words = key.replace(/[-_]+/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : key;
}
