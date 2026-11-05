'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SongDisplay from '@/components/song/SongDisplay';
import SongDetailSkeleton from '@/components/song/SongDetailSkeleton';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Edit2, Music, Heart, MoreVertical, ListPlus, Mic, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import GuestGateSheet from '@/components/common/GuestGateSheet';
import RehearsalDrawer from '@/components/song/RehearsalDrawer';
import { makeSongPublic } from '@/lib/actions/rehearsal';
import { useToggleFavorite } from '@/hooks/useToggleFavorite';
import { PlaylistPicker } from '@/components/playlists/PlaylistPicker';
import { useDeleteSong } from '@/hooks/useDeleteSong';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { SongActionBar } from '@/components/song/SongActionBar';
import { useActionBarVisibility } from '@/hooks/useActionBarVisibility';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { practiceTab } from '@/lib/song/actionBar';
import { SongMetaLines } from '@/components/song/SongMetaLines';
import { ReaderToolbar } from '@/components/song/ReaderToolbar';
import { ReadingToolsSheet } from '@/components/song/ReadingToolsSheet';
import { useReaderPrefs } from '@/lib/reader/useReaderPrefs';
import { speedBy } from '@/lib/reader/autoScroll';
import { canTranspose, shiftSemitones, transposeChordPro, transposeKey } from '@/lib/reader/transpose';
import { cn } from '@/lib/utils';
import { recordSongView } from '@/app/actions/recordSongView';
import { useSongRecordings } from '@/hooks/useSongRecordings';
import { useRecordingsQuery } from '@/hooks/useRecordingsQuery';
import { useLocale } from '@/context/LocaleContext';
import { fetchSong, withTimeout } from '@/lib/songs/fetchSong';
import { parseRecordingParam, RECORDING_PARAM } from '@/lib/songs/recordingLink';

