'use client';

import { useEffect, useState } from 'react';
import { X, SlidersHorizontal, Guitar, Music, Heart, ChevronDown, Search } from 'lucide-react';
import TagSelector from '@/components/library/TagSelector';
import type { TaxonomyNode } from '@/lib/taxonomyUtils';
import type { SongFilterState } from '@/lib/songs/filterConfig';

type SortByType = 'title' | 'author' | 'newest';

interface SearchFiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: () => void;
    state: SongFilterState;
    setFilter: <K extends keyof SongFilterState>(key: K, value: SongFilterState[K]) => void;
    resetFilters: () => void;
    sortBy: SortByType;
    setSortBy: (val: SortByType) => void;
    taxonomy: TaxonomyNode[];
    chordsCount?: number;
    melodyCount?: number;
    favoritesCount?: number;
    mineCount?: number;
    hasActiveFilters: boolean;
    isAuthenticated: boolean;
    localSearch: string;
    setLocalSearch: (val: string) => void;
}

export default function SearchFiltersModal({
    isOpen,
    onClose,
    onSubmit,
    state,
    setFilter,
    resetFilters,
    sortBy,
    setSortBy,
    taxonomy,
    chordsCount,
    melodyCount,
    favoritesCount,
    mineCount,
    hasActiveFilters,
    isAuthenticated,
    localSearch,
    setLocalSearch,
}: SearchFiltersModalProps) {
    const [render, setRender] = useState(false);

    if (isOpen && !render) {
        setRender(true);
    }

    const onTransitionEnd = () => {
        if (!isOpen) setRender(false);
    };

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleClearAll = () => {
        resetFilters();
        setLocalSearch('');
    };

    if (!render) return null;

    return (
        <div
            onTransitionEnd={onTransitionEnd}
            className={`fixed inset-0 z-50 flex items-start justify-center transition-all duration-200 ${isOpen ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none pointer-events-none'}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative z-10 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 mt-16 md:mt-24 max-h-[calc(100vh-8rem)] flex flex-col transform transition-all duration-200 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 -translate-y-4'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal className="w-5 h-5 text-gray-500" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Search options</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* Search text */}
                    <section>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                placeholder="Search 200+ songs..."
                                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/40 transition-all"
                            />
                        </div>
                    </section>

                    {/* Tags */}
                    <section>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
                            Category & Tags
                        </label>
                        <TagSelector
                            category={state.category}
                            tags={state.tags || []}
                            taxonomy={taxonomy}
                            onCategoryChange={(cat) => setFilter('category', cat)}
                            onTagsChange={(tags) => setFilter('tags', tags)}
                            onClearAll={() => {
                                setFilter('category', undefined);
                                setFilter('tags', []);
                            }}
                            clearLabel="Clear Tags"
                        />
                    </section>

                    {/* Sort */}
                    <section>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
                            Sort by
                        </label>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortByType)}
                                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none focus:border-gray-400 dark:focus:border-gray-700 appearance-none pr-10 cursor-pointer"
                            >
                                <option value="title">Title (A-Z)</option>
                                <option value="author">Author (A-Z)</option>
                                <option value="newest">Newest First</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </section>

                    {/* Visibility */}
                    {isAuthenticated && (
                        <section>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
                                Visibility
                            </label>
                            <div className="bg-gray-200/80 dark:bg-gray-900/80 p-1 rounded-xl border border-gray-300 dark:border-gray-800 inline-flex shadow-inner">
                                {(['all', 'public', 'draft'] as const).map((statusOption) => (
                                    <button
                                        key={statusOption}
                                        onClick={() => setFilter('status', statusOption)}
                                        className={`px-5 py-2 text-xs font-bold rounded-lg transition-all capitalize ${state.status === statusOption
                                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-white/5'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {statusOption}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Display options */}
                    {isAuthenticated && (
                        <section>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 block">
                                Display options
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <ToggleCard
                                    active={!!state.favorites}
                                    onClick={() => setFilter('favorites', !state.favorites)}
                                    icon={<Heart className={`w-4 h-4 ${state.favorites ? 'fill-amber-400' : ''}`} strokeWidth={1.5} />}
                                    label="Favorites"
                                    count={favoritesCount ? favoritesCount : undefined}
                                    activeColor="amber"
                                />
                                <ToggleCard
                                    active={!!state.mine}
                                    onClick={() => setFilter('mine', !state.mine)}
                                    icon={<Music className="w-4 h-4" strokeWidth={1.5} />}
                                    label="My Songs"
                                    count={mineCount ? mineCount : undefined}
                                    activeColor="violet"
                                />
                            </div>
                        </section>
                    )}

                    {/* Content type */}
                    <section>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 block">
                            Content type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <ToggleCard
                                active={!!state.chords}
                                onClick={() => setFilter('chords', !state.chords)}
                                disabled={!state.chords && chordsCount === 0}
                                icon={<Guitar className="w-4 h-4" />}
                                label="Chords"
                                count={chordsCount ? chordsCount : undefined}
                                activeColor="amber"
                            />
                            <ToggleCard
                                active={!!state.melody}
                                onClick={() => setFilter('melody', !state.melody)}
                                disabled={!state.melody && melodyCount === 0}
                                icon={<Music className="w-4 h-4" />}
                                label="Melody"
                                count={melodyCount ? melodyCount : undefined}
                                activeColor="emerald"
                            />
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
                    <button
                        onClick={handleClearAll}
                        disabled={!hasActiveFilters && !localSearch}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Clear all
                    </button>
                    <button
                        onClick={onSubmit ?? onClose}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all"
                    >
                        Show results
                    </button>
                </div>
            </div>
        </div>
    );
}

/* Toggle card for filter options */
function ToggleCard({
    active,
    onClick,
    disabled,
    icon,
    label,
    count,
    activeColor,
}: {
    active: boolean;
    onClick: () => void;
    disabled?: boolean;
    icon: React.ReactNode;
    label: string;
    count?: number;
    activeColor: 'amber' | 'violet' | 'emerald';
}) {
    const colorMap = {
        amber: {
            active: 'bg-amber-500/10 border-amber-500/40 text-amber-500',
            icon: 'text-amber-400',
        },
        violet: {
            active: 'bg-violet-500/10 border-violet-500/40 text-violet-400',
            icon: 'text-violet-400',
        },
        emerald: {
            active: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500',
            icon: 'text-emerald-400',
        },
    };

    const colors = colorMap[activeColor];

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${active
                ? `${colors.active} shadow-sm`
                : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
            <span className={active ? colors.icon : ''}>{icon}</span>
            <span className="text-sm font-semibold">{label}</span>
            {count !== undefined && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-500 text-[10px] font-bold">
                    {count}
                </span>
            )}
        </button>
    );
}
