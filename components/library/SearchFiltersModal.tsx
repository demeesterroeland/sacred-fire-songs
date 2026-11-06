'use client';

import { useEffect, useState } from 'react';
import { X, SlidersHorizontal, Guitar, Music, Heart, ChevronDown, Search, Mic, Check } from 'lucide-react';
import { Segmented } from '@/components/ui/segmented';
import TagSelector from '@/components/library/TagSelector';
import type { TaxonomyNode } from '@/lib/taxonomyUtils';
import type { SongFilterState } from '@/lib/songs/filterConfig';
import { useLocale } from '@/context/LocaleContext';

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
    recordingsCount?: number;
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
    recordingsCount,
    hasActiveFilters,
    isAuthenticated,
    localSearch,
    setLocalSearch,
}: SearchFiltersModalProps) {
    const { t } = useLocale();
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
            className={`fixed inset-0 z-50 flex items-start justify-center transition-all duration-200 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-scrim transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative z-10 mx-4 mt-16 flex max-h-[calc(100vh-8rem)] w-full max-w-lg transform flex-col rounded-panel border border-line bg-surface shadow-sheet transition-all duration-200 motion-reduce:transition-none md:mt-24 ${isOpen ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95'}`}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal aria-hidden className="size-5 text-fg-muted" />
                        <h2 className="text-title font-bold text-fg">{t('search.title')}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label={t('common.close')}
                        className="inline-flex size-tap items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                    >
                        <X aria-hidden className="size-5" />
                    </button>
                </div>

                {/* Action Panel (Clear All / Show Results) */}
                <div className="flex shrink-0 items-center gap-3 border-b border-line px-6 py-4">
                    <button
                        onClick={handleClearAll}
                        disabled={!hasActiveFilters && !localSearch}
                        className="min-h-tap flex-1 rounded-control border border-line-strong bg-transparent px-4 text-meta font-semibold text-fg transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {t('search.clearAll')}
                    </button>
                    <button
                        onClick={onSubmit ?? onClose}
                        className="min-h-tap flex-1 rounded-control bg-accent px-4 text-meta font-semibold text-on-accent transition-colors hover:bg-accent/90"
                    >
                        {t('search.showResults')}
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* Search text */}
                    <section>
                        <label className="text-meta font-semibold text-fg-muted mb-2 block">
                            {t('search.label')}
                        </label>
                        <div className="relative">
                            <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
                            <input
                                type="text"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') onSubmit?.(); }}
                                placeholder={t('search.placeholder', { count: 200 })}
                                className="min-h-tap w-full rounded-control border border-line-strong bg-surface py-2.5 pl-10 pr-4 text-body text-fg placeholder:text-fg-subtle"
                            />
                        </div>
                    </section>

                    {/* Tags */}
                    <section>
                        <label className="text-meta font-semibold text-fg-muted mb-2 block">
                            {t('search.categoryAndTags')}
                        </label>
                        <TagSelector
                            category={state.category}
                            tags={state.tags || []}
                            artist={state.artist}
                            taxonomy={taxonomy}
                            onCategoryChange={(cat) => setFilter('category', cat)}
                            onTagsChange={(tags) => setFilter('tags', tags)}
                            onArtistChange={(art) => setFilter('artist', art)}
                            onClearAll={() => {
                                setFilter('category', undefined);
                                setFilter('tags', []);
                                setFilter('artist', undefined);
                            }}
                            clearLabel={t('search.clearTags')}
                        />
                    </section>

                    {/* Sort */}
                    <section>
                        <label className="text-meta font-semibold text-fg-muted mb-2 block">
                            {t('search.sortBy')}
                        </label>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortByType)}
                                className="min-h-tap w-full cursor-pointer appearance-none rounded-control border border-line-strong bg-surface px-4 py-2.5 pr-10 text-body font-medium text-fg"
                            >
                                <option value="title">{t('search.sort.titleAZ')}</option>
                                <option value="author">{t('search.sort.authorAZ')}</option>
                                <option value="newest">{t('search.sort.newestFirst')}</option>
                            </select>
                            <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
                        </div>
                    </section>

                    {/* Content type */}
                    <section>
                        <label className="text-meta font-semibold text-fg-muted mb-3 block">
                            {t('search.contentType')}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <ToggleCard
                                active={!!state.chords}
                                onClick={() => setFilter('chords', !state.chords)}
                                disabled={!state.chords && chordsCount === 0}
                                icon={<Guitar aria-hidden className="size-4" />}
                                label={t('search.filter.chords')}
                                count={chordsCount ? chordsCount : undefined}
                            />
                            <ToggleCard
                                active={!!state.melody}
                                onClick={() => setFilter('melody', !state.melody)}
                                disabled={!state.melody && melodyCount === 0}
                                icon={<Music aria-hidden className="size-4" />}
                                label={t('search.filter.melody')}
                                count={melodyCount ? melodyCount : undefined}
                            />
                        </div>
                    </section>

                    {/* Personalized Options */}
                    {isAuthenticated && (
                        <section className="border-t border-line pt-4">
                            <label className="text-meta font-semibold text-fg-muted mb-3 block">
                                {t('search.yourLibrary')}
                            </label>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <ToggleCard
                                    active={!!state.favorites}
                                    onClick={() => setFilter('favorites', !state.favorites)}
                                    icon={<Heart aria-hidden className={`size-4 ${state.favorites ? 'fill-current' : ''}`} strokeWidth={1.5} />}
                                    label={t('userMenu.favorites')}
                                    count={favoritesCount ? favoritesCount : undefined}
                                />
                                <ToggleCard
                                    active={!!state.mine}
                                    onClick={() => setFilter('mine', !state.mine)}
                                    icon={<Music aria-hidden className="size-4" strokeWidth={1.5} />}
                                    label={t('librarySummary.mySongs.title')}
                                    count={mineCount ? mineCount : undefined}
                                />
                                <ToggleCard
                                    active={!!state.myRecordings}
                                    onClick={() => setFilter('myRecordings', !state.myRecordings)}
                                    disabled={!state.myRecordings && recordingsCount === 0}
                                    icon={<Mic aria-hidden className="size-4" strokeWidth={1.5} />}
                                    label={t('search.filter.recordings')}
                                    count={recordingsCount ? recordingsCount : undefined}
                                />
                                <Segmented
                                    aria-label={t('search.status.heading')}
                                    value={state.status ?? 'all'}
                                    onChange={(v) => setFilter('status', v as SongFilterState['status'])}
                                    options={[
                                        { value: 'all', label: t('search.status.all') },
                                        { value: 'public', label: t('search.status.public') },
                                        { value: 'draft', label: t('search.status.draft') },
                                    ]}
                                />
                            </div>
                        </section>
                    )}

                </div>


            </div>
        </div>
    );
}

/* Toggle card for filter options: neutral like a Chip (selected = inverted + check + aria-pressed). */
function ToggleCard({
    active,
    onClick,
    disabled,
    icon,
    label,
    count,
}: {
    active: boolean;
    onClick: () => void;
    disabled?: boolean;
    icon: React.ReactNode;
    label: string;
    count?: number;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-pressed={active}
            className={`flex min-h-tap min-w-0 items-center gap-3 rounded-control px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${active
                ? 'bg-chip-active text-on-chip-active'
                : 'bg-chip text-on-chip hover:bg-surface'
                }`}
        >
            <span className="shrink-0">{icon}</span>
            <span className="min-w-0 flex-1 truncate text-meta font-semibold leading-tight">{label}</span>
            {count !== undefined && <span className="ml-auto shrink-0 text-caption font-semibold tabular-nums opacity-80">{count}</span>}
            {active && <Check data-testid="toggle-check" aria-hidden className="size-4 shrink-0" />}
        </button>
    );
}
