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
import { useRecordingsQuery } from "@/hooks/useRecordingsQuery";
import { useSongsFilter } from "@/hooks/useSongsFilter";
import { isDraftActive } from "@/lib/songs/filterConfig";

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
    const { setHeaderCount, searchFiltersOpen, setSearchFiltersOpen, setHasActiveSearchFilters, isSearching } = useSidebar();
    const { isDeleting, deleteSong } = useDeleteSong();
    const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

    const isAdmin = user?.role === 'admin';
    const sortBy = (searchParams.get('sort') as SortByType) || 'title';

    // Draft state for the advanced search modal — nothing commits until "Show results"
    const [draft, setDraft] = useState<typeof state | null>(null);
    const [draftSortBy, setDraftSortBy] = useState<SortByType | null>(null);

    // Helper: update a single field in the draft
    const setDraftFilter = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
        setDraft(prev => prev ? { ...prev, [key]: value } : prev);
    };

    // Helper: reset draft to empty/default state
    const resetDraft = () => {
        setDraft({
            status: user?.id ? 'all' : 'public',
            search: '',
            category: undefined,
            tags: [],
            chords: false,
            melody: false,
            myRecordings: false,
            favorites: false,
            mine: false,
            new: false,
            artist: '',
        });
        setLocalSearch('');
        setDraftSortBy('title');
    };

    // --- 1. Use Extracted Hooks ---
    const { songs, taxonomy } = useSongsQuery({ initialSongs, initialTaxonomy });
    
    const { favoriteIds } = useFavoritesQuery(user?.id);
    const { userRecordingCompositionIds } = useRecordingsQuery(user?.id);
    const viewedSongIds = useMemo(() => new Set(initialViewedSongIds), [initialViewedSongIds]);

    const {
        displaySongs,
        state,
        setFilter,
        commitFilters,
        resetFilters,
        chordsCount,
        melodyCount,
        favoritesCount,
        mineCount,
        hasActiveFilters,
        filteredCount
    } = useSongsFilter({ songs, userId: user?.id, favoriteIds, userRecordingCompositionIds, viewedSongIds, sortBy });

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

    // Reset localSearch to active search state when modal opens; init draft
    useEffect(() => {
        if (searchFiltersOpen) {
            // Snapshot committed state → draft when modal opens
            setDraft({ ...state, search: state.search || '' });
            setDraftSortBy(sortBy);
            setLocalSearch(state.search || '');
        } else {
            // Discard draft on close without submit
            setDraft(null);
            setDraftSortBy(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchFiltersOpen]);

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

    // Derive display state for the results area
    const showResultsBadge = hasActiveFilters || !!state.search;
    const resultsLabel = isSearching
        ? 'Searching…'
        : `${filteredCount} result${filteredCount !== 1 ? 's' : ''}`;

    return (
        <main className="flex-1 min-h-0 bg-white dark:bg-gray-950">
            <div className="p-4 md:p-8 space-y-3 md:space-y-6 max-w-7xl mx-auto">
                {/* Results count badge */}
                <div
                    className={`transition-all duration-300 ease-in-out ${
                        showResultsBadge 
                            ? 'opacity-100 h-7 mb-2 translate-y-0' 
                            : 'opacity-0 h-0 mb-0 -translate-y-2 pointer-events-none overflow-hidden'
                    }`}
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                            isSearching
                                ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500'
                                : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                            {resultsLabel}
                        </span>
                        {hasActiveFilters && !isSearching && (
                            <button
                                onClick={handleResetFilters}
                                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Song List */}
                <section className="relative">
                    {/* Fade overlay while debounce pending */}
                    <div
                        className={`absolute inset-0 z-10 bg-white/50 dark:bg-gray-950/50 backdrop-blur-[1px] rounded-xl pointer-events-none transition-opacity duration-200 ${
                            isSearching ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                    <div
                        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-200 ${
                            isSearching ? 'opacity-60' : 'opacity-100'
                        }`}
                    >
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
                                        hasPersonalRecording={userRecordingCompositionIds.has(song.id)}
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
                onClose={() => {
                    setSearchFiltersOpen(false);
                    // draft is cleared by the effect above
                }}
                onSubmit={() => {
                    if (draft) {
                        commitFilters(
                            { ...draft, search: localSearch },
                            { sort: draftSortBy ?? sortBy }
                        );
                    }
                    setSearchFiltersOpen(false);
                }}
                // Pass draft state while modal is open; fall back to committed state otherwise
                state={draft ?? state}
                setFilter={draft ? setDraftFilter : setFilter}
                resetFilters={draft ? resetDraft : resetFilters}
                sortBy={draftSortBy ?? sortBy}
                setSortBy={(val) => setDraftSortBy(val)}
                taxonomy={taxonomy}
                chordsCount={chordsCount}
                melodyCount={melodyCount}
                favoritesCount={favoritesCount}
                mineCount={mineCount}
                hasActiveFilters={draft ? isDraftActive({ ...draft, search: localSearch }, user?.id) : hasActiveFilters}
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
