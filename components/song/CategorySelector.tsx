'use client';

import { useTaxonomy } from '@/lib/hooks/useTaxonomy';
import { TagPill } from '@/components/ui/TagPill';
import { Loader2 } from 'lucide-react';

interface CategorySelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function CategorySelector({ selectedIds, onChange }: CategorySelectorProps) {
  const { categories, grouped, isLoading, error } = useTaxonomy();

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((existingId) => existingId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading tags...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 text-sm">Failed to load tags.</div>;
  }

  return (
    <div className="space-y-4 bg-gray-50 dark:bg-[#1d1c26] border border-gray-300 dark:border-[#3f3d52] rounded-lg p-4">
      {grouped.map(({ parentName, categories: groupCats }) => (
        <div key={parentName} className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{parentName}</h4>
          <div className="flex flex-wrap gap-2">
            {groupCats.map((cat) => (
              <TagPill
                key={cat.id}
                label={cat.name}
                categorySlug={cat.slug}
                variant="selectable"
                selected={selectedIds.includes(cat.id)}
                onClick={() => toggleCategory(cat.id)}
              />
            ))}
          </div>
        </div>
      ))}
      {categories.length === 0 && (
        <p className="text-gray-500 text-xs">No tags available.</p>
      )}
    </div>
  );
}
