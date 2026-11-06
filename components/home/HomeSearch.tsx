'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/ui/button';
import SearchSuggestions from '@/components/search/SearchSuggestions';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { addRecentSearch, clearRecentSearches, removeRecentSearch } from '@/lib/search/history';

/**
 * Story 6.1.28 (G6.3, #412): the inline search field on Home. It does not search by itself: like the
 * header field it sends the term to the song list (`/songs?search=`), and it reuses the G7.1 panel
 * (recent searches + category chips) instead of building a second one.
 */
export default function HomeSearch() {
  const { t } = useLocale();
  const router = useRouter();
  const [value, setValue] = useState('');
  const {
    inputRef,
    wrapperRef,
    panelRef,
    open,
    close,
    show,
    recent,
    setRecent,
    categories,
    closeIfFocusLeaves,
    closeFromPanel,
    focusFirstSuggestion,
  } = useSearchSuggestions();

  const go = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    addRecentSearch(trimmed);
    close();
    router.push(`/songs?search=${encodeURIComponent(trimmed)}`);
  };

  const panelVisible = open && !value && (recent.length > 0 || categories.length > 0);

  return (
    <div ref={wrapperRef} onBlur={closeIfFocusLeaves} className="relative">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(value);
        }}
        className="flex items-center gap-2"
      >
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={show}
            onClick={show}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close();
              if (e.key === 'ArrowDown') focusFirstSuggestion(e);
            }}
            aria-label={t('home.search.label')}
            placeholder={t('home.search.placeholder')}
            className="min-h-tap w-full rounded-control border border-line bg-surface-2 py-2.5 ps-10 pe-3 text-body text-fg placeholder:text-fg-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <Button type="submit" variant="secondary">{t('home.search.submit')}</Button>
      </form>

      {panelVisible && (
        <div ref={panelRef} className="absolute inset-x-0 top-full z-20 mt-2">
          <SearchSuggestions
            recent={recent}
            categories={categories}
            onSelectRecent={go}
            onRemoveRecent={(term) => setRecent(removeRecentSearch(term))}
            onClearRecent={() => setRecent(clearRecentSearches())}
            onToggleCategory={(slug) => {
              close();
              router.push(`/songs?category=${encodeURIComponent(slug)}`);
            }}
            onClose={closeFromPanel}
            onLeaveTop={() => inputRef.current?.focus()}
          />
        </div>
      )}
    </div>
  );
}
