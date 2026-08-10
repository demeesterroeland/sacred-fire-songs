'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { fetchCategoryTree } from '@/lib/taxonomyUtils';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import SearchFiltersModal from '@/components/library/SearchFiltersModal';
import type { SongFilterState } from '@/lib/songs/filterConfig';
import { useRecordingsQuery } from '@/hooks/useRecordingsQuery';

type SortByType = 'title' | 'author' | 'newest';

/**
 * Global search modal rendered in the layout for non-/songs pages.
 * Manages local filter state and navigates to /songs with query params on submit.
 * On /songs, the page's own SearchFiltersModal takes over.
 */
export default function GlobalSearchModal() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const { searchFiltersOpen, setSearchFiltersOpen } = useSidebar();

    // Don't render on /songs — that page has its own modal with live filtering
    const isOnSongsPage = pathname === '/songs';
    if (isOnSongsPage) return null;

    return (
        <GlobalSearchModalInner
            isOpen={searchFiltersOpen}
            onClose={() => setSearchFiltersOpen(false)}
            isAuthenticated={!!user}
            router={router}
            userId={user?.id}
        />
    );
}

function GlobalSearchModalInner({
    isOpen,
    onClose,
    isAuthenticated,
    router,
    userId,
}: {
    isOpen: boolean;
    onClose: () => void;
    isAuthenticated: boolean;
    router: ReturnType<typeof useRouter>;
    userId?: string;
}) {
    // Fetch taxonomy client-side (cached by React Query)
    const { data: taxonomy = [] } = useQuery({
        queryKey: SONG_KEYS.taxonomy(),
        queryFn: fetchCategoryTree,
        staleTime: 5 * 60_000,
        enabled: isOpen, // only fetch when modal is open
    });

    // Personal recordings count — lightweight query, just the composition IDs
    const { userRecordingCompositionIds } = useRecordingsQuery(userId);
    const recordingsCount = userRecordingCompositionIds.size || undefined;

    // Local filter state (not URL-synced)
    const [localSearch, setLocalSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortByType>('title');
    const [state, setState] = useState<SongFilterState>({
        status: userId ? 'all' : 'public',
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

    const setFilter = useCallback(<K extends keyof SongFilterState>(key: K, value: SongFilterState[K]) => {
        setState(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setState({
            status: userId ? 'all' : 'public',
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
    }, [userId]);

    const hasActiveFilters = !!(
        state.category ||
        (state.tags?.length ?? 0) > 0 ||
        state.chords ||
        state.melody ||
        state.myRecordings ||
        state.favorites ||
        state.mine ||
        state.new ||
        (userId && state.status !== 'all')
    );

    // "Show results" → build URL and navigate to /songs
    const handleSubmit = useCallback(() => {
        const params = new URLSearchParams();
        if (localSearch.trim()) params.set('search', localSearch.trim());
        if (state.category) params.set('category', state.category);
        if (state.tags?.length) params.set('tag', state.tags.join(','));
        if (state.status !== 'all' && state.status !== (userId ? 'all' : 'public')) {
            params.set('status', state.status);
        }
        if (state.chords) params.set('chords', 'true');
        if (state.melody) params.set('melody', 'true');
        if (state.myRecordings) params.set('myRecordings', 'true');
        if (state.favorites) params.set('favorites', 'true');
        if (state.mine) params.set('mine', 'true');
        if (state.new) params.set('new', 'true');
        if (sortBy !== 'title') params.set('sort', sortBy);

        const qs = params.toString();
        router.push(qs ? `/songs?${qs}` : '/songs');
        onClose();
    }, [localSearch, state, sortBy, userId, router, onClose]);

    return (
        <SearchFiltersModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            state={state}
            setFilter={setFilter}
            resetFilters={resetFilters}
            sortBy={sortBy}
            setSortBy={setSortBy}
            taxonomy={taxonomy}
            chordsCount={undefined}
            melodyCount={undefined}
            favoritesCount={undefined}
            mineCount={undefined}
            recordingsCount={recordingsCount}
            hasActiveFilters={hasActiveFilters}
            isAuthenticated={isAuthenticated}
            localSearch={localSearch}
            setLocalSearch={setLocalSearch}
        />
    );
}
