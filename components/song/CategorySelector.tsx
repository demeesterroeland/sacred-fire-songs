'use client';

import { useQuery } from '@tanstack/react-query';
import { getCategoryColor, getCategoryStyles } from '@/lib/uiUtils';
import { getAvailableCategories, Category } from '@/lib/actions/category';
import { useState, useMemo } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface CategorySelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function CategorySelector({ selectedIds, onChange }: CategorySelectorProps) {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getAvailableCategories
  });

  // Group categories by parent
  const groupedCategories = useMemo(() => {
    const groups: Record<string, Category[]> = {};
    categories.forEach(cat => {
      const parent = cat.parent_name || 'Other';
      if (!groups[parent]) groups[parent] = [];
      groups[parent].push(cat);
    });
    return groups;
  }, [categories]);

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(existingId => existingId !== id));
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
      {Object.entries(groupedCategories).map(([parentName, groupCats]) => (
        <div key={parentName} className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{parentName}</h4>
          <div className="flex flex-wrap gap-2">
            {groupCats.map(cat => {
              const isSelected = selectedIds.includes(cat.id);
              const color = getCategoryColor(cat.slug);
              const styles = getCategoryStyles(color);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                                        ${isSelected
                      ? styles.pill + ' ring-1 ring-inset ring-white/10'
                      : 'bg-gray-200 dark:bg-[#2a2836] text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-300 dark:hover:bg-[#353342]'
                    }
                                    `}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {categories.length === 0 && (
        <p className="text-gray-500 text-xs">No tags available.</p>
      )}
    </div>
  );
}
