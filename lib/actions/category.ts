'use server';

import { createClient } from '@/lib/supabase/server';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  parent_name?: string;
}

export async function getAvailableCategories(): Promise<Category[]> {
  const supabase = await createClient();

  interface CategoryRow {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
    parent: { name: string }[] | null;
  }

  const { data, error } = await supabase
    .from('categories')
    .select(`
            id,
            name,
            slug,
            parent_id,
            parent:parent_id (
                name
            )
        `)
    .not('parent_id', 'is', null)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return (data as unknown as CategoryRow[]).map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawParent = item.parent as any;
    const parentObj = Array.isArray(rawParent) ? rawParent[0] : rawParent;
    const parent_name = parentObj?.name || 'Other';

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      parent_id: item.parent_id,
      parent_name,
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
