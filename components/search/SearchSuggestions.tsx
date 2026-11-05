'use client';

import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { Chip } from '@/components/ui/chip';

export interface SuggestedCategory {
  id: string;
  name: string;
  slug: string;
}

interface SearchSuggestionsProps {
  recent: string[];
  categories: SuggestedCategory[];
  /** Slug of the category filter currently applied to the song list. */
  activeCategory?: string;
  onSelectRecent: (term: string) => void;
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
  onToggleCategory: (slug: string) => void;
  onClose: () => void;
  /** ArrowUp on the first item: hand focus back to the search field. */
  onLeaveTop: () => void;
  className?: string;
}

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

/**
 * Story 6.1.29 (G7.1, #413): what the search field offers while it is focused and empty —
 * the last 5 searches (clearable one by one or all at once) and the top-level categories as chips.
 * Greyscale; the Chip primitive marks the selected category with inverted greys plus a check.
 */
export default function SearchSuggestions({
  recent,
  categories,
  activeCategory,
  onSelectRecent,
  onRemoveRecent,
  onClearRecent,
  onToggleCategory,
  onClose,
  onLeaveTop,
  className = '',
}: SearchSuggestionsProps) {
  const { t } = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);

  const items = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button') ?? []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    const backward = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
    if (!forward && !backward) return;
    e.preventDefault();
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    if (forward) {
      list[Math.min(index + 1, list.length - 1)]?.focus();
    } else if (index <= 0) {
      onLeaveTop();
    } else {
      list[index - 1]?.focus();
    }
  };

  // After a removal the focused button is gone: keep keyboard focus inside the panel.
  const keepFocus = () => requestAnimationFrame(() => panelRef.current?.focus());

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      data-testid="search-suggestions"
      onKeyDown={handleKeyDown}
      className={`rounded-panel border border-line bg-surface shadow-sheet outline-none ${className}`}
    >
      {recent.length > 0 && (
        <section aria-labelledby="recent-searches-heading" className="px-4 pt-1">
          <div className="flex min-h-tap items-center justify-between">
            <h2 id="recent-searches-heading" className="text-caption font-semibold text-fg-muted">
              {t('header.recentSearches')}
            </h2>
            <button
              type="button"
              data-clear-all
              onClick={() => {
                onClearRecent();
                keepFocus();
              }}
              className={`-me-2 inline-flex min-h-tap items-center px-2 text-meta font-medium text-fg-muted hover:text-fg ${FOCUS}`}
            >
              {t('header.clearAll')}
            </button>
          </div>
          <ul>
            {recent.map((term) => (
              <li key={term} className="flex items-center">
                <button
                  type="button"
                  onClick={() => onSelectRecent(term)}
                  className={`flex min-h-tap min-w-0 flex-1 items-center gap-3 text-start text-body text-fg hover:bg-surface-2 ${FOCUS}`}
                >
                  <Search aria-hidden="true" className="size-4 shrink-0 text-fg-subtle" />
                  <span className="truncate">{term}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveRecent(term);
                    keepFocus();
                  }}
                  aria-label={`${t('common.remove')} "${term}"`}
                  title={t('common.remove')}
                  className={`-me-2 inline-flex size-tap shrink-0 items-center justify-center rounded-control text-fg-subtle hover:bg-surface-2 hover:text-fg ${FOCUS}`}
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {categories.length > 0 && (
        <section
          aria-labelledby="search-categories-heading"
          className={`px-4 pb-3 ${recent.length > 0 ? 'mt-1 border-t border-line pt-1' : 'pt-1'}`}
        >
          <h2 id="search-categories-heading" className="flex min-h-tap items-center text-caption font-semibold text-fg-muted">
            {t('search.categories.heading')}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Chip
                  selected={activeCategory === category.slug}
                  onClick={() => onToggleCategory(category.slug)}
                  className={FOCUS}
                >
                  {category.name}
                </Chip>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
