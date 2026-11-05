'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ListMusic, Loader2, Menu, Music, PlusCircle, Search, SlidersHorizontal } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth, type AuthUser } from '@/hooks/useAuth';
import { getSiteTitle } from '@/lib/env';
import { UserProfile } from './navigation/UserProfile';
import { NotificationBell } from './navigation/NotificationBell';
import { useLocale } from '@/context/LocaleContext';
import { FOCUS_SEARCH_EVENT } from '@/lib/search/focusSearch';
import {
    addRecentSearch,
    clearRecentSearches,
    readRecentSearches,
    removeRecentSearch,
} from '@/lib/search/history';
import { fetchCategoryTree } from '@/lib/taxonomyUtils';
import { sortCategories } from '@/lib/categoryOrder';
import SearchSuggestions from '@/components/search/SearchSuggestions';

export default function Header({ initialUser }: { initialUser?: AuthUser | null }) {
    const { t } = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setIsOpen: setSidebarOpen, searchFiltersOpen, setSearchFiltersOpen, hasActiveSearchFilters, isSearching, setIsSearching } = useSidebar();
    const { user } = useAuth(initialUser);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchWrapperRef = useRef<HTMLDivElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    // Set when focus returns to the field after Escape: that focus must not reopen the panel.
    const skipOpenRef = useRef(false);
    const createMenuRef = useRef<HTMLDivElement>(null);
    const [createMenuOpen, setCreateMenuOpen] = useState(false);

    // Initialize from URL when on /songs page
    const isOnSongsPage = pathname === '/songs';
    const [searchValue, setSearchValue] = useState(
        isOnSongsPage ? (searchParams.get('search') || '') : ''
    );
    // Suggestion panel (Story 6.1.29 / G7.1, #413): recent searches + category chips.
    const [historyOpen, setHistoryOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const { data: categoryTree = [] } = useQuery({
        queryKey: ['taxonomy'],
        queryFn: fetchCategoryTree,
        staleTime: 1000 * 60 * 60,
        enabled: hasOpened,
    });
    const categories = sortCategories(categoryTree);
    const activeCategory = isOnSongsPage ? (searchParams.get('category') ?? undefined) : undefined;

    const openSuggestions = useCallback(() => {
        if (skipOpenRef.current) {
            skipOpenRef.current = false;
            return;
        }
        setSearchHistory(readRecentSearches());
        setHasOpened(true);
        setHistoryOpen(true);
    }, []);

    // Load history on mount (localStorage is only readable on the client)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of an external store
        setSearchHistory(readRecentSearches());
    }, []);

    // Sync search value when navigating to /songs with a search param
    // Skip sync while user is actively typing (input focused) to avoid overwriting
    useEffect(() => {
        if (isOnSongsPage && document.activeElement !== inputRef.current) {
            setSearchValue(searchParams.get('search') || '');
        }
    }, [isOnSongsPage, searchParams, searchValue]);

    // Bottom bar "Search" tab (Story 6.1.24, #408): focus the field on tap and show the suggestions,
    // also when the field already had focus (no focus event fires then).
    useEffect(() => {
        const focusInput = () => {
            inputRef.current?.focus();
            skipOpenRef.current = false;
            openSuggestions();
        };
        window.addEventListener(FOCUS_SEARCH_EVENT, focusInput);
        return () => window.removeEventListener(FOCUS_SEARCH_EVENT, focusInput);
    }, [openSuggestions]);

    // Close dropdowns on outside tap or click
    useEffect(() => {
        const handleClick = (e: PointerEvent) => {
            const target = e.target as Node;
            if (
                searchWrapperRef.current && !searchWrapperRef.current.contains(target) &&
                !suggestionsRef.current?.contains(target)
            ) {
                setHistoryOpen(false);
            }
            if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
                setCreateMenuOpen(false);
            }
        };
        document.addEventListener('pointerdown', handleClick);
        return () => document.removeEventListener('pointerdown', handleClick);
    }, []);

    const removeFromHistory = useCallback((term: string) => {
        setSearchHistory(removeRecentSearch(term));
    }, []);

    const clearHistory = useCallback(() => {
        setSearchHistory(clearRecentSearches());
    }, []);

    // Live search: debounce URL updates ONLY when user is actively typing (input focused)
    // This prevents background sync changes or modal commits from scheduling stale URL overrides.
    useEffect(() => {
        if (searchFiltersOpen) return; // modal handles its own submit
        if (typeof window !== 'undefined' && document.activeElement !== inputRef.current) {
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        const timer = setTimeout(() => {
            const trimmed = searchValue.trim();
            // Only push if we're on /songs, or if there's a search term (navigates to /songs)
            if (!isOnSongsPage && !trimmed) {
                setIsSearching(false);
                return;
            }
            // Build full URL preserving all current filter params
            const params = new URLSearchParams(searchParams.toString());
            if (trimmed) {
                params.set('search', trimmed);
            } else {
                params.delete('search');
            }
            router.push(`/songs?${params.toString()}`, { scroll: false });
            setIsSearching(false);
        }, 350);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue, searchFiltersOpen]);

    // Submit search (Enter or history click): save to history + navigate
    const handleSearch = (term?: string) => {
        const trimmed = (term ?? searchValue).trim();
        if (trimmed) {
            setSearchHistory(addRecentSearch(trimmed));
            router.push(`/songs?search=${encodeURIComponent(trimmed)}`);
        } else if (isOnSongsPage) {
            router.push('/songs');
        }
        setHistoryOpen(false);
    };

    const suggestionsVisible = historyOpen && !searchValue && (searchHistory.length > 0 || categories.length > 0);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
            inputRef.current?.blur();
        }
        if (e.key === 'Escape') {
            setSearchValue('');
            setHistoryOpen(false);
            inputRef.current?.blur();
        }
        if (e.key === 'ArrowDown' && historyOpen) {
            const first = suggestionsRef.current?.querySelector<HTMLElement>('button:not([data-clear-all])');
            if (first) {
                e.preventDefault();
                first.focus();
            }
        }
    };

    // Keep a search the person typed and left (the field live-searches, so Enter is optional).
    const handleBlur = (e: React.FocusEvent) => {
        const term = searchValue.trim();
        if (term.length >= 2) setSearchHistory(addRecentSearch(term));
        closeIfFocusLeaves(e);
    };

    // Tabbing out of the field and the panel closes the panel; taps outside are handled above.
    const closeIfFocusLeaves = (e: React.FocusEvent) => {
        const next = e.relatedTarget as Node | null;
        if (!next) return;
        if (searchWrapperRef.current?.contains(next) || suggestionsRef.current?.contains(next)) return;
        setHistoryOpen(false);
    };

    // Escape inside the panel: close it and give the field back its focus without reopening.
    const closeSuggestionsFromPanel = () => {
        setHistoryOpen(false);
        skipOpenRef.current = true;
        inputRef.current?.focus();
        // jsdom/old browsers that do not fire focus: do not leave the flag armed
        setTimeout(() => { skipOpenRef.current = false; }, 0);
    };

    const toggleCategory = (slug: string) => {
        const params = new URLSearchParams(isOnSongsPage ? searchParams.toString() : '');
        if (params.get('category') === slug) params.delete('category');
        else params.set('category', slug);
        params.delete('tag'); // tags belong to the previous category
        params.delete('search');
        setHistoryOpen(false);
        inputRef.current?.blur();
        router.push(params.toString() ? `/songs?${params.toString()}` : '/songs');
    };

    const selectRecent = (term: string) => {
        setSearchValue(term);
        handleSearch(term);
        inputRef.current?.blur();
    };

    // Keyboard shortcut: "/" to focus search
    useEffect(() => {
        const handleGlobalKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey &&
                !(target instanceof HTMLInputElement) &&
                !(target instanceof HTMLTextAreaElement) &&
                !(target instanceof HTMLSelectElement) &&
                !target?.isContentEditable &&
                !target?.closest('[role="dialog"]')) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleGlobalKey);
        return () => document.removeEventListener('keydown', handleGlobalKey);
    }, []);

    return (
        <nav
            id="app-navbar"
            className="h-[var(--navbar-height)] w-full text-sm relative lg:sticky lg:top-0 z-50 bg-bg/95 backdrop-blur-md"
        >
            <div className="grid h-full grid-cols-[auto_1fr_auto] lg:grid-cols-[16rem_1fr_auto] items-center border-b border-line">
                {/* Left: Menu button + Logo */}
                <div className="flex items-center gap-1.5 ms-4 lg:me-4">
                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-1.5 -ms-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        aria-label={t('header.openMenu')}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group/logo shrink-0">
                        <span className="hidden lg:block font-bold text-base text-gray-900 dark:text-white tracking-tight group-hover/logo:text-red-600 dark:group-hover/logo:text-red-400 transition-colors">
                            {getSiteTitle()}
                        </span>
                    </Link>
                </div>

                {/* Center: Search bar (visible everywhere) */}
                <div className="flex items-center px-2 lg:px-4 flex-1">
                    <div ref={searchWrapperRef} className="relative w-full max-w-3xl group">
                        {/* Search icon / loading spinner */}
                        {isSearching && isOnSongsPage && !searchFiltersOpen ? (
                            <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle animate-spin pointer-events-none z-10" />
                        ) : (
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle group-focus-within:text-fg-muted transition-colors pointer-events-none z-10" />
                        )}
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={openSuggestions}
                            onClick={openSuggestions}
                            onBlur={handleBlur}
                            aria-controls={suggestionsVisible ? 'search-suggestions' : undefined}
                            aria-describedby="search-suggestions-hint"
                            placeholder={t('songs.searchPlaceholder', { count: 200 })}
                            className="w-full min-h-tap bg-surface-2 border border-line rounded-control py-2.5 pl-10 pr-14 text-body text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:border-line-strong transition-all relative z-10"
                        />
                        <span id="search-suggestions-hint" className="sr-only">{t('header.suggestionsHint')}</span>
                        <button
                            onClick={() => {
                                setHistoryOpen(false);
                                setSearchFiltersOpen(!searchFiltersOpen);
                            }}
                            className={`absolute right-1 top-1/2 -translate-y-1/2 size-tap inline-flex items-center justify-center rounded-control transition-colors z-10 ${
                                hasActiveSearchFilters
                                    ? 'text-accent bg-accent-soft'
                                    : 'text-fg-subtle hover:text-fg hover:bg-surface'
                            }`}
                            aria-label={t('header.searchOptions')}
                            title={t('nav.showSearch')}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            {hasActiveSearchFilters && (
                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Right: Action buttons */}
                <div className="flex items-center gap-1 md:gap-2 pe-4 lg:pe-6">
                    {/* Create button with dropdown - desktop only */}
                    {user && (
                        <div ref={createMenuRef} className="relative hidden lg:block">
                            <button
                                onClick={() => setCreateMenuOpen(!createMenuOpen)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                    createMenuOpen
                                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                                }`}
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>{t('nav.create')}</span>
                            </button>
                            {createMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden w-52 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setCreateMenuOpen(false);
                                                router.push(`/songs/add?next=${encodeURIComponent(pathname || '/')}`);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                                        >
                                            <Music className="w-4.5 h-4.5 text-red-400" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{t('header.addSong')}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCreateMenuOpen(false);
                                                router.push('/library/playlists/add');
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                                        >
                                            <ListMusic className="w-4.5 h-4.5 text-purple-400" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{t('header.newPlaylist')}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {user && <NotificationBell userId={user.id} />}

                    {/* User avatar / Account panel */}
                    <UserProfile layout="header" showText={false} initialUser={initialUser} />
                </div>
            </div>

            {/* Suggestions: recent searches + category chips (Story 6.1.29 / G7.1) */}
            {suggestionsVisible && (
                <div
                    id="search-suggestions"
                    ref={suggestionsRef}
                    onBlur={closeIfFocusLeaves}
                    className="absolute inset-x-2 top-full z-50 mt-1 lg:inset-x-auto lg:left-[17rem] lg:w-[min(48rem,calc(100%-21rem))]"
                >
                    <SearchSuggestions
                        recent={searchHistory}
                        categories={categories}
                        activeCategory={activeCategory}
                        onSelectRecent={selectRecent}
                        onRemoveRecent={removeFromHistory}
                        onClearRecent={clearHistory}
                        onToggleCategory={toggleCategory}
                        onClose={closeSuggestionsFromPanel}
                        onLeaveTop={() => inputRef.current?.focus()}
                        className="max-h-[70dvh] overflow-y-auto"
                    />
                </div>
            )}
        </nav>
    );
}
