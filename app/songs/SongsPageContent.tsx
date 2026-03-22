'use client';

import SearchBar from "@/components/home/SearchBar";
import SongCard from "@/components/home/SongCard";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { Music, Guitar, ChevronDown, Search, Plus, Trash2, Heart, SlidersHorizontal } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useRouter } from 'next/navigation';
import { useDeleteSong } from "@/hooks/useDeleteSong";
import Link from 'next/link';
import TagSelector from "@/components/library/TagSelector";
import { type TaxonomyNode } from "@/lib/taxonomyUtils";
import type { Song } from "@/lib/songUtils";
import { useSongsQuery } from "@/hooks/useSongsQuery";
import { useFavoritesQuery } from "@/hooks/useFavoritesQuery";
import { useSongsFilter } from "@/hooks/useSongsFilter";

type SortByType = 'title' | 'author' | 'newest';

interface SongsPageContentProps {
    initialSongs: Song[];
    initialTaxonomy: TaxonomyNode[];
}

export default function SongsPageContent({ initialSongs, initialTaxonomy }: SongsPageContentProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const { setHeaderCount } = useSidebar();
    const { isDeleting, deleteSong } = useDeleteSong();
    const [localSearch, setLocalSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const isAdmin = user?.role === 'admin';
    const sortBy = (searchParams.get('sort') as SortByType) || 'title';

    // --- 1. Use Extracted Hooks ---
    const { songs, taxonomy } = useSongsQuery({ initialSongs, initialTaxonomy });
    
    const { favoriteIds } = useFavoritesQuery(user?.id);
    const {
        displaySongs,
        state,
        setFilter,
        resetFilters,
        chordsCount,
        melodyCount,
        hasActiveFilters,
        filteredCount
    } = useSongsFilter({ songs, userId: user?.id, favoriteIds, sortBy });

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const success = await deleteSong(deleteTarget.id);
        if (success) setDeleteTarget(null);
    };

    const setSortBy = (val: SortByType) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', val);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Debounce URL update - localSearch is the source of truth for input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== state.search) {
                setFilter('search', localSearch);
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [localSearch, setFilter, state.search]);

    // Handle explicit filter reset (from TagSelector's "Clear All")
    const handleResetFilters = () => {
        resetFilters();
        setLocalSearch('');
    };

    // Publish count to global header for mobile view
    useEffect(() => {
        setHeaderCount(hasActiveFilters ? filteredCount : songs.length);
        return () => setHeaderCount(undefined);
    }, [filteredCount, songs.length, hasActiveFilters, setHeaderCount]);

    return (
        <main className="flex-1 min-h-0 bg-gray-950">
            <div className="p-4 md:p-8 space-y-3 md:space-y-6 max-w-7xl mx-auto">
                {/* Sticky Header */}
                <div className="sticky top-[72px] z-20 bg-gray-950/95 backdrop-blur-md border-b border-gray-800/50 px-4 pt-2 pb-0 -mx-4 md:-mx-8 md:pt-2 md:pb-6">
                    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">

                        {/* Row 1: Search + Filter Toggle (Mobile) */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                            <div className="flex items-center gap-2 w-full md:flex-1">
                                <SearchBar
                                    value={localSearch}
                                    onChange={setLocalSearch}
                                />
                                {/* Mobile filter toggle */}
                                <button
                                    onClick={() => setFiltersOpen(!filtersOpen)}
                                    className={`md:hidden flex-shrink-0 relative p-2.5 rounded-xl border transition-all ${filtersOpen
                                        ? 'bg-red-500/10 border-red-500/40 text-red-400'
                                        : 'bg-gray-900/80 border-gray-800 text-gray-500'
                                        }`}
                                    aria-label="Toggle filters"
                                    aria-expanded={filtersOpen}
                                >
                                    <SlidersHorizontal className="w-5 h-5" />
                                    {hasActiveFilters && !filtersOpen && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-gray-950" />
                                    )}
                                </button>
                            </div>

                            <div className="hidden md:flex items-center gap-4 self-end md:self-auto">
                                <span className="hidden md:block text-xs text-gray-500 whitespace-nowrap">
                                    {hasActiveFilters ? filteredCount : songs.length} songs found
                                </span>

                                {user && (
                                    <Link
                                        href="/songs/add?next=/songs"
                                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm transition-all shadow-lg shadow-red-900/40 active:scale-95 whitespace-nowrap"
                                    >
                                        <Plus className="w-4 h-4 text-white" strokeWidth={3} />
                                        Create Song
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Collapsible filters: hidden on mobile unless toggled */}
                        <div className={`space-y-3 md:space-y-6 ${filtersOpen ? '' : 'hidden'} md:block`}>
                            {/* Row 2: Tag Selector */}
                            <TagSelector
                                category={state.category}
                                tags={state.tags || []}
                                taxonomy={taxonomy}
                                onCategoryChange={(cat) => setFilter('category', cat)}
                                onTagsChange={(tags) => setFilter('tags', tags)}
                                onClearAll={handleResetFilters}
                                searchValue={localSearch}
                                onSearchChange={setLocalSearch}
                                hasActiveFilters={hasActiveFilters}
                            />

                            {/* Lower Row: Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-1 md:pt-2">
                                <div className="flex flex-wrap items-center gap-6">
                                    {/* Sort Dropdown */}
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value as SortByType)}
                                                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 outline-none focus:border-gray-700 appearance-none pr-8 cursor-pointer"
                                            >
                                                <option value="title">Title (A-Z)</option>
                                                <option value="author">Author (A-Z)</option>
                                                <option value="newest">Newest First</option>
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Visibility Tabs */}
                                    {user && (
                                        <div className="flex items-center gap-2">
                                            <div className="bg-gray-900/80 p-1 rounded-xl border border-gray-800 inline-flex shadow-inner">
                                                {(['all', 'public', 'draft'] as const).map((statusOption) => (
                                                    <button
                                                        key={statusOption}
                                                        onClick={() => setFilter('status', statusOption)}
                                                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${state.status === statusOption ? 'bg-gray-800 text-white shadow-sm ring-1 ring-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                                                    >
                                                        {statusOption}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setFilter('favorites', !state.favorites)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${state.favorites
                                                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-sm'
                                                    : 'bg-gray-900/80 border-gray-800 text-gray-500 hover:text-amber-400/70 hover:border-amber-500/30'
                                                    }`}
                                            >
                                                <Heart className={`w-3 h-3 ${state.favorites ? 'fill-amber-400' : ''}`} strokeWidth={1.5} />
                                                Favorites
                                            </button>
                                            <button
                                                onClick={() => setFilter('mine', !state.mine)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${state.mine
                                                    ? 'bg-violet-500/15 border-violet-500/40 text-violet-400 shadow-sm'
                                                    : 'bg-gray-900/80 border-gray-800 text-gray-500 hover:text-violet-400/70 hover:border-violet-500/30'
                                                    }`}
                                            >
                                                <Music className="w-3 h-3" strokeWidth={1.5} />
                                                My Songs
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* View Toggles */}
                                    <div className="flex items-center gap-2">
                                        {/* Chords Toggle */}
                                        <button
                                            onClick={() => setFilter('chords', !state.chords)}
                                            disabled={!state.chords && chordsCount === 0}
                                            className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border ${state.chords
                                                ? 'border-amber-500/50 bg-amber-500/10 text-amber-500 shadow-sm shadow-amber-900/20'
                                                : 'border-gray-800 bg-gray-900/50 text-gray-500 hover:text-gray-300 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                                }`}
                                        >
                                            <Guitar className="w-3.5 h-3.5" />
                                            Chords
                                            {/* Count Badge */}
                                            {!state.chords && chordsCount > 0 && (
                                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400 text-[9px]">{chordsCount}</span>
                                            )}
                                        </button>

                                        {/* Melody Toggle */}
                                        <button
                                            onClick={() => setFilter('melody', !state.melody)}
                                            disabled={!state.melody && melodyCount === 0}
                                            className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border ${state.melody
                                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500 shadow-sm shadow-emerald-900/20'
                                                : 'border-gray-800 bg-gray-900/50 text-gray-500 hover:text-gray-300 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                                }`}
                                        >
                                            <Music className="w-3.5 h-3.5" />
                                            Melody
                                            {/* Count Badge */}
                                            {!state.melody && melodyCount > 0 && (
                                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400 text-[9px]">{melodyCount}</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>{/* end collapsible filters */}
                    </div>
                </div>

                {/* Song List */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displaySongs.length > 0 ? (
                            displaySongs.map((song) => (
                                <div key={song.id} className="relative group/card">
                                    <SongCard
                                        id={song.id}
                                        title={song.title}
                                        author={song.author}
                                        songKey={song.songKey}
                                        accentColor={song.color}
                                        isPublic={song.isPublic}
                                        hasChords={song.hasChords}
                                        hasMelody={song.hasMelody}
                                        isFavorite={favoriteIds.has(song.id)}
                                        userId={user?.id}
                                        categories={song.categories}
                                    />
                                    {user && (isAdmin || song.ownerId === user.id) && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setDeleteTarget({ id: song.id, title: song.title });
                                            }}
                                            className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-gray-900/80 border border-gray-700 text-gray-500 opacity-0 group-hover/card:opacity-100 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-200"
                                            title="Delete song"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 px-4">
                                {state.favorites ? (
                                    <>
                                        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20">
                                            <Heart className="w-8 h-8 text-amber-400/50" />
                                        </div>
                                        <h3 className="text-xl font-medium text-white mb-2">Your sacred circle is empty</h3>
                                        <p className="text-gray-400 max-w-xs mx-auto">Tap ♥ on any song to add it here</p>
                                        <button
                                            onClick={() => setFilter('status', 'all')}
                                            className="mt-6 text-amber-400 hover:text-amber-300 font-medium transition-colors"
                                        >
                                            Browse all songs →
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 border border-gray-800">
                                            <Search className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <h3 className="text-xl font-medium text-white mb-2">No songs found</h3>
                                        <p className="text-gray-400 max-w-xs mx-auto">
                                            {state.search ? `We couldn't find any songs matching "${state.search}".` : "There are no songs available for this filter."}
                                        </p>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={handleResetFilters}
                                                className="mt-6 text-red-500 hover:text-red-400 font-medium transition-colors"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    
                </section>
            </div>

            <DeleteConfirmationModal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Song?"
                message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
                isDeleting={isDeleting}
            />
        </main>
    );
}
