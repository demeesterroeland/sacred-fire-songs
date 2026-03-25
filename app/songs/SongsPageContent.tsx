'use client';

import SongCard from "@/components/home/SongCard";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import SearchFiltersModal from "@/components/library/SearchFiltersModal";
import { Search, Trash2, Heart } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useRouter } from 'next/navigation';
import { useDeleteSong } from "@/hooks/useDeleteSong";
import { type TaxonomyNode } from "@/lib/taxonomyUtils";
import type { Song } from "@/lib/songUtils";
import { useSongsQuery } from "@/hooks/useSongsQuery";
import { useFavoritesQuery } from "@/hooks/useFavoritesQuery";
import { useSongsFilter } from "@/hooks/useSongsFilter";

type SortByType = 'title' | 'author' | 'newest';

interface SongsPageContentProps {
    initialSongs: Song[];
    initialTaxonomy: TaxonomyNode[];
    initialViewedSongIds?: string[];
}

export default function SongsPageContent({ initialSongs, initialTaxonomy, initialViewedSongIds = [] }: SongsPageContentProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const { setHeaderCount, searchFiltersOpen, setSearchFiltersOpen, setHasActiveSearchFilters } = useSidebar();
    const { isDeleting, deleteSong } = useDeleteSong();
    const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

    const isAdmin = user?.role === 'admin';
    const sortBy = (searchParams.get('sort') as SortByType) || 'title';

    // --- 1. Use Extracted Hooks ---
    const { songs, taxonomy } = useSongsQuery({ initialSongs, initialTaxonomy });
    
    const { favoriteIds } = useFavoritesQuery(user?.id);
    const viewedSongIds = useMemo(() => new Set(initialViewedSongIds), [initialViewedSongIds]);
    const {
        displaySongs,
        state,
        setFilter,
        resetFilters,
        chordsCount,
        melodyCount,
        favoritesCount,
        mineCount,
        hasActiveFilters,
        filteredCount
    } = useSongsFilter({ songs, userId: user?.id, favoriteIds, viewedSongIds, sortBy });

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

    // Sync localSearch when URL search param changes (e.g. from Header search)
    useEffect(() => {
        const urlSearch = searchParams.get('search') || '';
        if (urlSearch !== localSearch) {
            setLocalSearch(urlSearch);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Publish filter state to global context for Header
    useEffect(() => {
        setHasActiveSearchFilters(hasActiveFilters);
        return () => setHasActiveSearchFilters(false);
    }, [hasActiveFilters, setHasActiveSearchFilters]);

    // Publish count to global header for mobile view
    useEffect(() => {
        setHeaderCount(hasActiveFilters ? filteredCount : songs.length);
        return () => setHeaderCount(undefined);
    }, [filteredCount, songs.length, hasActiveFilters, setHeaderCount]);

    return (
        <main className="flex-1 min-h-0 bg-white dark:bg-gray-950">
            <div className="p-4 md:p-8 space-y-3 md:space-y-6 max-w-7xl mx-auto">
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
                                            className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-300 dark:border-gray-700 text-gray-500 opacity-0 group-hover/card:opacity-100 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-200"
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
                                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Your sacred circle is empty</h3>
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
                                        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                            <Search className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No songs found</h3>
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

            <SearchFiltersModal
                isOpen={searchFiltersOpen}
                onClose={() => setSearchFiltersOpen(false)}
                state={state}
                setFilter={setFilter}
                resetFilters={resetFilters}
                sortBy={sortBy}
                setSortBy={setSortBy}
                taxonomy={taxonomy}
                chordsCount={chordsCount}
                melodyCount={melodyCount}
                favoritesCount={favoritesCount}
                mineCount={mineCount}
                hasActiveFilters={hasActiveFilters}
                isAuthenticated={!!user}
                localSearch={localSearch}
                setLocalSearch={setLocalSearch}
            />

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
