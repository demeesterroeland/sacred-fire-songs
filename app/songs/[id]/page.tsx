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
import { Trash2, Edit2, Heart, MoreVertical, ListPlus, Mic, Share2, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import GuestGateSheet from '@/components/common/GuestGateSheet';
import RehearsalDrawer from '@/components/song/RehearsalDrawer';
import { makeSongPublic } from '@/lib/actions/rehearsal';
import { useToggleFavorite } from '@/hooks/useToggleFavorite';
import { PlaylistPicker } from '@/components/playlists/PlaylistPicker';
import { useDeleteSong } from '@/hooks/useDeleteSong';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useAutoScroll, useLyricsBelowFold, AUTOSCROLL_KEEP_ATTR } from '@/hooks/useAutoScroll';
import { useSongControlsExpanded } from '@/hooks/useSongControlsExpanded';
import { SongActionBar } from '@/components/song/SongActionBar';
import { useActionBarVisibility } from '@/hooks/useActionBarVisibility';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { practiceTab } from '@/lib/song/actionBar';
import { SongMetaLines } from '@/components/song/SongMetaLines';
import { ReaderToolbar } from '@/components/song/ReaderToolbar';
import { SongVersionSwitch } from '@/components/song/SongVersionSwitch';
import { EDIT_VERSION_PARAM, editSongHref } from '@/lib/songs/versionOrder';
import { blocksVersionSwitch, linkedVersionChoice, resolveVersionIndex, versionSearch, versionShareUrl, type VersionChoice } from '@/lib/songs/versionSwitch';
import { SongMenuSheet } from '@/components/song/SongMenuSheet';
import { useScrolledPast } from '@/hooks/useScrolledPast';
import { useReaderPrefs } from '@/lib/reader/useReaderPrefs';
import { speedBy } from '@/lib/reader/autoScroll';
import { versionHasChords } from '@/lib/songs/versionFlags';
import { canTranspose, shiftSemitones, transposeChordPro, transposeKey } from '@/lib/reader/transpose';
import { cn } from '@/lib/utils';
import { recordSongView } from '@/app/actions/recordSongView';
import { useSongRecordings } from '@/hooks/useSongRecordings';
import { useRecordingsQuery } from '@/hooks/useRecordingsQuery';
import { useLocale } from '@/context/LocaleContext';
import { fetchSong, withTimeout } from '@/lib/songs/fetchSong';
import { fetchFavoritesSetlistId } from '@/lib/playlists/favorites';
import { linkedTakeTab, parseRecordingParam, RECORDING_PARAM } from '@/lib/songs/recordingLink';
import { actionErrorMessage } from '@/lib/errors/actionError';

