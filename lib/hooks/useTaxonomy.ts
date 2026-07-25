'use client';

import { useQuery } from '@tanstack/react-query';
import { getAvailableCategories, Category } from '@/lib/actions/category';

export const CATEGORY_ORDER = [
  'The Elements',
  'Nature',
  'Languages',
  'Lineage & Tradition',
  'Medicine & Healing',
  'Spiritual Concepts',
];

export interface GroupedCategory {
  parentName: string;
  categories: Category[];
}

export function useTaxonomy() {
  const query = useQuery({
    queryKey: ['categories', 'taxonomy'],
    queryFn: async () => {
      const categories = await getAvailableCategories();
      return categories;
    },
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });

  const categories = query.data || [];

  // Group categories by parent_name
  const groupedMap = new Map<string, Category[]>();
  categories.forEach((cat) => {
    const groupName = cat.parent_name || 'Other';
    if (!groupedMap.has(groupName)) {
      groupedMap.set(groupName, []);
    }
    groupedMap.get(groupName)!.push(cat);
  });

  // Sort groups according to CATEGORY_ORDER
  const grouped: GroupedCategory[] = Array.from(groupedMap.entries())
    .map(([parentName, cats]) => ({
      parentName,
      categories: cats.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a.parentName);
      const idxB = CATEGORY_ORDER.indexOf(b.parentName);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.parentName.localeCompare(b.parentName);
    });

  return {
    ...query,
    categories,
    grouped,
  };
}
