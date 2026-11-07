'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { TaxonomyNode } from '@/lib/taxonomyUtils';
import { Chip } from '@/components/ui/chip';
import { categoryDisplayName } from '@/lib/taxonomy/categoryName';
import { useTaxonomy } from '@/lib/hooks/useTaxonomy';
import { useLocale } from '@/context/LocaleContext';
import { formatCount } from '@/lib/format/count';

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
  taxonomy,
  onCategoryChange,
  onTagsChange,
  onClearAll,
  clearLabel,
  artist,
  onArtistChange,
}: TagSelectorProps) {
  const { t } = useLocale();
  const resolvedClearLabel = clearLabel ?? t('search.clearAll');
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { categories, grouped } = useTaxonomy();

  // Selected category objects
  const selectedTagObjects = useMemo(() => {
    return categories.filter((c) => tags.includes(c.slug) || tags.includes(c.id));
  }, [categories, tags]);

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
        className="field-composite flex min-h-tap cursor-text flex-wrap items-center gap-2 rounded-control border border-line-strong bg-surface px-3 py-2"
        onClick={() => inputRef.current?.focus()}
      >
        <Search aria-hidden className="size-4 shrink-0 text-fg-subtle" />

        {/* Selected filters: neutral chips (inverted + check), tap to remove */}
        {category && (
          <Chip selected onClick={() => onCategoryChange(undefined)}>
            {t('search.tagSelector.categoryPrefix', { category: categoryDisplayName(category, taxonomy, categories) })}
          </Chip>
        )}

        {artist && (
          <Chip selected onClick={() => onArtistChange?.(undefined)}>
            {t('search.tagSelector.artistPrefix', { artist })}
          </Chip>
        )}

        {tags.map((tagSlug) => {
          const tagObj = categories.find((c) => c.slug === tagSlug || c.id === tagSlug);
          return (
            <Chip key={tagSlug} selected onClick={() => toggleTagSlug(tagSlug)}>
              {tagObj?.emoji && <span aria-hidden className="leading-none">{tagObj.emoji}</span>}
              {tagObj?.name || categoryDisplayName(tagSlug, taxonomy, categories)}
            </Chip>
          );
        })}

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          className="min-w-[140px] flex-1 border-none bg-transparent text-meta text-fg placeholder:text-fg-subtle"
          placeholder={
            category || tags.length > 0 || artist
              ? t('search.tagSelector.addMoreTags')
              : t('search.tags.placeholder')
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
            className="ml-auto inline-flex min-h-tap shrink-0 items-center px-1 text-caption font-semibold text-fg-muted underline underline-offset-4 transition-colors hover:text-fg"
          >
            {resolvedClearLabel}
          </button>
        )}
      </div>

      {/* 2. Visual Tag Browser Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[300px] space-y-4 overflow-y-auto rounded-panel border border-line bg-surface p-4 shadow-sheet">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <span className="text-caption font-semibold text-fg-muted">
              {t('search.tagSelector.browseAll')}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t('common.close')}
              className="inline-flex size-tap items-center justify-center rounded-control text-fg-subtle hover:text-fg"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>

          {filteredGrouped.map(({ parentName, categories: groupCats }) => (
            <div key={parentName} className="space-y-1.5">
              <h5 className="text-caption font-semibold text-fg-muted">
                {parentName}
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {groupCats.map((cat) => {
                  const isSelected = tags.includes(cat.slug) || tags.includes(cat.id);
                  return (
                    <Chip key={cat.id} selected={isSelected} onClick={() => toggleTagSlug(cat.slug)}>
                      {cat.emoji && <span aria-hidden className="leading-none">{cat.emoji}</span>}
                      {cat.name}
                      {cat.song_count !== undefined && ' '}
                      {cat.song_count !== undefined && (
                        <span className="font-normal tabular-nums">{formatCount(cat.song_count)}</span>
                      )}
                    </Chip>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredGrouped.length === 0 && (
            <div className="py-4 text-center text-meta text-fg-subtle">
              {t('search.tagSelector.noMatchingTags', { query: inputValue })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
