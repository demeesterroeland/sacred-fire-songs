'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Flame, ListMusic, Menu, Music, PlusCircle, Search, SlidersHorizontal, X } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { getSiteTitle } from '@/lib/env';
import { ThemeToggle } from './navigation/ThemeToggle';
import { AccountInfoPanel } from './navigation/AccountInfoPanel';

const SEARCH_HISTORY_KEY = 'sacred-fire-songs-search-history';
const MAX_HISTORY = 8;

function getSearchHistory(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
    } catch { return []; }
}

function saveSearchHistory(history: string[]) {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setIsOpen: setSidebarOpen, searchFiltersOpen, setSearchFiltersOpen, hasActiveSearchFilters } = useSidebar();
    const { user } = useAuth();
    const inputRef = useRef<HTMLInputElement>(null);
    const searchWrapperRef = useRef<HTMLDivElement>(null);
    const createMenuRef = useRef<HTMLDivElement>(null);
    const [createMenuOpen, setCreateMenuOpen] = useState(false);

    // Initialize from URL when on /songs page
    const isOnSongsPage = pathname === '/songs';
    const [searchValue, setSearchValue] = useState(
        isOnSongsPage ? (searchParams.get('search') || '') : ''
    );
    const [historyOpen, setHistoryOpen] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    // Load history on mount
    useEffect(() => {
        setSearchHistory(getSearchHistory());
    }, []);

    // Sync search value when navigating to /songs with a search param
    // Skip sync while user is actively typing (input focused) to avoid overwriting
    useEffect(() => {
        if (isOnSongsPage && document.activeElement !== inputRef.current) {
            setSearchValue(searchParams.get('search') || '');
        }
    }, [isOnSongsPage, searchParams]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
                setHistoryOpen(false);
            }
            if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
                setCreateMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const addToHistory = useCallback((term: string) => {
        const trimmed = term.trim();
        if (!trimmed) return;
        const updated = [trimmed, ...searchHistory.filter(h => h !== trimmed)].slice(0, MAX_HISTORY);
        setSearchHistory(updated);
        saveSearchHistory(updated);
    }, [searchHistory]);

    const removeFromHistory = useCallback((term: string) => {
        const updated = searchHistory.filter(h => h !== term);
        setSearchHistory(updated);
        saveSearchHistory(updated);
    }, [searchHistory]);

    const clearHistory = useCallback(() => {
        setSearchHistory([]);
        saveSearchHistory([]);
    }, []);

    // Live search: debounce URL updates as user types
    useEffect(() => {
        const timer = setTimeout(() => {
            const trimmed = searchValue.trim();
            if (trimmed) {
                router.push(`/songs?search=${encodeURIComponent(trimmed)}`, { scroll: false });
            } else if (isOnSongsPage) {
                router.push('/songs', { scroll: false });
            }
        }, 250);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue]);

    // Submit search (Enter or history click): save to history + navigate
    const handleSearch = (term?: string) => {
        const trimmed = (term ?? searchValue).trim();
        if (trimmed) {
            addToHistory(trimmed);
            router.push(`/songs?search=${encodeURIComponent(trimmed)}`);
        } else if (isOnSongsPage) {
            router.push('/songs');
        }
        setHistoryOpen(false);
    };

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
    };

    // Keyboard shortcut: "/" to focus search
    useEffect(() => {
        const handleGlobalKey = (e: KeyboardEvent) => {
            if (e.key === '/' && !e.metaKey && !e.ctrlKey &&
                !(e.target instanceof HTMLInputElement) &&
                !(e.target instanceof HTMLTextAreaElement)) {
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
            className="h-[var(--navbar-height)] w-full text-sm sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md"
        >
            <div className="grid h-full grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_auto] lg:grid-cols-[16rem_1fr_auto] items-center border-b border-gray-200/60 dark:border-gray-800/60">
                {/* Left: Menu button + Logo */}
                <div className="flex items-center gap-1.5 mx-4">
                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 -ms-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group/logo shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-orange-600 rounded-full flex items-center justify-center shadow-md ring-1 ring-black/10 dark:ring-white/10 group-hover/logo:scale-105 transition-transform">
                            <Flame className="text-white w-4.5 h-4.5 fill-current" />
                        </div>
                        <span className="hidden lg:block font-bold text-base text-gray-900 dark:text-white tracking-tight group-hover/logo:text-red-600 dark:group-hover/logo:text-red-400 transition-colors">
                            {getSiteTitle()}
                        </span>
                    </Link>
                </div>

                {/* Center: Search bar (hidden on xs, visible sm+) */}
                <div className="hidden sm:flex items-center px-2 lg:px-4">
                    <div ref={searchWrapperRef} className="relative w-full max-w-3xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors pointer-events-none z-10" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setHistoryOpen(true)}
                            placeholder="Search 200+ songs"
                            className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full py-2.5 pl-10 pr-12 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/40 transition-all relative z-10"
                        />
                        <button
                            onClick={() => setSearchFiltersOpen(!searchFiltersOpen)}
                            className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors z-10 ${
                                hasActiveSearchFilters
                                    ? 'text-red-500 bg-red-100 dark:bg-red-500/15'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                            }`}
                            aria-label="Search options"
                            title="Show search options"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            {hasActiveSearchFilters && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-1.5 ring-gray-100 dark:ring-gray-900" />
                            )}
                        </button>

                        {/* Recent searches dropdown */}
                        {historyOpen && searchHistory.length > 0 && !searchValue && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden">
                                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Recent searches</span>
                                    <button
                                        onClick={clearHistory}
                                        className="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>
                                <div className="pb-1">
                                    {searchHistory.map((term) => (
                                        <div
                                            key={term}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors cursor-pointer group/item"
                                            onClick={() => {
                                                setSearchValue(term);
                                                handleSearch(term);
                                            }}
                                        >
                                            <Search className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{term}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromHistory(term);
                                                }}
                                                className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shrink-0"
                                                aria-label={`Remove "${term}" from history`}
                                                title="Remove"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Action buttons */}
                <div className="flex items-center gap-1 md:gap-2 pe-4 lg:pe-6">
                    {/* Mobile: search icon opens search filters modal */}
                    <button
                        onClick={() => setSearchFiltersOpen(true)}
                        className="sm:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        aria-label="Search"
                    >
                        <Search className="w-5 h-5" />
                    </button>

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
                                <span>Create</span>
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
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Add Song</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCreateMenuOpen(false);
                                                router.push('/library/playlists/add');
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                                        >
                                            <ListMusic className="w-4.5 h-4.5 text-purple-400" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">New Playlist</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Theme toggle */}
                    <ThemeToggle />

                    {/* User avatar / Account panel */}
                    <AccountInfoPanel />
                </div>
            </div>
        </nav>
    );
}
