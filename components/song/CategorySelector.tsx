'use client';

import { useState, useMemo } from 'react';
import { useTaxonomy } from '@/lib/hooks/useTaxonomy';
import { TagPill } from '@/components/ui/TagPill';
import { Loader2, Search, X } from 'lucide-react';

interface CategorySelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function CategorySelector({ selectedIds, onChange }: CategorySelectorProps) {
  const { categories, grouped, isLoading, error } = useTaxonomy();
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((existingId) => existingId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  // Filter grouped categories based on search term
  const filteredGrouped = useMemo(() => {
    if (!searchTerm.trim()) return grouped;
    const term = searchTerm.toLowerCase();

    return grouped
      .map(({ parentName, categories: groupCats }) => ({
        parentName,
        categories: groupCats.filter(
          (cat) =>
            cat.name.toLowerCase().includes(term) ||
            cat.slug.toLowerCase().includes(term) ||
            parentName.toLowerCase().includes(term)
        ),
      }))
      .filter((group) => group.categories.length > 0);
  }, [grouped, searchTerm]);

  // Selected categories list for top summary bar
  const selectedCategories = useMemo(() => {
    return categories.filter((cat) => selectedIds.includes(cat.id));
  }, [categories, selectedIds]);

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
    <div className="space-y-4 bg-gray-50 dark:bg-[#1d1c26] border border-gray-300 dark:border-[#3f3d52] rounded-xl p-4 transition-all">
      {/* 1. Search Filter & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tags or browse categories below..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs shrink-0">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              {selectedIds.length} {selectedIds.length === 1 ? 'tag' : 'tags'} selected
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-red-600 dark:text-red-400 hover:underline text-xs font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* 2. Selected Tags Bar */}
      {selectedCategories.length > 0 && (
        <div className="p-3 bg-red-50/50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 rounded-lg space-y-1.5">
          <span className="text-[10px] font-bold tracking-wider uppercase text-red-600 dark:text-red-400">
            Selected Tags ({selectedCategories.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedCategories.map((cat) => (
              <TagPill
                key={`selected-${cat.id}`}
                label={cat.name}
                categorySlug={cat.slug}
                variant="selectable"
                selected={true}
                onClick={() => toggleCategory(cat.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. Visual Grouped Tag Grid */}
      <div className="space-y-4 pt-1 max-h-[320px] overflow-y-auto pr-1">
        {filteredGrouped.map(({ parentName, categories: groupCats }) => (
          <div key={parentName} className="space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>{parentName}</span>
              <span className="text-[10px] text-gray-400 font-normal">{groupCats.length}</span>
            </h4>
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

        {filteredGrouped.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-xs">
            No tags found matching &quot;{searchTerm}&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
