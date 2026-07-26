
import { createClient } from "./supabase/client";

export interface TaxonomyNode {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  icon_name: string | null;
  song_count?: number;
  children: TaxonomyNode[];
}

export async function fetchCategoryTree(): Promise<TaxonomyNode[]> {
  const supabase = createClient();

  // Fetch categories and song_category_map in parallel
  const [categoriesRes, mapRes] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, emoji, icon_name, parent_id')
      .order('name'),
    supabase
      .from('song_category_map')
      .select('category_id'),
  ]);

  if (categoriesRes.error) {
    console.error('Error fetching categories:', JSON.stringify(categoriesRes.error, null, 2));
    return [];
  }

  const categories = categoriesRes.data;
  if (!categories) return [];

  const countMap: Record<string, number> = {};
  if (mapRes.data) {
    mapRes.data.forEach((row) => {
      countMap[row.category_id] = (countMap[row.category_id] || 0) + 1;
    });
  }

  // Separate parents and children
  const parents = categories.filter(c => !c.parent_id);
  const children = categories.filter(c => c.parent_id);

  // Build tree
  const tree = parents.map(parent => {
    return {
      ...parent,
      song_count: countMap[parent.id] || 0,
      children: children
        .filter(child => child.parent_id === parent.id)
        .map(child => ({
          ...child,
          song_count: countMap[child.id] || 0,
          children: [] // Grandchildren not supported/expected yet
        }))
    };
  });

  // Sort parents by specific order if needed, or just alphabetical
  // For now, let's stick to the order from DB (alphabetical by name) is okay, 
  // but the original screen design implies a specific order (Elements, Nature, Languages...).
  // For MVP, alphabetical or creation order is fine. DB seed had them in a specific order but `order by name` scrambles it.
  // If we want specific order, we'd need an `order_index` column. 
  // I'll leave it as is for now.

  return tree;
}