export default function SongDetailPage() {
    const { t } = useLocale();
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : params.id?.[0]; // Safe type handling

    const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
    const [readerPrefs, setReaderPrefs] = useReaderPrefs();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isOverflowOpen, setIsOverflowOpen] = useState(false);
    const [isRehearsalDrawerOpen, setIsRehearsalDrawerOpen] = useState(false);
    const [isGuestGateOpen, setIsGuestGateOpen] = useState(false);
    const [drawerRequestedTab, setDrawerRequestedTab] = useState<"media" | "recorder" | "auto">("auto");
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [highlightRecordingId, setHighlightRecordingId] = useState<string | null>(null);
    const linkedRecordingId = parseRecordingParam(useSearchParams().get(RECORDING_PARAM));
    const handledRecordingLink = useRef<string | null>(null);
    const { isDeleting, deleteSong } = useDeleteSong();

    const { user, loading: authLoading } = useAuth();
    const isAdmin = user?.role === 'admin';
    const queryClient = useQueryClient();

    // Enable Screen Wake Lock on Song Detail Page; `awake` feeds the reader's stay-awake indicator (Story 6.1.10, #394).
    const { isActive: awake } = useWakeLock();

    // Story 6.1.10 / G2.5 (#394): auto-scroll and transpose live in the reader toolbar.
    const toolbarWrapRef = useRef<HTMLDivElement>(null);
    const lyricsRef = useRef<HTMLDivElement>(null);
    const toolsButtonRef = useRef<HTMLButtonElement>(null);
    const autoScroll = useAutoScroll(readerPrefs.speed, toolbarWrapRef, lyricsRef);
    // On desktop the page header sticks at the top of the scrolling area; the sticky toolbar sits right under it.
    const [desktopHeader, setDesktopHeader] = useState<HTMLDivElement | null>(null);
    const [desktopHeaderH, setDesktopHeaderH] = useState(0);
    useEffect(() => {
        if (!desktopHeader || typeof ResizeObserver === 'undefined') return;
        const measure = () => setDesktopHeaderH(desktopHeader.offsetHeight);
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(desktopHeader);
        return () => ro.disconnect();
    }, [desktopHeader]);
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [transposeState, setTransposeState] = useState<{ id: string | undefined; n: number }>({ id, n: 0 });
    // The shift belongs to the song it was set on; opening another song starts in its own key.
    const semitones = transposeState.id === id ? transposeState.n : 0;

    // Record song view for "Recently Viewed" feature
    useEffect(() => {
        if (id && user) {
            recordSongView(id);
        }
    }, [id, user]);

    // The Query Hook
    const { data: song, isLoading: songLoading, error: songError } = useQuery({
        queryKey: SONG_KEYS.detail(id!),
        queryFn: () => fetchSong(id!),
        enabled: !!id,
    });

    // Log song fetch errors so they're visible in DevTools
    useEffect(() => {
        if (songError) {
            console.warn('[SongDetailPage] Failed to load song:', songError);
        }
    }, [songError]);

    // Skeleton timeout fallback — if still loading after 10s, unblock the UI
    const [skeletonTimedOut, setSkeletonTimedOut] = useState(false);
    useEffect(() => {
        if (!songLoading && !authLoading) return;
        const timer = setTimeout(() => {
            console.warn('[SongDetailPage] Skeleton timed out after 10s — authLoading:', authLoading, 'songLoading:', songLoading);
            setSkeletonTimedOut(true);
        }, 10_000);
        return () => clearTimeout(timer);
    }, [songLoading, authLoading]);

    // Favorites — shares cache with SongsPageContent
    const { data: favoriteIds = new Set<string>() } = useQuery({
        queryKey: SONG_KEYS.favorites(user?.id),
        queryFn: async () => {
            if (!user) return new Set<string>();
            const supabase = createClient();
            const isProd = process.env.NODE_ENV === "production";
            const timeoutMs = isProd ? 4500 : 15000;
            
            const setlistPromise = supabase
                .from('setlists').select('id')
                .eq('title', 'My Favorites').maybeSingle();
                
            const { data: setlist } = (await withTimeout(Promise.resolve(setlistPromise), timeoutMs, "Favorites query timed out")) as { data: any };
            if (!setlist) return new Set<string>();
            
            const itemsPromise = supabase
                .from('setlist_items')
                .select('song_versions(composition_id)').eq('setlist_id', setlist.id);
                
            const { data: items } = (await withTimeout(Promise.resolve(itemsPromise), timeoutMs, "Favorites items query timed out")) as { data: any };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new Set<string>((items ?? []).map((i: any) => i.song_versions?.composition_id).filter(Boolean));
        },
        enabled: !!user,
    });
    const { isFav, handleToggle: handleToggleFavorite, signInGate: favouritesGate } = useToggleFavorite(id!, favoriteIds.has(id!));

    // Personal recordings — check if logged-in user has any recordings for this song's composition
    const { userRecordingCompositionIds } = useRecordingsQuery(user?.id);
    const hasPersonalRecording = !!id && userRecordingCompositionIds.has(id);

    const versions = song?.song_versions || [];
    const currentVersion = versions[selectedVersionIndex];
    const { data: recordings } = useSongRecordings(currentVersion?.id);
    const mayTranspose = canTranspose(user?.role) && !!song?.has_chords;
    const shownContent = useMemo(
        () => transposeChordPro(currentVersion?.content_chordpro || '', mayTranspose ? semitones : 0, { key: currentVersion?.key }),
        [currentVersion?.content_chordpro, currentVersion?.key, mayTranspose, semitones],
    );
    const shownVersion = currentVersion && mayTranspose && semitones !== 0
        ? { ...currentVersion, key: transposeKey(currentVersion.key, semitones) }
        : currentVersion;

    // Story 6.1.9 (#393): the phone action bar hides on scroll down when the user has auto-hide on.
    const { preferences } = useUserPreferences();
    const actionBarVisible = useActionBarVisibility(preferences.autoHideBottomNav);
    const hasMedia = !!(currentVersion?.youtube_url || currentVersion?.spotify_url || currentVersion?.soundcloud_url);
    const openPractice = () => {
        // Listen when there is reference media, otherwise straight to Record. Guests see the gate there.
        setDrawerRequestedTab(practiceTab(hasMedia));
        setIsRehearsalDrawerOpen(true);
    };

    // Deep link `/songs/<id>?recording=<recordingId>` (notifications, emails, "Copy link"):
    // select the recording's version, open the Recordings tab and highlight the take.
    useEffect(() => {
        if (!linkedRecordingId || !song || authLoading) return;
        if (handledRecordingLink.current === linkedRecordingId) return;
        handledRecordingLink.current = linkedRecordingId;
        const songVersions = song.song_versions ?? [];
        void (async () => {
            let index = -1;
            if (user) {
                const { data } = await createClient()
                    .from('user_recordings')
                    .select('song_version_id')
                    .eq('id', linkedRecordingId)
                    .maybeSingle();
                index = data ? songVersions.findIndex((v: { id: string }) => v.id === data.song_version_id) : -1;
                if (index < 0) toast.error(t('rehearsal.recording.linkUnavailable'));
            }
            // Guests see the sign-in prompt of the Recordings tab.
            if (index >= 0) {
                setSelectedVersionIndex(index);
                setHighlightRecordingId(linkedRecordingId);
            }
            setDrawerRequestedTab('recorder');
            setIsRehearsalDrawerOpen(true);
        })();
    }, [linkedRecordingId, song, authLoading, user, t]);

    if (songLoading || authLoading) {
        if (skeletonTimedOut) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-6">
                    <p className="text-3xl">⚠️</p>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('song.error.timeout')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('song.error.timeoutDescription')}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-5 py-2 rounded-lg bg-[#ff4400] text-white text-sm font-semibold hover:bg-[#e03c00] transition-colors"
                    >
                        {t('song.error.retry')}
                    </button>
                </div>
            );
        }
        return <SongDetailSkeleton />;
    }
    if (songError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-6">
                <p className="text-3xl">🔥</p>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('song.error.loadFailed')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(songError as Error)?.message ?? t('song.error.unexpected')}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-5 py-2 rounded-lg bg-[#ff4400] text-white text-sm font-semibold hover:bg-[#e03c00] transition-colors"
                >
                    {t('song.error.retry')}
                </button>
            </div>
        );
    }
    if (!song) return notFound();

    const categories = (song.song_category_map?.map((map: any) => ({
        ...map.categories,
        parent: map.categories?.parent?.name ?? null,
    })) || [])
        .filter((cat: any) => cat && cat.parent !== 'Artists' && cat.name !== 'Artists');

    const handleDelete = async () => {
        if (!id) return;
        await deleteSong(id, { redirectTo: '/' });
    };

    const handleShare = async () => {
        const shareData = {
            title: song.title,
            text: song.original_author 
                ? t('song.share.textWithAuthor', { title: song.title, author: song.original_author })
                : t('song.share.text', { title: song.title }),
            url: window.location.href
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success(t('song.share.copied'));
            } catch (err) {
                console.error('Could not copy text: ', err);
                toast.error(t('song.share.copyError'));
            }
        }
    };

    const handleMakeSongPublic = async () => {
        if (!id) return false;
        const res = await makeSongPublic(id);
        if (res.success) {
            queryClient.invalidateQueries({ queryKey: SONG_KEYS.detail(id) });
            queryClient.invalidateQueries({ queryKey: SONG_KEYS.list() });
            toast.success(t('song.publishSuccess'));
            return true;
        } else {
            toast.error(res.error || t('song.publishError'));
            return false;
        }
    };

    // Helper for badge colors (could be moved to utils or globals)
    // REMOVED: local getCategoryColor - imported from uiUtils

    return (
        <div className="flex flex-col h-full">
            {/* Mobile Header (Visible only on mobile < lg) */}
            <header style={{ top: 'var(--env-banner-height, 0px)', width: '100vw', maxWidth: '100vw' }} className="lg:hidden flex items-center gap-2 pl-4 pr-1 sticky left-0 bg-bg/95 backdrop-blur-md z-30 border-b border-line min-h-bar">
                {/* Story 6.1.8 (#392): one line, left aligned, ellipsis at the end so the first letters always show. */}
                <h1
                    data-testid="sticky-song-title"
                    title={song.title}
                    className="flex-1 min-w-0 truncate text-left text-title font-semibold text-fg"
                >
                    {song.title}
                </h1>
                {/* 3-dot menu — flex-none so it never shrinks */}
                <div className="flex-none flex items-center">
                    <button
                        onClick={() => setIsOverflowOpen(!isOverflowOpen)}
                        className="inline-flex size-tap items-center justify-center rounded-control text-fg-muted hover:text-fg transition-colors"
                        aria-label={t('common.moreActions')}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 min-w-0 bg-white dark:bg-gray-950">

                {/* Desktop Page Header (Title, Actions) - Visible only on desktop >= lg */}
                <div ref={setDesktopHeader} className="hidden lg:flex justify-between items-center px-8 py-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-950/50 sticky top-0 backdrop-blur-md z-10 transition-all">
                    {/* Title and Artist */}
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-display font-semibold text-fg tracking-tight">{song.title}</h1>
                            </div>
                        </div>
                    </div>
                    {/* Action Buttons and User Profile */}
                    <div className="flex items-center gap-3">
                        {(song.owner_id === user?.id || isAdmin) && (
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-bold border border-red-500/20 transition-all"
                            >
                                <Trash2 className="w-4 h-4" /> <span className="hidden xl:inline">{t('common.delete')}</span>
                            </button>
                        )}
                        {(song.owner_id === user?.id || isAdmin) && (
                            <Link href={`/songs/${id}/edit`}>
                                <button className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-bold border border-gray-300 dark:border-gray-700 transition-all">
                                    <Edit2 className="w-4 h-4" /> <span className="hidden xl:inline">{t('common.edit')}</span>
                                </button>
                            </Link>
                        )}
                        {id && (
                            <button
                                onClick={() => {
                                    setDrawerRequestedTab("recorder");
                                    setIsRehearsalDrawerOpen(true);
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold border border-indigo-500/20 transition-all active:scale-[0.98]"
                                title={t('practice.title')}
                            >
                                {isAudioPlaying ? (
                                    <div className="flex items-end gap-[2px] h-4 w-4 overflow-hidden" title={t('miniPlayer.playing')}>
                                        <div className="w-[3px] bg-indigo-600 dark:bg-indigo-400 animate-[equalizer_1s_ease-in-out_infinite]" />
                                        <div className="w-[3px] bg-indigo-600 dark:bg-indigo-400 animate-[equalizer_1.2s_ease-in-out_infinite_0.2s]" />
                                        <div className="w-[3px] bg-indigo-600 dark:bg-indigo-400 animate-[equalizer_0.9s_ease-in-out_infinite_0.4s]" />
                                        <div className="w-[3px] bg-indigo-600 dark:bg-indigo-400 animate-[equalizer_1.1s_ease-in-out_infinite_0.1s]" />
                                    </div>
                                ) : (
                                    <Mic className="w-4 h-4" />
                                )}
                                <span className="hidden xl:inline">{t('practice.title')}</span>
                                {recordings && recordings.length > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 rounded-md bg-indigo-600/20 text-caption font-black">
                                        {recordings.length}
                                    </span>
                                )}
                            </button>
                        )}
                        {user && id && (
                            <PlaylistPicker
                                compositionId={id}
                                userId={user.id}
                                triggerClassName="p-2"
                                iconClassName="w-[17px] h-[17px]"
                            />
                        )}
                        {!user && (
                            <button
                                onClick={() => {
                                    setIsGuestGateOpen(true);
                                }}
                                aria-label={t('song.addToPlaylist')}
                                className="p-2 rounded-full transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <ListPlus className="w-5 h-5" strokeWidth={1.5} />
                            </button>
                        )}
                        <button
                            onClick={handleToggleFavorite}
                            aria-label={isFav ? t('song.removeFromFavorites') : t('song.addToFavorites')}
                            className={`p-2 rounded-full transition-all duration-300 ${isFav ? 'text-amber-400 heart-glow' : 'text-gray-500 dark:text-gray-400 hover:text-amber-400/60'}`}
                        >
                            <Heart className={`w-5 h-5 transition-all duration-200 ${isFav ? 'fill-amber-400' : ''}`} strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={handleShare}
                            aria-label={t('song.share.ariaLabel')}
                            title={t('song.share.ariaLabel')}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <Share2 className="w-5 h-5" strokeWidth={1.5} />
                        </button>

                    </div>
                </div>

                <div className="max-w-5xl px-6 md:px-10 pb-[calc(1.5rem+var(--mini-player-h,0px)+var(--action-bar-h,0px))] md:pb-[calc(2.5rem+var(--mini-player-h,0px)+var(--action-bar-h,0px))] lg:pb-[calc(2.5rem+var(--mini-player-h,0px))] pt-4 md:pt-6 space-y-0">

                    {/* Story 6.1.7 (#391): tags on one grey line (tap to expand), Key · Capo · Tuning on another. */}
                    <SongMetaLines
                        className="mb-2"
                        originalAuthor={song.original_author}
                        categories={categories}
                        version={shownVersion}
                        hasChords={song.has_chords}
                        hasMelody={song.has_melody}
                        hasPersonalRecording={hasPersonalRecording}
                    />

                    {/* Story 6.1.6 (#390): Chords · A− · A+, remembered on this device.
                        Story 6.1.10 (#394): plus auto-scroll and ⋯ (transpose, speed). The strip sticks under the
                        header only while auto-scroll runs, so it can be paused or slowed without scrolling back. */}
                    <div
                        ref={toolbarWrapRef}
                        data-testid="reader-toolbar-wrap"
                        style={{ '--desktop-header-h': `${desktopHeaderH}px` } as React.CSSProperties}
                        data-scrolling={autoScroll.playing ? 'true' : 'false'}
                        className={cn(
                            '-mx-6 mb-2 px-4 md:-mx-10 md:px-8',
                            autoScroll.playing && 'sticky top-[calc(var(--env-banner-height,0px)+var(--bar-h))] z-20 border-b border-line bg-bg lg:top-[var(--desktop-header-h)]',
                        )}
                    >
                        <ReaderToolbar
                            step={readerPrefs.step}
                            chords={readerPrefs.chords}
                            speed={readerPrefs.speed}
                            hasChords={song.has_chords}
                            onChange={setReaderPrefs}
                            scrolling={autoScroll.playing}
                            onToggleScroll={autoScroll.toggle}
                            onOpenTools={() => setIsToolsOpen(true)}
                            toolsOpen={isToolsOpen}
                            toolsButtonRef={toolsButtonRef}
                            semitones={mayTranspose ? semitones : 0}
                            awake={awake}
                        />
                    </div>

                    {/* Song Content (Lyrics/Chords) */}
                    <div ref={lyricsRef} className="pt-2 pb-12">
                        <SongDisplay
                            content={shownContent}
                            melodyNotation={currentVersion?.melody_notation || ''}
                            hasChords={song.has_chords}
                            sizeStep={readerPrefs.step}
                            showChords={readerPrefs.chords}
                        />
                    </div>

                    <div className="h-20"></div>
                </div>

                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    title={t('song.delete.confirm.modalTitle')}
                    message={t('song.delete.confirm.message', { title: song.title })}
                    isDeleting={isDeleting}
                />
            </main>

            {/* Story 6.1.9 (#393): Practice · Playlist · ♥ in thumb reach (phones). */}
            <SongActionBar
                isFavorite={isFav}
                onPractice={openPractice}
                onToggleFavorite={handleToggleFavorite}
                onGuestPlaylist={() => setIsGuestGateOpen(true)}
                takeCount={recordings?.length ?? 0}
                visible={actionBarVisible}
                playlistSlot={user && id ? (
                    <PlaylistPicker
                        compositionId={id}
                        userId={user.id}
                        label={t('songBar.playlist')}
                        triggerTestId="song-action-playlist"
                        triggerClassName="min-h-tap min-w-0 flex-1 rounded-control px-2 text-meta font-medium text-fg-muted hover:bg-surface-2 hover:text-fg"
                        contentClassName="flex items-center justify-center gap-1.5"
                        iconClassName="size-5 shrink-0"
                        labelClassName="truncate text-meta font-medium"
                    />
                ) : undefined}
            />

            <ReadingToolsSheet
                open={isToolsOpen}
                onOpenChange={setIsToolsOpen}
                transpose={mayTranspose ? {
                    semitones,
                    originalKey: currentVersion?.key,
                    onShift: (delta) => setTransposeState({ id, n: shiftSemitones(semitones, delta) }),
                    onReset: () => setTransposeState({ id, n: 0 }),
                } : undefined}
                speed={readerPrefs.speed}
                onSpeed={(delta) => setReaderPrefs({ ...readerPrefs, speed: speedBy(readerPrefs.speed, delta) })}
                scrolling={autoScroll.playing}
                onToggleScroll={autoScroll.toggle}
                awake={awake}
                returnFocusRef={toolsButtonRef}
            />

            {/* Mobile Bottom Drawer Context Menu */}
            {isOverflowOpen && (
                <>
                    {/* Backdrop overlay */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200" 
                        onClick={() => setIsOverflowOpen(false)} 
                    />
                    {/* Bottom sheet */}
                    <div 
                        data-testid="song-overflow-sheet"
                        className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 rounded-t-3xl shadow-2xl z-50 pb-[calc(env(safe-area-inset-bottom,0px)+var(--mini-player-h,0px))] lg:hidden animate-in slide-in-from-bottom duration-300 flex flex-col"
                    >
                        {/* Handle bar */}
                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto my-3 shrink-0" />
                        
                        {/* Song Info header inside sheet */}
                        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800/50">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/10">
                                <Music className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-base font-black text-gray-900 dark:text-white truncate text-left">{song.title}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate text-left">{t('song.by', { author: song.original_author || t('song.traditional') })}</p>
                            </div>
                        </div>

                        {/* Action options */}
                        <div className="py-2">
                            {/* Share */}
                            <button
                                onClick={() => { handleShare(); setIsOverflowOpen(false); }}
                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-left text-gray-700 dark:text-gray-300"
                            >
                                <Share2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <span className="text-sm font-bold">{t('song.share')}</span>
                            </button>

                            {/* Edit */}
                            {(song.owner_id === user?.id || isAdmin) && (
                                <Link
                                    href={`/songs/${id}/edit`}
                                    onClick={() => setIsOverflowOpen(false)}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-gray-700 dark:text-gray-300"
                                >
                                    <Edit2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm font-bold">{t('song.edit')}</span>
                                </Link>
                            )}

                            {/* Delete */}
                            {(song.owner_id === user?.id || isAdmin) && (
                                <button
                                    onClick={() => { setIsOverflowOpen(false); setIsDeleteModalOpen(true); }}
                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-500/10 transition-colors text-red-500 text-left"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    <span className="text-sm font-bold">{t('song.delete')}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            <GuestGateSheet feature="addToPlaylist" open={isGuestGateOpen} onOpenChange={setIsGuestGateOpen} />
            <GuestGateSheet feature="favourites" open={favouritesGate.open} onOpenChange={favouritesGate.onOpenChange} />

            {/* Rehearsal Drawer Sheet */}
            {currentVersion && (
                <RehearsalDrawer
                    isOpen={isRehearsalDrawerOpen}
                    onClose={() => {
                        setIsRehearsalDrawerOpen(false);
                        setHighlightRecordingId(null);
                    }}
                    onOpen={() => {
                        setDrawerRequestedTab("auto");
                        setIsRehearsalDrawerOpen(true);
                    }}
                    requestedTab={drawerRequestedTab}
                    songVersionId={currentVersion.id}
                    compositionId={id}
                    onPlayStateChange={setIsAudioPlaying}
                    songTitle={song.title}
                    songAuthor={song.original_author || t('song.traditional')}
                    youtubeUrl={currentVersion.youtube_url}
                    spotifyUrl={currentVersion.spotify_url}
                    soundcloudUrl={currentVersion.soundcloud_url}
                    isSongPublic={song.is_public ?? true}
                    isSongOwner={user?.id === song.owner_id || isAdmin}
                    onMakeSongPublic={handleMakeSongPublic}
                    highlightRecordingId={highlightRecordingId}
                />
            )}
        </div>
    );
}
