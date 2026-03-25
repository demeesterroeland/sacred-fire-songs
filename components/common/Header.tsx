'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Flame, Menu, PlusCircle, Search, SlidersHorizontal } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { getSiteTitle } from '@/lib/env';
import { ThemeToggle } from './navigation/ThemeToggle';
import { AccountInfoPanel } from './navigation/AccountInfoPanel';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setIsOpen: setSidebarOpen, searchFiltersOpen, setSearchFiltersOpen } = useSidebar();
    const { user } = useAuth();
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize from URL when on /songs page
    const isOnSongsPage = pathname === '/songs';
    const [searchValue, setSearchValue] = useState(
        isOnSongsPage ? (searchParams.get('search') || '') : ''
    );

    // Sync search value when navigating to /songs with a search param
    useEffect(() => {
        if (isOnSongsPage) {
            setSearchValue(searchParams.get('search') || '');
        }
    }, [isOnSongsPage, searchParams]);

    // Submit search: navigate to /songs?search=...
    const handleSearch = () => {
        const trimmed = searchValue.trim();
        if (trimmed) {
            router.push(`/songs?search=${encodeURIComponent(trimmed)}`);
        } else if (isOnSongsPage) {
            router.push('/songs');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
            inputRef.current?.blur();
        }
        if (e.key === 'Escape') {
            setSearchValue('');
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
            <div className="grid h-full grid-cols-[auto_auto] sm:grid-cols-[auto_1fr_auto] lg:grid-cols-[16rem_1fr_auto] items-center border-b border-gray-200/60 dark:border-gray-800/60">
                {/* Left: Menu button + Logo */}
                <div className="flex items-center gap-2 mx-4">
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
                    <div className="relative w-full max-w-3xl group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors pointer-events-none" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search your songs"
                            className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full py-2 pl-9 pr-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/40 transition-all"
                        />
                        <button
                            onClick={() => {
                                if (!isOnSongsPage) {
                                    router.push('/songs');
                                }
                                setSearchFiltersOpen(!searchFiltersOpen);
                            }}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                                searchFiltersOpen
                                    ? 'text-red-500 bg-red-50 dark:bg-red-950/40'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                            }`}
                            aria-label="Search options"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right: Action buttons */}
                <div className="flex items-center gap-1 md:gap-2 pe-4 lg:pe-6">
                    {/* Mobile: search icon that focuses the search bar */}
                    <button
                        onClick={() => inputRef.current?.focus()}
                        className="sm:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        aria-label="Search"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Create button - desktop only */}
                    {user && !pathname?.includes('/songs/add') && (
                        <Link
                            href={`/songs/add?next=${encodeURIComponent(pathname || '/')}`}
                            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>Create</span>
                        </Link>
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
