'use server';

import { createClient } from '@/lib/supabase/server';

export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji?: string;
  parent_id: string | null;
  parent_name?: string;
  song_count?: number;
}

export async function getAvailableCategories(): Promise<Category[]> {
  const supabase = await createClient();

  interface CategoryRow {
    id: string;
    name: string;
    slug: string;
    emoji?: string;
    parent_id: string | null;
    parent: { name: string }[] | null;
  }

  const [categoriesRes, mapRes] = await Promise.all([
    supabase
      .from('categories')
      .select(`
            id,
            name,
            slug,
            emoji,
            parent_id,
            parent:parent_id (
                name
            )
        `)
      .not('parent_id', 'is', null)
      .order('name'),
    supabase
      .from('song_category_map')
      .select('category_id'),
  ]);

  if (categoriesRes.error) {
    console.error('Error fetching categories:', categoriesRes.error);
    return [];
  }

  const countMap: Record<string, number> = {};
  if (mapRes.data) {
    mapRes.data.forEach((row) => {
      countMap[row.category_id] = (countMap[row.category_id] || 0) + 1;
    });
  }

  return (categoriesRes.data as unknown as CategoryRow[]).map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawParent = item.parent as any;
    const parentObj = Array.isArray(rawParent) ? rawParent[0] : rawParent;
    const parent_name = parentObj?.name || 'Other';

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      emoji: item.emoji || undefined,
      parent_id: item.parent_id,
      parent_name,
      song_count: countMap[item.id] || 0,
    };
  }).sort((a, b) => {
    // Sort by parent name then category name
    if (a.parent_name < b.parent_name) return -1;
    if (a.parent_name > b.parent_name) return 1;
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
}
