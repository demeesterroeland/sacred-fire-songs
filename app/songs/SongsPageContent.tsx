'use client';

import SearchBar from "@/components/home/SearchBar";
import SongCard from "@/components/home/SongCard";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { Music, Guitar, ChevronDown, Flame, Search, X, Plus, Trash2 } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useState, useMemo, useEffect } from "react";
import { fetchSongs } from "@/lib/songUtils";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import Link from 'next/link';
import { getCategoryColor, getCategoryStyles } from "@/lib/uiUtils";
import { useDeclarativeFilter } from "@/hooks/useDeclarativeFilter";
import { songFilterConfig, SongFilterState } from "@/lib/songs/filterConfig";
import TagSelector from "@/components/library/TagSelector";
import { fetchCategoryTree, type TaxonomyNode } from "@/lib/taxonomyUtils";
import type { Song } from "@/lib/songUtils";

type SortByType = 'title' | 'newest';

interface SongsPageContentProps {
    initialSongs: Song[];
    initialTaxonomy: TaxonomyNode[];
}

export default function SongsPageContent({ initialSongs, initialTaxonomy }: SongsPageContentProps) {
    const searchParams = useSearchParams();
    const router = useRouter(); // needed for clear all button which uses router.push
    const { user } = useAuth();
    const { setHeaderCount } = useSidebar();
    const queryClient = useQueryClient();
    const [localSearch, setLocalSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isAdmin = user?.role === 'admin';
    console.log('auth state:', { user: user?.role, isAdmin });

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        const supabase = createClient();
        const { error } = await supabase.from('compositions').delete().eq('id', deleteTarget.id);
        if (error) {
            alert(`Failed to delete: ${error.message}`);
        } else {
            await queryClient.invalidateQueries({ queryKey: ['songs', 'all'] });
        }
        setIsDeleting(false);
        setDeleteTarget(null);
    };


    // Local UI state for sorting (not part of filtering engine usually)
    const sortBy = (searchParams.get('sort') as SortByType) || 'title';
    const setSortBy = (val: SortByType) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', val);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // --- 1. Fetch Data ---
    const { data: songs = [] } = useQuery({
        queryKey: ['songs', 'all'],
        queryFn: () => fetchSongs(),
        initialData: initialSongs,
    });

    const { data: taxonomy = [] } = useQuery({
        queryKey: ['taxonomy'],
        queryFn: fetchCategoryTree,
        initialData: initialTaxonomy,
    });

    // --- 2. Declarative Filter Hook ---
    const { filteredItems, facets, state, setFilter, resetFilters } = useDeclarativeFilter(
        songs,
        songFilterConfig,
        {
            status: user ? 'all' : 'public', // Default state
            search: '',
            category: undefined,
            tags: [],
            chords: false,
            melody: false
        },
        {
            // Custom Parse: Convert URL params to State
            parseUrl: (params) => {
                return {
                    category: params.get('category') || undefined,
                    tags: params.get('tag') ? params.get('tag')!.split(',').filter(Boolean) : [],
                    status: (params.get('status') as any) || (user ? 'all' : 'public'),
                    search: params.get('search') || '',
                    chords: params.get('chords') === 'true',
                    melody: params.get('melody') === 'true',
                };
            },
            // Custom Serialize: Convert State to URL params
            serializeUrl: (state) => {
                return {
                    category: state.category || '',
                    tag: state.tags?.join(',') || '',
                    status: state.status === 'all' ? '' : state.status || '', // 'all' is default, don't show in URL
                    search: state.search || '',
                    chords: state.chords ? 'true' : '',
                    melody: state.melody ? 'true' : '',
                    sort: sortBy // Preserve sort param
                };
            }
        }
    );

    // Sync local search with state.search (for external resets like "Clear All")
    useEffect(() => {
        setLocalSearch(state.search || '');
    }, [state.search]);

    // Debounce URL update
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== state.search) {
                setFilter('search', localSearch);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localSearch, setFilter, state.search]);


    // Publish count to global header for mobile view
    useEffect(() => {
        setHeaderCount(filteredItems.length);
        // Clear on unmount
        return () => setHeaderCount(undefined);
    }, [filteredItems.length, setHeaderCount]);

    // --- 3. Sorting (Applied after filtering) ---
    const displaySongs = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            } else {
                // Newest: latest time at top
                const timeA = new Date(a.createdAt).getTime();
                const timeB = new Date(b.createdAt).getTime();
                return timeB - timeA;
            }
        });
    }, [filteredItems, sortBy]);

    // Derived counts from facets
    // Note: 'facets.chords.get("true")' tells us: "If we toggle Chords=ON, how many songs match?"
    // Since Chords is a boolean filter, the facet count for "true" represents the count of songs 
    // that MATCH everything else AND have chords=true.
    const chordsCount = facets.chords?.get('true') || 0;
    const melodyCount = facets.melody?.get('true') || 0;

    return (
        <main className="flex-1 min-h-0 bg-gray-950">
            <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
                {/* Sticky Header */}
                <div className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur-md border-b border-gray-800/50 px-4 pt-0 pb-6 -mx-4 md:-mx-8">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Row 1: Brand (Mobile) & Search */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                            <SearchBar
                                value={localSearch}
                                onChange={setLocalSearch}
                            />

                            <div className="hidden md:flex items-center gap-4 self-end md:self-auto">
                                <span className="hidden md:block text-xs text-gray-500 whitespace-nowrap">
                                    {filteredItems.length} songs found
                                </span>

                                {user && (
                                    <Link
                                        href="/songs/add"
                                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm transition-all shadow-lg shadow-red-900/40 active:scale-95 whitespace-nowrap"
                                    >
                                        <Plus className="w-4 h-4 text-white" strokeWidth={3} />
                                        Create Song
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Tag Selector */}
                        <TagSelector
                            category={state.category}
                            tags={state.tags || []}
                            taxonomy={taxonomy}
                            onCategoryChange={(cat) => setFilter('category', cat)}
                            onTagsChange={(tags) => setFilter('tags', tags)}
                            onClearAll={resetFilters}
                            searchValue={localSearch}
                            onSearchChange={setLocalSearch}
                        />

                        {/* Lower Row: Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                            <div className="flex flex-wrap items-center gap-6">
                                {/* Sort Dropdown */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sort:</span>
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as SortByType)}
                                            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-300 outline-none focus:border-gray-700 appearance-none pr-8 cursor-pointer"
                                        >
                                            <option value="title">Title (A-Z)</option>
                                            <option value="newest">Newest First</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Visibility Tabs */}
                                {user && (
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
                                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 border border-gray-800">
                                    <Search className="w-8 h-8 text-gray-600" />
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">No songs found</h3>
                                <p className="text-gray-400 max-w-xs mx-auto">
                                    {state.search ? `We couldn't find any songs matching "${state.search}".` : "There are no songs available for this filter."}
                                </p>
                                {(state.search || state.category || state.tags?.length) && (
                                    <button
                                        onClick={resetFilters}
                                        className="mt-6 text-red-500 hover:text-red-400 font-medium transition-colors"
                                    >
                                        Clear search
                                    </button>
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
