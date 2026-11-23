'use client';

import { useState, useMemo } from 'react';
import { useTaxonomy } from '@/lib/hooks/useTaxonomy';
import { TagPill } from '@/components/ui/TagPill';
import { Loader2, Search, X } from 'lucide-react';

import { useLocale } from '@/context/LocaleContext';
interface CategorySelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function CategorySelector({ selectedIds, onChange }: CategorySelectorProps) {
  const { t } = useLocale();
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
      <div role="status" className="flex items-center gap-2 text-fg-muted text-sm p-4">
        <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
        {t('search.tags.loading')}
      </div>
    );
  }

  if (error) {
    return <div role="alert" className="text-danger text-sm">{t('search.tags.loadError')}</div>;
  }

  return (
    <div className="space-y-4 bg-surface border border-line rounded-panel p-4">
      {/* 1. Search Filter & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search aria-hidden="true" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search.tags.placeholder')}
            aria-label={t('search.tags.placeholder')}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-control bg-bg border border-line-strong text-fg placeholder:text-fg-subtle"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label={t('search.tags.clearSearch')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg"
            >
              <X aria-hidden="true" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs shrink-0">
            <span className="text-fg-muted font-medium">
              {t('search.tags.selectedCount', { count: selectedIds.length })}
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-fg underline-offset-2 hover:underline text-xs font-medium"
            >
              {t('search.clearAll')}
            </button>
          </div>
        )}
      </div>

      {/* 2. Selected Tags Bar */}
      {selectedCategories.length > 0 && (
        <div className="p-3 bg-surface-2 border border-line rounded-control space-y-1.5">
          <span className="text-caption font-semibold text-fg-muted">
            {t('search.tags.selected', { count: selectedCategories.length })}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedCategories.map((cat) => (
              <TagPill
                key={`selected-${cat.id}`}
                label={cat.name}
                emoji={cat.emoji}
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
            <h4 className="text-meta font-semibold text-fg-muted">
              {parentName}
            </h4>
            <div className="flex flex-wrap gap-2">
              {groupCats.map((cat) => (
                <TagPill
                  key={cat.id}
                  label={cat.name}
                  emoji={cat.emoji}
                  count={cat.song_count}
                  variant="selectable"
                  selected={selectedIds.includes(cat.id)}
                  onClick={() => toggleCategory(cat.id)}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredGrouped.length === 0 && (
          <div className="text-center py-6 text-fg-muted text-xs">
            {t('search.tags.noMatch', { term: searchTerm })}
          </div>
        )}
      </div>
    </div>
  );
}
