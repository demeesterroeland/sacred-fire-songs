'use client';

import Link from "next/link";
import SongCard from "@/components/home/SongCard";
import { songMatchHintText } from "@/lib/songs/search";
import SearchFiltersModal from "@/components/library/SearchFiltersModal";
import { Search, Heart, FileText } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useRouter } from 'next/navigation';
import { type TaxonomyNode } from "@/lib/taxonomyUtils";
import type { Song } from "@/lib/songUtils";
import { useSongsQuery } from "@/hooks/useSongsQuery";
import { useFavoritesQuery } from "@/hooks/useFavoritesQuery";
import { useRecordingsQuery } from "@/hooks/useRecordingsQuery";
import { useSongsFilter } from "@/hooks/useSongsFilter";
import { isDraftActive } from "@/lib/songs/filterConfig";
import { useLocale } from "@/context/LocaleContext";

type SortByType = 'title' | 'author' | 'newest';

interface SongsPageContentProps {
    initialSongs: Song[];
    initialTaxonomy: TaxonomyNode[];
    initialViewedSongIds?: string[];
}

export default function SongsPageContent({ initialSongs, initialTaxonomy, initialViewedSongIds = [] }: SongsPageContentProps) {
    const { t, locale } = useLocale();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const { setHeaderCount, searchFiltersOpen, setSearchFiltersOpen, setHasActiveSearchFilters, isSearching } = useSidebar();
    const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

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
            status: 'all',
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
            songbook: '',
            language: '',
        });
        setLocalSearch('');
        setDraftSortBy('title');
    };

    // --- 1. Use Extracted Hooks ---
    const { songs, taxonomy } = useSongsQuery({ initialSongs, initialTaxonomy });
    
    const { favoriteIds } = useFavoritesQuery(user?.id);
    const { userRecordingCompositionIds } = useRecordingsQuery(user?.id);
    const viewedSongIds = useMemo(() => new Set(initialViewedSongIds), [initialViewedSongIds]);

    const unknownLabels = useMemo(
        () => ({ unknownSongbook: t('search.songbook.unknown'), unknownLanguage: t('search.language.unknown') }),
        [t]
    );

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
        recordingsCount,
        hasActiveFilters,
        filteredCount,
        browseOptionsFor
    } = useSongsFilter({ songs, taxonomy, userId: user?.id, favoriteIds, userRecordingCompositionIds, viewedSongIds, sortBy, locale, unknownLabels });

    // Songbook and language options of the sheet, counted for everything the sheet shows: the draft and its search text
    // while it is open, the applied state otherwise
    const browseOptions = useMemo(
        () => browseOptionsFor(draft ? { ...draft, search: localSearch } : state),
        [browseOptionsFor, draft, localSearch, state]
    );

    // Why each row matched, worked out once per result list / query / language, not on every render (#521).
    const matchHints = useMemo(() => {
        const hints = new Map<string, string>();
        if (!state.search) return hints;
        for (const song of displaySongs) {
            const text = songMatchHintText(song, state.search, t, locale);
            if (text) hints.set(song.id, text);
        }
        return hints;
    }, [displaySongs, state.search, t, locale]);

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
        ? t('songs.searching')
        : filteredCount === 1
            ? t('songs.resultCount', { count: filteredCount })
            : t('songs.resultsCount', { count: filteredCount });

    return (
        <div className="flex-1 min-h-0 bg-bg">
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
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control text-xs font-semibold transition-colors duration-200 ${
                            isSearching
                                ? 'bg-surface-2 text-fg-muted border border-line'
                                : 'bg-surface-2 text-fg border border-line'
                        }`}>
                            {resultsLabel}
                        </span>
                        {hasActiveFilters && !isSearching && (
                            <button
                                onClick={handleResetFilters}
                                className="text-xs text-fg-muted hover:text-fg transition-colors"
                            >
                                {t('songs.clearFilters')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Song List */}
                <section className="relative">
                    {/* Fade overlay while debounce pending */}
                    <div
                        className={`absolute inset-0 z-10 bg-surface/50 backdrop-blur-[1px] pointer-events-none transition-opacity duration-200 ${
                            isSearching ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                    <div
                        data-testid="song-list"
                        className={`grid grid-cols-1 md:grid-cols-2 md:gap-x-6 border-t border-line transition-opacity duration-200 ${
                            isSearching ? 'opacity-60' : 'opacity-100'
                        }`}
                    >
                        {displaySongs.length > 0 ? (
                            displaySongs.map((song) => (
                                <div key={song.id} className="relative">
                                    <SongCard
                                        id={song.id}
                                        title={song.title}
                                        author={song.author}
                                        songKey={song.songKey}
                                        isPublic={song.isPublic}
                                        isFavorite={favoriteIds.has(song.id)}
                                        userId={user?.id}
                                        categories={song.categories}
                                        matchHint={matchHints.get(song.id) ?? null}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 px-4">
                                {state.favorites ? (
                                    <>
                                        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-panel bg-surface-2 border border-line">
                                            <Heart className="w-8 h-8 text-fg-muted" />
                                        </div>
                                        <h3 className="text-xl font-medium text-fg mb-2">{t('songs.emptyFavorites.title')}</h3>
                                        <p className="text-fg-muted max-w-xs mx-auto">{t('songs.emptyFavorites.hint')}</p>
                                        <Link
                                            href="/songs"
                                            onClick={handleResetFilters}
                                            className="mt-6 inline-block text-accent hover:underline font-medium transition-colors cursor-pointer"
                                        >
                                            {t('songs.emptyFavorites.browse')}
                                        </Link>
                                    </>
                                ) : state.status === 'draft' ? (
                                    <>
                                        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-panel bg-surface-2 border border-line">
                                            <FileText className="w-8 h-8 text-fg-muted" />
                                        </div>
                                        <h3 className="text-xl font-medium text-fg mb-2">{t('songs.emptyDrafts.title')}</h3>
                                        <p className="text-fg-muted max-w-xs mx-auto">{t('songs.emptyDrafts.hint')}</p>
                                        <Link
                                            href="/songs/add"
                                            className="mt-6 inline-block text-accent hover:underline font-medium transition-colors cursor-pointer"
                                        >
                                            {t('songs.emptyDrafts.action')}
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-panel bg-surface-2 border border-line">
                                            <Search className="w-8 h-8 text-fg-muted" />
                                        </div>
                                        <h3 className="text-xl font-medium text-fg mb-2">{t('songs.noResults')}</h3>
                                        <p className="text-fg-muted max-w-xs mx-auto">
                                            {state.search
                                                ? t('songs.noResultsSearch', { search: state.search })
                                                : t('songs.noResultsFilter')}
                                        </p>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={handleResetFilters}
                                                className="mt-6 text-accent hover:underline font-medium transition-colors"
                                            >
                                                {t('songs.clearFilters')}
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
                recordingsCount={recordingsCount}
                browseOptions={browseOptions}
                hasActiveFilters={draft ? isDraftActive({ ...draft, search: localSearch }, user?.id) : hasActiveFilters}
                isAuthenticated={!!user}
                localSearch={localSearch}
                setLocalSearch={setLocalSearch}
            />
        </div>
    );
}