export default function SongDetailPage() {
    const { t } = useLocale();
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : params.id?.[0]; // Safe type handling

    // The chosen version belongs to the song it was chosen on (like the transpose shift), so opening
    // another song, or a version that is gone, falls back to the first one (UXA-049).
    const [versionChoice, setVersionChoice] = useState<VersionChoice | null>(null);
    const [readerPrefs, setReaderPrefs] = useReaderPrefs();
    const [controlsExpanded, setControlsExpanded] = useSongControlsExpanded();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // The song page's one menu (⋮). It is opened from the bar on a phone and from the header from lg up.
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const phoneTitleRef = useRef<HTMLHeadingElement>(null);
    const phoneMenuButtonRef = useRef<HTMLButtonElement>(null);
    const desktopMenuButtonRef = useRef<HTMLButtonElement>(null);
    // The full title wraps in the page; the truncated copy in the sticky bar shows once it has scrolled under the bar.
    const titleScrolledPast = useScrolledPast(phoneTitleRef, 56);
    const [isRehearsalDrawerOpen, setIsRehearsalDrawerOpen] = useState(false);
    const [isGuestGateOpen, setIsGuestGateOpen] = useState(false);
    const [drawerRequestedTab, setDrawerRequestedTab] = useState<"media" | "recorder" | "auto">("auto");
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [highlightRecordingId, setHighlightRecordingId] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const linkedRecordingId = parseRecordingParam(searchParams.get(RECORDING_PARAM));
    // `/songs/<id>?version=<versionId>` (where Save on the edit form returns to) is the initial choice;
    // a tap on the switch or a linked take overrides it. Unknown versions fall back to the first one.
    const linkedVersion = linkedVersionChoice(id, searchParams.get(EDIT_VERSION_PARAM));
    // The recorder holds a take that is not saved yet: a version tap must not remount (and empty) the drawer.
    const recorderDirtyRef = useRef(false);
    const handledRecordingLink = useRef<string | null>(null);
    const { isDeleting, deleteSong } = useDeleteSong();

    const { user, loading: authLoading } = useAuth();
    const isAdmin = user?.role === 'admin';
    const queryClient = useQueryClient();

    // Screen Wake Lock on the song page: held while the per-device "Screen stays on" preference is on (default on).
    // `awake` feeds the reader's stay-awake indicator (Story 6.1.10, #394); the switch is in the ⋮ menu (validation 2, item 10).
    const { isActive: awake, isSupported: awakeSupported } = useWakeLock();
    const { preferences, setPreference } = useUserPreferences();

    // Story 6.1.10 / G2.5 (#394): auto-scroll and transpose live in the reader toolbar.
    const toolbarWrapRef = useRef<HTMLDivElement>(null);
    const lyricsRef = useRef<HTMLDivElement>(null);
    const largerButtonRef = useRef<HTMLButtonElement>(null);
    // Auto-scroll (▶, and its section in the tools sheet) only exists while the end of the lyrics is below the fold.
    const canAutoScroll = useLyricsBelowFold(lyricsRef, toolbarWrapRef);
    const autoScroll = useAutoScroll(readerPrefs.speed, toolbarWrapRef, lyricsRef, canAutoScroll);
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
            
            // The signed-in user's own setlist: an admin can read everyone's, so the lookup filters on the owner.
            const setlistId = await withTimeout(fetchFavoritesSetlistId(supabase, user.id), timeoutMs, "Favorites query timed out");
            if (!setlistId) return new Set<string>();

            const itemsPromise = supabase
                .from('setlist_items')
                .select('song_versions(composition_id)').eq('setlist_id', setlistId);
                
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
    const selectedVersionIndex = resolveVersionIndex(versions, versionChoice?.songId === id ? versionChoice : linkedVersion, id);
    const currentVersion = versions[selectedVersionIndex];
    const selectVersion = (index: number) => {
        const next = versions[index];
        if (!next) return;
        // A take in progress (or recorded but not saved) belongs to the version it was made on; switching would
        // remount the drawer and drop it. Bring the recorder back instead, and say why (UXA-048).
        if (blocksVersionSwitch(recorderDirtyRef.current, currentVersion?.id, next.id)) {
            toast.info(t('song.version.takeInProgress'));
            setDrawerRequestedTab('recorder');
            setIsRehearsalDrawerOpen(true);
            return;
        }
        setVersionChoice({ songId: id, versionId: next.id });
        // A take linked from a notification belongs to the version it was opened on.
        setHighlightRecordingId(null);
        // Every version has its own link (`?version=`; none for the first one). The address is replaced in place:
        // no reload, and no history entry per switch, so Back leaves the song instead of stepping through versions.
        if (typeof window !== 'undefined') {
            const search = versionSearch(window.location.search, next.id, index === 0);
            window.history.replaceState(null, '', `${window.location.pathname}${search}${window.location.hash}`);
        }
    };
    const { data: recordings } = useSongRecordings(currentVersion?.id);
    // The Chords switch and transpose follow the version being SHOWN (a lyrics-only Simplified has none to switch
    // or shift); lists, filters and the meta links keep using the song-level flag (any version).
    const shownHasChords = versionHasChords(currentVersion);
    const mayTranspose = canTranspose(user?.role) && shownHasChords;
    const shownContent = useMemo(
        () => transposeChordPro(currentVersion?.content_chordpro || '', mayTranspose ? semitones : 0, { key: currentVersion?.key }),
        [currentVersion?.content_chordpro, currentVersion?.key, mayTranspose, semitones],
    );
    const shownVersion = currentVersion && mayTranspose && semitones !== 0
        ? { ...currentVersion, key: transposeKey(currentVersion.key, semitones) }
        : currentVersion;

    // Story 6.1.9 (#393): the phone action bar hides on scroll down when the user has auto-hide on.
    const actionBarVisible = useActionBarVisibility(preferences.autoHideBottomNav);
    const hasMedia = !!(currentVersion?.youtube_url || currentVersion?.spotify_url || currentVersion?.soundcloud_url);
    const openPractice = () => {
        // Listen when there is reference media (or for a guest: public takes), otherwise straight to Record.
        setDrawerRequestedTab(practiceTab(hasMedia, !!user));
        setIsRehearsalDrawerOpen(true);
    };

    // Deep link `/songs/<id>?recording=<recordingId>` (notifications, emails, "Copy link"):
    // select the recording's version, open the tab that lists the takes (Record for a member,
    // Listen for a guest) and highlight the take.
    useEffect(() => {
        if (!linkedRecordingId || !song || authLoading) return;
        if (handledRecordingLink.current === linkedRecordingId) return;
        handledRecordingLink.current = linkedRecordingId;
        const songVersions = song.song_versions ?? [];
        void (async () => {
            const { data } = await createClient()
                .from('user_recordings')
                .select('song_version_id')
                .eq('id', linkedRecordingId)
                .maybeSingle();
            const index = data ? songVersions.findIndex((v: { id: string }) => v.id === data.song_version_id) : -1;
            // A member is told when the take is not available; a guest is asked to sign in instead.
            if (index < 0 && user) toast.error(t('rehearsal.recording.linkUnavailable'));
            if (index >= 0) {
                setVersionChoice({ songId: id, versionId: songVersions[index].id });
                setHighlightRecordingId(linkedRecordingId);
            }
            setDrawerRequestedTab(linkedTakeTab(!!user, index >= 0));
            setIsRehearsalDrawerOpen(true);
        })();
    }, [linkedRecordingId, song, authLoading, user, t, id]);

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
        const shareUrl = currentVersion
            ? versionShareUrl(window.location.href, currentVersion.id, selectedVersionIndex === 0)
            : window.location.href;
        const shareData = {
            title: song.title,
            text: song.original_author 
                ? t('song.share.textWithAuthor', { title: song.title, author: song.original_author })
                : t('song.share.text', { title: song.title }),
            // The link of the version being read (the first version has the clean song URL).
            url: shareUrl,
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
                await navigator.clipboard.writeText(shareUrl);
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
            toast.error(actionErrorMessage(res.error, t, 'song.publishError'));
            return false;
        }
    };

    // Helper for badge colors (could be moved to utils or globals)
    // REMOVED: local getCategoryColor - imported from uiUtils

    return (
        <div className="flex flex-col h-full">
            {/* Phone bar (< lg): the ⋮ menu, and the title once the full one has scrolled away (#392). The bar has no
                height of its own (h-0): the full title below sits at the top of the page and the ⋮ sits at its right.
                Stuck, the bar gets its background and the truncated title (a copy: the h1 below is the heading). */}
            <header
                style={{ top: 'var(--env-banner-height, 0px)', width: '100vw', maxWidth: '100vw' }}
                className="lg:hidden sticky left-0 z-30 h-0"
                data-testid="song-phone-bar"
                data-stuck={titleScrolledPast ? 'true' : 'false'}
            >
                <div
                    className={cn(
                        'pointer-events-none absolute inset-x-0 top-0 flex h-bar items-center gap-2 pl-6 pr-1 transition-colors motion-reduce:transition-none',
                        titleScrolledPast && 'pointer-events-auto border-b border-line bg-bg/95 backdrop-blur-md',
                    )}
                >
                    <p
                        data-testid="sticky-song-title"
                        aria-hidden="true"
                        title={song.title}
                        className={cn(
                            'min-w-0 flex-1 truncate text-left text-title font-semibold text-fg flex items-center gap-1.5',
                            !titleScrolledPast && 'invisible',
                        )}
                    >
                        <span className="truncate">{song.title}</span>
                        {song.is_public ? (
                            <Globe className="size-4 shrink-0 text-fg-muted" aria-hidden />
                        ) : (
                            <Lock className="size-4 shrink-0 text-fg-muted" aria-hidden />
                        )}
                    </p>
                    <button
                        ref={phoneMenuButtonRef}
                        type="button"
                        data-testid="song-menu-button"
                        {...{ [AUTOSCROLL_KEEP_ATTR]: '' }}
                        aria-haspopup="dialog"
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen(true)}
                        className="pointer-events-auto inline-flex size-tap flex-none items-center justify-center rounded-control text-fg-muted transition-colors hover:text-fg"
                        aria-label={t('common.moreActions')}
                    >
                        <MoreVertical className="size-5" aria-hidden />
                    </button>
                </div>
            </header>

            {/* The root layout owns the one <main> landmark. */}
            <div className="flex-1 min-w-0 bg-bg">

                {/* The full title, wrapping, at the top of the page on a phone (#392). */}
                <h1
                    ref={phoneTitleRef}
                    data-testid="song-title"
                    className="lg:hidden break-words px-6 pb-1 pr-16 pt-3.5 text-title font-semibold text-fg md:px-10 md:pr-16 flex items-center gap-2"
                >
                    <span>{song.title}</span>
                    {song.is_public ? (
                        <Globe className="size-4 shrink-0 text-fg-muted" aria-hidden />
                    ) : (
                        <Lock className="size-4 shrink-0 text-fg-muted" aria-hidden />
                    )}
                </h1>

                {/* Desktop Page Header (Title, Actions) - Visible only on desktop >= lg */}
                <div ref={setDesktopHeader} className="hidden lg:flex justify-between items-center px-8 py-4 border-b border-line bg-bg/50 sticky top-0 backdrop-blur-md z-10">
                    {/* Title */}
                    <div className="flex items-center gap-2.5 min-w-0 pr-4">
                        <h1 className="text-display font-semibold text-fg tracking-tight truncate">{song.title}</h1>
                        {song.is_public ? (
                            <Globe className="size-5 shrink-0 text-fg-muted" aria-hidden />
                        ) : (
                            <Lock className="size-5 shrink-0 text-fg-muted" aria-hidden />
                        )}
                    </div>
                    {/* Neutral buttons; the one accent is the primary action, Practice (validation 2, item 7).
                        Delete stays neutral: the red is in the confirmation. */}
                    <div className="flex items-center gap-3">
                        {(song.owner_id === user?.id || isAdmin) && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="px-3 xl:px-4"
                                data-testid="song-header-delete"
                            >
                                <Trash2 aria-hidden /> <span className="hidden xl:inline">{t('common.delete')}</span>
                                <span className="sr-only xl:hidden">{t('common.delete')}</span>
                            </Button>
                        )}
                        {(song.owner_id === user?.id || isAdmin) && (
                            <Button asChild variant="outline" className="px-3 xl:px-4">
                                <Link href={editSongHref(id, currentVersion?.id)} data-testid="song-header-edit">
                                    <Edit2 aria-hidden /> <span className="hidden xl:inline">{t('common.edit')}</span>
                                    <span className="sr-only xl:hidden">{t('common.edit')}</span>
                                </Link>
                            </Button>
                        )}
                        {id && (
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => {
                                    // A guest cannot record: Listen, where the public takes are.
                                    setDrawerRequestedTab(user ? "recorder" : "media");
                                    setIsRehearsalDrawerOpen(true);
                                }}
                                className="px-3 active:scale-[0.98] xl:px-4"
                                title={t('practice.title')}
                                aria-label={t('practice.title')}
                                data-testid="song-header-practice"
                            >
                                {isAudioPlaying ? (
                                    <div aria-hidden className="flex h-4 w-4 items-end gap-[2px] overflow-hidden">
                                        <div className="h-3/5 w-[3px] bg-on-accent motion-safe:animate-[equalizer_1s_ease-in-out_infinite]" />
                                        <div className="h-3/5 w-[3px] bg-on-accent motion-safe:animate-[equalizer_1.2s_ease-in-out_infinite_0.2s]" />
                                        <div className="h-3/5 w-[3px] bg-on-accent motion-safe:animate-[equalizer_0.9s_ease-in-out_infinite_0.4s]" />
                                        <div className="h-3/5 w-[3px] bg-on-accent motion-safe:animate-[equalizer_1.1s_ease-in-out_infinite_0.1s]" />
                                    </div>
                                ) : (
                                    <Mic aria-hidden />
                                )}
                                <span className="hidden xl:inline">{t('practice.title')}</span>
                                {recordings && recordings.length > 0 && (
                                    <span className="rounded-pill bg-on-accent/20 px-1.5 text-caption font-medium">
                                        {recordings.length}
                                    </span>
                                )}
                            </Button>
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
                                className="inline-flex size-tap items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                            >
                                <ListPlus className="size-5" strokeWidth={1.5} aria-hidden />
                            </button>
                        )}
                        <button
                            onClick={handleToggleFavorite}
                            aria-label={isFav ? t('song.removeFromFavorites') : t('song.addToFavorites')}
                            aria-pressed={isFav}
                            className={cn(
                                'inline-flex size-tap items-center justify-center rounded-control transition-colors hover:bg-surface-2',
                                isFav ? 'text-fg' : 'text-fg-muted hover:text-fg',
                            )}
                        >
                            <Heart className={cn('size-5', isFav && 'fill-current')} strokeWidth={1.5} aria-hidden />
                        </button>
                        <button
                            onClick={handleShare}
                            aria-label={t('song.share.ariaLabel')}
                            title={t('song.share.ariaLabel')}
                            className="inline-flex size-tap items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                        >
                            <Share2 className="size-5" strokeWidth={1.5} aria-hidden />
                        </button>
                        {/* The one menu: transpose, scroll speed, screen switch (and the actions on a phone). */}
                        <button
                            ref={desktopMenuButtonRef}
                            type="button"
                            data-testid="song-menu-button-desktop"
                            {...{ [AUTOSCROLL_KEEP_ATTR]: '' }}
                            aria-haspopup="dialog"
                            aria-expanded={isMenuOpen}
                            onClick={() => setIsMenuOpen(true)}
                            aria-label={t('common.moreActions')}
                            className="inline-flex size-tap items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                        >
                            <MoreVertical className="size-5" aria-hidden />
                        </button>
                    </div>
                </div>

                <div className="max-w-5xl px-6 md:px-10 pb-[calc(1.5rem+var(--mini-player-h,0px)+var(--action-bar-h,0px))] md:pb-[calc(2.5rem+var(--mini-player-h,0px)+var(--action-bar-h,0px))] lg:pb-[calc(2.5rem+var(--mini-player-h,0px))] pt-4 md:pt-6 space-y-0">

                    {/* Story 6.1.7 (#391), Validation 3: tags, Key · Capo · Tuning, and Chords/transpose toolbar
                        inside expand/collapse. Closed by default, remembered in localStorage. */}
                    <SongMetaLines
                        className="mb-2"
                        originalAuthor={song.original_author}
                        categories={categories}
                        version={shownVersion}
                        hasChords={song.has_chords}
                        hasMelody={song.has_melody}
                        hasPersonalRecording={hasPersonalRecording}
                        expanded={controlsExpanded}
                        onToggleExpanded={() => setControlsExpanded((e) => !e)}
                    />

                    {/* Story 6.1.11 (#395): version switch (Original · Simplified), only when the song has more
                        than one version; nothing (and no space) otherwise. */}
                    <SongVersionSwitch
                        className="mb-2"
                        versions={versions}
                        selectedIndex={selectedVersionIndex}
                        onSelect={selectVersion}
                    />

                    {/* Story 6.1.6 (#390), Validation 3: Chords · A− · A+ · ▶ row inside expand/collapse,
                        rendered when expanded or while auto-scroll is actively playing. */}
                    {(controlsExpanded || autoScroll.playing) && (
                        <div
                            ref={toolbarWrapRef}
                            data-testid="reader-toolbar-wrap"
                            style={{ '--desktop-header-h': `${desktopHeaderH}px` } as React.CSSProperties}
                            data-scrolling={autoScroll.playing ? 'true' : 'false'}
                            className={cn(
                                // Same side padding as the page, so the first control lines up with the lyrics (the Chords switch pulls its own padding back).
                                '-mx-6 mb-2 px-6 md:-mx-10 md:px-10',
                                autoScroll.playing && 'sticky top-[calc(var(--env-banner-height,0px)+var(--bar-h))] z-20 border-b border-line bg-bg lg:top-[var(--desktop-header-h)]',
                            )}
                        >
                            <ReaderToolbar
                                step={readerPrefs.step}
                                chords={readerPrefs.chords}
                                speed={readerPrefs.speed}
                                hasChords={shownHasChords}
                                onChange={setReaderPrefs}
                                scrolling={autoScroll.playing}
                                onToggleScroll={canAutoScroll ? autoScroll.toggle : undefined}
                                fallbackFocusRef={largerButtonRef}
                                awake={awake}
                            />
                        </div>
                    )}

                    {/* Song Content (Lyrics/Chords) */}
                    <div className="pt-2 pb-12">
                        {/* The fold is measured on the lyric text itself, not on the padding below it (review H2). */}
                        <div ref={lyricsRef}>
                            <SongDisplay
                                content={shownContent}
                                melodyNotation={currentVersion?.melody_notation || ''}
                                hasChords={shownHasChords}
                                sizeStep={readerPrefs.step}
                                showChords={readerPrefs.chords}
                            />
                        </div>
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
                    // The ⋮ menu that opened this closes in the same moment: focus goes back to the ⋮ that is on screen.
                    fallbackFocus={() => (phoneMenuButtonRef.current?.offsetParent ? phoneMenuButtonRef.current : desktopMenuButtonRef.current)}
                />
            </div>

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

            <SongMenuSheet
                open={isMenuOpen}
                onOpenChange={setIsMenuOpen}
                title={song.title}
                description={t('song.by', { author: song.original_author || t('song.traditional') })}
                actions={{
                    onShare: () => { void handleShare(); setIsMenuOpen(false); },
                    edit: song.owner_id === user?.id || isAdmin ? { href: editSongHref(id, currentVersion?.id) } : undefined,
                    onDelete: song.owner_id === user?.id || isAdmin ? () => { setIsMenuOpen(false); setIsDeleteModalOpen(true); } : undefined,
                }}
                transpose={mayTranspose ? {
                    semitones,
                    originalKey: currentVersion?.key,
                    onShift: (delta) => setTransposeState({ id, n: shiftSemitones(semitones, delta) }),
                    onReset: () => setTransposeState({ id, n: 0 }),
                } : undefined}
                speed={readerPrefs.speed}
                onSpeed={(delta) => setReaderPrefs({ ...readerPrefs, speed: speedBy(readerPrefs.speed, delta) })}
                scrolling={autoScroll.playing}
                onToggleScroll={canAutoScroll ? autoScroll.toggle : undefined}
                keepAwake={preferences.keepScreenAwake}
                onKeepAwakeChange={(value) => setPreference('keepScreenAwake', value)}
                awakeSupported={awakeSupported}
            />

            <GuestGateSheet feature="addToPlaylist" open={isGuestGateOpen} onOpenChange={setIsGuestGateOpen} />
            <GuestGateSheet feature="favourites" open={favouritesGate.open} onOpenChange={favouritesGate.onOpenChange} />

            {/* Rehearsal Drawer Sheet */}
            {currentVersion && (
                // One drawer per version: switching versions unmounts the old one, which stops its take and
                // drops its reference-track state, so no audio keeps playing without its mini player.
                <RehearsalDrawer
                    key={currentVersion.id}
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
                    isSongPublic={song.is_public === true}
                    isSongOwner={user?.id === song.owner_id || isAdmin}
                    onMakeSongPublic={handleMakeSongPublic}
                    highlightRecordingId={highlightRecordingId}
                    onRecorderDirtyChange={(dirty) => { recorderDirtyRef.current = dirty; }}
                />
            )}
        </div>
    );
}
