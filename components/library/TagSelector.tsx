'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { TaxonomyNode } from '@/lib/taxonomyUtils';
import { TagPill } from '@/components/ui/TagPill';
import { useTaxonomy } from '@/lib/hooks/useTaxonomy';

interface TagSelectorProps {
  category?: string;
  tags: string[];
  taxonomy?: TaxonomyNode[];
  onCategoryChange: (slug?: string) => void;
  onTagsChange: (tags: string[]) => void;
  onClearAll: () => void;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  hasActiveFilters?: boolean;
  clearLabel?: string;
  artist?: string;
  onArtistChange?: (artist?: string) => void;
}

export default function TagSelector({
  category,
  tags,
  onCategoryChange,
  onTagsChange,
  onClearAll,
  clearLabel = 'Clear All',
  artist,
  onArtistChange,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { categories, grouped } = useTaxonomy();

  // Selected category objects
  const selectedTagObjects = useMemo(() => {
    return categories.filter((c) => tags.includes(c.slug) || tags.includes(c.id));
  }, [categories, tags]);

  const selectedCategoryObject = useMemo(() => {
    return categories.find((c) => c.slug === category || c.id === category);
  }, [categories, category]);

  // Flattened options for search filter
  const filteredGrouped = useMemo(() => {
    if (!inputValue.trim()) return grouped;
    const term = inputValue.toLowerCase();
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
  }, [grouped, inputValue]);

  const toggleTagSlug = (slug: string) => {
    if (tags.includes(slug)) {
      onTagsChange(tags.filter((t) => t !== slug));
    } else {
      onTagsChange([...tags, slug]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3 relative w-full" ref={wrapperRef}>
      {/* 1. Search Bar & Active Tag Pills */}
      <div
        className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl py-2 px-3 focus-within:ring-2 focus-within:ring-red-500/50 transition-all cursor-text min-h-[44px]"
        onClick={() => inputRef.current?.focus()}
      >
        <Search className="w-4 h-4 text-gray-400 shrink-0" />

        {/* Selected Category Pill */}
        {category && (
          <TagPill
            label={`Category: ${selectedCategoryObject?.name || category}`}
            categorySlug={category}
            variant="selectable"
            selected={true}
            onClick={() => onCategoryChange(undefined)}
          />
        )}

        {/* Selected Artist Pill */}
        {artist && (
          <TagPill
            label={`Artist: ${artist}`}
            variant="selectable"
            selected={true}
            onClick={() => onArtistChange?.(undefined)}
          />
        )}

        {/* Selected Tag Pills */}
        {tags.map((tagSlug) => {
          const tagObj = categories.find((c) => c.slug === tagSlug || c.id === tagSlug);
          return (
            <TagPill
              key={tagSlug}
              label={tagObj?.name || tagSlug}
              categorySlug={tagObj?.slug || tagSlug}
              emoji={tagObj?.emoji}
              variant="selectable"
              selected={true}
              onClick={() => toggleTagSlug(tagSlug)}
            />
          );
        })}

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[140px] bg-transparent border-none outline-none text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          placeholder={
            category || tags.length > 0 || artist
              ? 'Add more tags...'
              : 'Search tags or browse categories below...'
          }
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />

        {(category || tags.length > 0 || artist) && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[10px] font-bold text-gray-500 hover:text-red-500 uppercase tracking-wider transition-colors shrink-0 ml-auto"
          >
            {clearLabel}
          </button>
        )}
      </div>

      {/* 2. Visual Tag Browser Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 p-4 max-h-[300px] overflow-y-auto space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Browse All Tags by Category
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {filteredGrouped.map(({ parentName, categories: groupCats }) => (
            <div key={parentName} className="space-y-1.5">
              <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                {parentName}
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {groupCats.map((cat) => {
                  const isSelected = tags.includes(cat.slug) || tags.includes(cat.id);
                  return (
                    <TagPill
                      key={cat.id}
                      label={cat.name}
                      categorySlug={cat.slug}
                      emoji={cat.emoji}
                      variant="selectable"
                      selected={isSelected}
                      onClick={() => toggleTagSlug(cat.slug)}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {filteredGrouped.length === 0 && (
            <div className="text-center py-4 text-gray-400 text-xs">
              No tags matching &quot;{inputValue}&quot;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
