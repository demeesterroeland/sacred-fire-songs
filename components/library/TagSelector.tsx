'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Search, ChevronDown, Check } from 'lucide-react';
import { TaxonomyNode } from '@/lib/taxonomyUtils';
import { getCategoryColor, getCategoryStyles } from '@/lib/uiUtils';

interface TagSelectorProps {
  category?: string;
  tags: string[];
  taxonomy: TaxonomyNode[];
  onCategoryChange: (slug?: string) => void;
  onTagsChange: (tags: string[]) => void;
  onClearAll: () => void;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  hasActiveFilters?: boolean;
}

export default function TagSelector({
  category,
  tags,
  taxonomy,
  onCategoryChange,
  onTagsChange,
  onClearAll,
  onSearchChange,
  searchValue = '',
  hasActiveFilters = false,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten taxonomy for easier searching
  const allOptions = useMemo(() => {
    const options: { slug: string; name: string; isCategory: boolean; parentSlug?: string }[] = [];
    taxonomy.forEach(cat => {
      options.push({ slug: cat.slug, name: cat.name, isCategory: true });
      cat.children.forEach(tag => {
        options.push({ slug: tag.slug, name: tag.name, isCategory: false, parentSlug: cat.slug });
      });
    });
    return options;
  }, [taxonomy]);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return [];
    const lower = inputValue.toLowerCase();
    return allOptions.filter(opt =>
      opt.name.toLowerCase().includes(lower) &&
      opt.slug !== category &&
      !tags.includes(opt.slug)
    ).slice(0, 10);
  }, [allOptions, inputValue, category, tags]);

  const handleSelect = (option: typeof allOptions[0]) => {
    if (option.isCategory) {
      onCategoryChange(option.slug);
    } else {
      if (!tags.includes(option.slug)) {
        onTagsChange([...tags, option.slug]);
      }
    }
    setInputValue('');
    setIsOpen(false);
  };

  const removeCategory = () => onCategoryChange(undefined);
  const removeTag = (slug: string) => onTagsChange(tags.filter(t => t !== slug));

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
    <div className="flex items-center gap-4 relative w-full" ref={wrapperRef}>
      <div
        className="flex-1 flex flex-wrap items-center gap-2 bg-white/60 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60 rounded-xl py-1.5 px-4 focus-within:bg-white/80 dark:focus-within:bg-gray-900/60 transition-all cursor-text ring-1 ring-gray-900/5 dark:ring-white/5 shadow-inner min-h-[42px]"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Category Pill */}
        {category && (() => {
          const catOption = allOptions.find(o => o.slug === category);
          const color = getCategoryColor(category);
          const style = getCategoryStyles(color);
          return (
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${style.inactive} animate-in zoom-in-95 duration-200`}>
              <span className="whitespace-nowrap">CATEGORY: {catOption?.name || category}</span>
              <button
                className="hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); removeCategory(); }}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })()}

        {/* Tag Pills */}
        {tags.map(tagSlug => {
          const tagOption = allOptions.find(o => o.slug === tagSlug);
          // Use the tag's specific color mapping if it exists, otherwise fallback to parent
          const color = getCategoryColor(tagSlug);
          const style = getCategoryStyles(color);
          return (
            <div key={tagSlug} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${style.inactive} animate-in zoom-in-95 duration-200`}>
              <span className="whitespace-nowrap">{tagOption?.name || tagSlug}</span>
              <button
                className="hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); removeTag(tagSlug); }}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
          placeholder={category || tags.length > 0 ? "" : "Add category or tags..."}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isOpen && filteredOptions.length > 0) {
              e.preventDefault();
              handleSelect(filteredOptions[0]);
            } else if (e.key === 'Backspace' && !inputValue) {
              if (tags.length > 0) {
                e.preventDefault();
                const newTags = [...tags];
                newTags.pop();
                onTagsChange(newTags);
              } else if (category) {
                e.preventDefault();
                onCategoryChange(undefined);
              }
            }
          }}
        />

        {/* Dropdown Menu */}
        {isOpen && filteredOptions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[250px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="p-2">
              {filteredOptions.map(option => {
                const color = getCategoryColor(option.slug);
                return (
                  <button
                    key={option.slug}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-between group transition-colors"
                    onClick={() => handleSelect(option)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full bg-${color}-500 shadow-[0_0_8px_rgba(0,0,0,0.4)]`} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                          {option.name}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                          {option.isCategory ? 'Category' : 'Tag'}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity -rotate-90" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Clear All Button */}
      {(category || tags.length > 0 || searchValue || hasActiveFilters) && (
        <button
          onClick={onClearAll}
          className="text-[10px] font-bold text-gray-600 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1.5 px-2"
        >
          <X className="w-3 h-3" />
          Clear All
        </button>
      )}
    </div>
  );
}
