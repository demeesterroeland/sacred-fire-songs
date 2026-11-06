'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ListMusic, Loader2, Menu, Music, PlusCircle, Search, SlidersHorizontal } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth, type AuthUser } from '@/hooks/useAuth';
import { getSiteTitle } from '@/lib/env';
import { UserProfile } from './navigation/UserProfile';
import { NotificationBell } from './navigation/NotificationBell';
import { useLocale } from '@/context/LocaleContext';
import { FOCUS_SEARCH_EVENT } from '@/lib/search/focusSearch';
import { addRecentSearch, clearRecentSearches, removeRecentSearch } from '@/lib/search/history';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import SearchSuggestions from '@/components/search/SearchSuggestions';
import { SuggestionsPortal } from '@/components/search/SuggestionsSlot';

export default function Header({ initialUser }: { initialUser?: AuthUser | null }) {
    const { t } = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setIsOpen: setSidebarOpen, searchFiltersOpen, setSearchFiltersOpen, hasActiveSearchFilters, isSearching, setIsSearching } = useSidebar();
    const { user } = useAuth(initialUser);
    // Suggestion panel (Story 6.1.29 / G7.1, #413): shared with the Home search field.
    const {
        inputRef,
        wrapperRef: searchWrapperRef,
        panelRef: suggestionsRef,
        open: historyOpen,
        close: closeSuggestions,
        show: openSuggestions,
        forceShow,
        recent: searchHistory,
        setRecent: setSearchHistory,
        categories,
        closeIfFocusLeaves,
        closeFromPanel: closeSuggestionsFromPanel,
        focusFirstSuggestion,
    } = useSearchSuggestions();
    // Guests on Home have the inline search field there: a second one in the header would be a duplicate (UXA-042).
    const hideSearch = pathname === '/' && !user;
    const createMenuRef = useRef<HTMLDivElement>(null);
    const [createMenuOpen, setCreateMenuOpen] = useState(false);

    // Initialize from URL when on /songs page
    const isOnSongsPage = pathname === '/songs';
    const [searchValue, setSearchValue] = useState(
        isOnSongsPage ? (searchParams.get('search') || '') : ''
    );
    const activeCategory = isOnSongsPage ? (searchParams.get('category') ?? undefined) : undefined;

    // Sync search value when navigating to /songs with a search param
    // Skip sync while user is actively typing (input focused) to avoid overwriting
    useEffect(() => {
        if (isOnSongsPage && document.activeElement !== inputRef.current) {
            setSearchValue(searchParams.get('search') || '');
        }
    }, [isOnSongsPage, searchParams, searchValue, inputRef]);

    // Bottom bar "Search" tab (Story 6.1.24, #408): focus the field on tap and show the suggestions,
    // also when the field already had focus (no focus event fires then).
    // On guest Home there is no header field yet: remember the request and honour it when the field appears
    // (the tab navigates to the song list, and the header outlives the navigation).
    const pendingSearchFocusRef = useRef(false);
    useEffect(() => {
        const focusInput = () => {
            if (hideSearch) {
                pendingSearchFocusRef.current = true;
                return;
            }
            inputRef.current?.focus();
            forceShow();
        };
        window.addEventListener(FOCUS_SEARCH_EVENT, focusInput);
        return () => window.removeEventListener(FOCUS_SEARCH_EVENT, focusInput);
    }, [forceShow, hideSearch, inputRef]);

    useEffect(() => {
        if (hideSearch || !pendingSearchFocusRef.current) return;
        pendingSearchFocusRef.current = false;
        // Only honour it on the song list the tab leads to; any other page (cancelled navigation,
        // sign-in on Home) drops the request so the field never grabs focus later.
        if (pathname !== '/songs') return;
        inputRef.current?.focus();
        forceShow();
    }, [hideSearch, pathname, forceShow, inputRef]);

    // Close the create menu on outside tap or click (the suggestion panel closes itself)
    useEffect(() => {
        const handleClick = (e: PointerEvent) => {
            if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
                setCreateMenuOpen(false);
            }
        };
        document.addEventListener('pointerdown', handleClick);
        return () => document.removeEventListener('pointerdown', handleClick);
    }, []);

    const removeFromHistory = useCallback((term: string) => {
        setSearchHistory(removeRecentSearch(term));
    }, [setSearchHistory]);

    const clearHistory = useCallback(() => {
        setSearchHistory(clearRecentSearches());
    }, [setSearchHistory]);

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
        closeSuggestions();
    };

    const suggestionsVisible = historyOpen && !searchValue && (searchHistory.length > 0 || categories.length > 0);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
            inputRef.current?.blur();
        }
        if (e.key === 'Escape') {
            setSearchValue('');
            closeSuggestions();
            inputRef.current?.blur();
        }
        if (e.key === 'ArrowDown') focusFirstSuggestion(e);
    };

    // Keep a search the person typed and left (the field live-searches, so Enter is optional).
    const handleBlur = (e: React.FocusEvent) => {
        const term = searchValue.trim();
        if (term.length >= 2) setSearchHistory(addRecentSearch(term));
        closeIfFocusLeaves(e);
    };

    const toggleCategory = (slug: string) => {
        const params = new URLSearchParams(isOnSongsPage ? searchParams.toString() : '');
        if (params.get('category') === slug) params.delete('category');
        else params.set('category', slug);
        params.delete('tag'); // tags belong to the previous category
        params.delete('search');
        closeSuggestions();
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
    }, [inputRef]);

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
                    <Link href="/" className="hidden lg:flex items-center gap-2.5 group/logo shrink-0">
                        <span className="hidden lg:block font-bold text-base text-gray-900 dark:text-white tracking-tight group-hover/logo:text-red-600 dark:group-hover/logo:text-red-400 transition-colors">
                            {getSiteTitle()}
                        </span>
                    </Link>
                </div>

                {/* Center: Search bar (everywhere, except guests on Home: they have the inline field) */}
                <div className="flex items-center px-2 lg:px-4 flex-1">
                    {!hideSearch && <div ref={searchWrapperRef} className="relative w-full max-w-3xl group">
                        {/* Search icon / loading spinner */}
                        {isSearching && isOnSongsPage && !searchFiltersOpen ? (
                            <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle animate-spin pointer-events-none z-10" />
                        ) : (
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle group-focus-within:text-fg-muted transition-colors pointer-events-none z-10" />
                        )}
                        <input
                            ref={inputRef}
                            type="text"
                            aria-label={t('home.search.label')}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={openSuggestions}
                            onClick={openSuggestions}
                            onBlur={handleBlur}
                            aria-controls={suggestionsVisible ? 'search-suggestions' : undefined}
                            aria-describedby="search-suggestions-hint"
                            placeholder={t('songs.searchPlaceholder', { count: 200 })}
                            className="w-full min-h-tap bg-surface-2 border border-line rounded-control py-2.5 pl-10 pr-14 text-body text-fg placeholder:text-fg-subtle transition-all relative z-10"
                        />
                        <span id="search-suggestions-hint" className="sr-only">{t('header.suggestionsHint')}</span>
                        <button
                            onClick={() => {
                                closeSuggestions();
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
                    </div>}
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

            {/* Suggestions: recent searches + category chips (Story 6.1.29 / G7.1). Rendered into the slot at the
                top of the main column: in the page flow, so it pushes the page down instead of covering it. */}
            {suggestionsVisible && (
                <SuggestionsPortal>
                    <div
                        id="search-suggestions"
                        ref={suggestionsRef}
                        onBlur={closeIfFocusLeaves}
                        className="px-2 pb-2 pt-2 lg:px-6"
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
                            className="max-h-[70dvh] max-w-3xl overflow-y-auto"
                        />
                    </div>
                </SuggestionsPortal>
            )}
        </nav>
    );
}
