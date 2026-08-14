'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SongDisplay from '@/components/song/SongDisplay';
import SongDetailSkeleton from '@/components/song/SongDetailSkeleton';
import MediaEmbeds from '@/components/song/MediaEmbeds';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import { useQuery } from '@tanstack/react-query';
import { Trash2, Edit2, Music, Guitar, Heart, MoreVertical, ListPlus, Mic, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import RehearsalDrawer from '@/components/song/RehearsalDrawer';
import { useToggleFavorite } from '@/hooks/useToggleFavorite';
import { PlaylistPicker } from '@/components/playlists/PlaylistPicker';
import { useDeleteSong } from '@/hooks/useDeleteSong';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import { useWakeLock } from '@/hooks/useWakeLock';
import { getCategoryColor, getCategoryStyles } from '@/lib/uiUtils';
import { TagPill } from '@/components/ui/TagPill';
import { AuthorPill } from '@/components/ui/AuthorPill';
import { SongTechnicalBadges } from '@/components/song/SongTechnicalBadges';
import { SongMetadataPills } from '@/components/song/SongMetadataPills';
import { parseArtists } from '@/lib/songs/artistUtils';
import { recordSongView } from '@/app/actions/recordSongView';
import { useRecordingsQuery } from '@/hooks/useRecordingsQuery';

// Enforce a timeout on any promise to prevent infinite loading skeletons
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage = "Request timed out"): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(errorMessage));
        }, ms);

        promise
            .then((res) => {
                clearTimeout(timer);
                resolve(res);
            })
            .catch((err) => {
                clearTimeout(timer);
                reject(err);
            });
    });
}

// Standalone fetch function
const fetchSong = async (id: string) => {
    const supabase = createClient();
    const queryPromise = supabase
        .from('compositions')
        .select(`
          title,
          original_author,
          owner_id,
          is_public,
          has_chords,
          has_melody,
          song_versions (
            id,
            version_name,
            content_chordpro,
            key,
            capo,
            tuning,
            youtube_url,
            spotify_url,
            soundcloud_url,
            melody_notation
          ),
          song_category_map (
            categories (
              name,
              slug,
              emoji,
              parent:parent_id(name, slug)
            )
          )
        `)
        .eq('id', id)
        .single();

    // Wrap query with a dynamic timeout (4.5s in production, 15s in development/testing)
    const isProd = process.env.NODE_ENV === "production";
    const timeoutMs = isProd ? 4500 : 15000;
    const { data, error } = (await withTimeout(
        Promise.resolve(queryPromise), 
        timeoutMs, 
        "The database took too long to respond. This might be due to connection pool limits. Please try again."
    )) as { data: any; error: any };

    if (error) throw error;
    return data;
};

export default function SongDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params.id === 'string' ? params.id : params.id?.[0]; // Safe type handling

    const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isOverflowOpen, setIsOverflowOpen] = useState(false);
    const [isRehearsalDrawerOpen, setIsRehearsalDrawerOpen] = useState(false);
    const { isDeleting, deleteSong } = useDeleteSong();

    const { user, loading: authLoading } = useAuth();
    const isAdmin = user?.role === 'admin';

    // Enable Screen Wake Lock on Song Detail Page
    useWakeLock();

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
    const { isFav, handleToggle: handleToggleFavorite } = useToggleFavorite(id!, favoriteIds.has(id!));

    // Personal recordings — check if logged-in user has any recordings for this song's composition
    const { userRecordingCompositionIds } = useRecordingsQuery(user?.id);
    const hasPersonalRecording = !!id && userRecordingCompositionIds.has(id);

    const titleRef = useRef<HTMLSpanElement>(null);
    const [scrollAmount, setScrollAmount] = useState(0);

    useEffect(() => {
        if (songLoading || authLoading || !song) return;

        const calculateOverflow = () => {
            const el = titleRef.current;
            // Compare span width vs the flex-1 container (grandparent of the overflow wrapper)
            const container = el?.parentElement?.parentElement;
            if (el && container) {
                el.style.transform = 'none';
                const overflow = el.scrollWidth - container.clientWidth;
                if (overflow > 0) {
                    setScrollAmount(overflow);
                } else {
                    setScrollAmount(0);
                }
                el.style.transform = '';
            }
        };

        const timer = setTimeout(calculateOverflow, 100);

        window.addEventListener('resize', calculateOverflow);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateOverflow);
        };
    }, [song?.title, songLoading, authLoading]);

    const marqueeStyle = scrollAmount > 0 ? {
        '--scroll-amount': `-${scrollAmount}px`,
        animation: 'marquee 8s ease-in-out infinite alternate',
        textAlign: 'left' as const,
    } as React.CSSProperties : { textAlign: 'center' as const };

    if (songLoading || authLoading) {
        if (skeletonTimedOut) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-6">
                    <p className="text-3xl">⚠️</p>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Taking too long…</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        The page couldn&apos;t load in time. This may be a network or connectivity issue.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-5 py-2 rounded-lg bg-[#ff4400] text-white text-sm font-semibold hover:bg-[#e03c00] transition-colors"
                    >
                        Retry
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
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Couldn&apos;t load this song</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(songError as Error)?.message ?? 'An unexpected error occurred.'}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-5 py-2 rounded-lg bg-[#ff4400] text-white text-sm font-semibold hover:bg-[#e03c00] transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }
    if (!song) return notFound();

    const versions = song.song_versions || [];
    const currentVersion = versions[selectedVersionIndex];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                ? `Check out the song "${song.title}" by ${song.original_author} on Sacred Fire Songs`
                : `Check out the song "${song.title}" on Sacred Fire Songs`,
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
                toast.success('Link copied to clipboard!');
            } catch (err) {
                console.error('Could not copy text: ', err);
                toast.error('Failed to copy link');
            }
        }
    };

    // Helper for badge colors (could be moved to utils or globals)
    // REMOVED: local getCategoryColor - imported from uiUtils

    return (
        <div className="flex flex-col min-h-screen">
            {/* Mobile Header (Visible only on mobile < lg) */}
            <header style={{ top: 'var(--env-banner-height, 0px)', width: '100vw', maxWidth: '100vw' }} className="lg:hidden flex items-center px-4 py-2 sticky left-0 bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur-md z-30 border-b border-gray-200 dark:border-white/5 shadow-lg min-h-[56px]">
                {/* Title + Author — flex-1 min-w-0 constrains width */}
                <div className="flex-1 min-w-0 overflow-hidden py-0.5 mx-4">
                    {/* overflow-hidden clips; span is block so it fills the constrained width */}
                    <div className="overflow-hidden">
                        <span
                            ref={titleRef}
                            style={marqueeStyle}
                            className="font-black text-2xl text-[#ff4400] tracking-tight whitespace-nowrap block w-full"
                        >
                            {song.title}
                        </span>
                    </div>
                </div>
                {/* 3-dot menu — flex-none so it never shrinks */}
                <div className="flex-none flex items-center">
                    <button
                        onClick={() => setIsOverflowOpen(!isOverflowOpen)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        aria-label="More actions"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes marquee {
                    0%, 15% { transform: translateX(0); }
                    85%, 100% { transform: translateX(var(--scroll-amount)); }
                }
            `}} />

            <main className="flex-1 min-w-0 lg:overflow-y-auto overflow-y-visible bg-white dark:bg-gray-950">

                {/* Desktop Page Header (Title, Actions) - Visible only on desktop >= lg */}
                <div className="hidden lg:flex justify-between items-center px-8 py-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-950/50 sticky top-0 backdrop-blur-md z-10 transition-all">
                    {/* Title and Artist */}
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-[#ff4400] tracking-tight">{song.title}</h1>
                                <SongTechnicalBadges
                                    hasChords={song.has_chords}
                                    hasMelody={song.has_melody}
                                    hasPersonalRecording={hasPersonalRecording}
                                />
                            </div>
                            <SongMetadataPills
                                originalAuthor={song.original_author}
                                categories={categories}
                            />
                        </div>
                    </div>
                    {/* Action Buttons and User Profile */}
                    <div className="flex items-center gap-3">
                        {(song.owner_id === user?.id || isAdmin) && (
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-bold border border-red-500/20 transition-all"
                            >
                                <Trash2 className="w-4 h-4" /> <span className="hidden xl:inline">Delete</span>
                            </button>
                        )}
                        {(song.owner_id === user?.id || isAdmin) && (
                            <Link href={`/songs/${id}/edit`}>
                                <button className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-bold border border-gray-300 dark:border-gray-700 transition-all">
                                    <Edit2 className="w-4 h-4" /> <span className="hidden xl:inline">Edit</span>
                                </button>
                            </Link>
                        )}
                        {id && (
                            <button
                                onClick={() => setIsRehearsalDrawerOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold border border-indigo-500/20 transition-all active:scale-[0.98]"
                                title="Recordings"
                            >
                                <Mic className="w-4 h-4" /> <span className="hidden xl:inline">Recordings</span>
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
                                    toast('Sign in to manage playlists', {
                                        action: {
                                            label: 'Sign in →',
                                            onClick: () => { window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`; },
                                        },
                                        classNames: {
                                            actionButton: 'text-amber-400 text-xs font-bold hover:text-amber-300 transition-colors ml-2',
                                        },
                                    });
                                }}
                                aria-label="Add to playlist"
                                className="p-2 rounded-full transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <ListPlus className="w-5 h-5" strokeWidth={1.5} />
                            </button>
                        )}
                        <button
                            onClick={handleToggleFavorite}
                            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                            className={`p-2 rounded-full transition-all duration-300 ${isFav ? 'text-amber-400 heart-glow' : 'text-gray-500 dark:text-gray-400 hover:text-amber-400/60'}`}
                        >
                            <Heart className={`w-5 h-5 transition-all duration-200 ${isFav ? 'fill-amber-400' : ''}`} strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={handleShare}
                            aria-label="Share song"
                            title="Share song"
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <Share2 className="w-5 h-5" strokeWidth={1.5} />
                        </button>

                    </div>
                </div>

                <div className="max-w-5xl px-6 md:px-10 pb-6 md:pb-10 pt-4 md:pt-6 space-y-0">

                    {/* Mobile: Song Title, Author, Badges row */}
                     <div className="lg:hidden flex flex-col gap-4 mb-4">
                        <div className="flex-1 space-y-3">
                            <SongTechnicalBadges
                                hasChords={song.has_chords}
                                hasMelody={song.has_melody}
                                hasPersonalRecording={hasPersonalRecording}
                            />

                            <SongMetadataPills
                                originalAuthor={song.original_author}
                                categories={categories}
                            />
                        </div>
                    </div>

                    {/* Metadata Grid (Key, Capo, Tuning) */}
                    {(currentVersion?.key || currentVersion?.capo || (currentVersion?.tuning && currentVersion.tuning !== 'Standard')) && (
                        <div className="grid grid-cols-3 gap-6 py-6 border-y border-gray-200/30 dark:border-gray-800/30">
                            <div className="text-center space-y-2">
                                <p className="text-[10px] uppercase font-black text-gray-500 tracking-[0.25em]">KEY</p>
                                <p className="text-2xl font-mono font-bold text-amber-500">{currentVersion?.key || '-'}</p>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-[10px] uppercase font-black text-gray-500 tracking-[0.25em]">CAPO</p>
                                <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{currentVersion?.capo ? `${currentVersion.capo}nd fret` : '-'}</p>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-[10px] uppercase font-black text-gray-500 tracking-[0.25em]">TUNING</p>
                                <p className="text-base font-bold text-gray-700 dark:text-gray-300 tracking-wider">{currentVersion?.tuning || 'Standard'}</p>
                            </div>
                        </div>
                    )}

                    {/* Song Content (Lyrics/Chords) */}
                    <div className="pt-4 pb-12">
                        <SongDisplay
                            content={currentVersion?.content_chordpro || ''}
                            melodyNotation={currentVersion?.melody_notation || ''}
                            hasChords={song.has_chords}
                        />
                    </div>



                    <div className="h-20"></div>
                </div>

                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    title="Delete Song?"
                    message={`Are you sure you want to delete "${song.title}"? This action cannot be undone.`}
                    isDeleting={isDeleting}
                />
            </main>

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
                        className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 rounded-t-3xl shadow-2xl z-50 pb-safe-bottom lg:hidden animate-in slide-in-from-bottom duration-300 flex flex-col"
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
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate text-left">by {song.original_author || 'Traditional'}</p>
                            </div>
                        </div>

                        {/* Action options */}
                        <div className="py-2">
                            {/* Like / Favorite */}
                            <button
                                onClick={() => { handleToggleFavorite(); setIsOverflowOpen(false); }}
                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-left text-gray-700 dark:text-gray-300"
                            >
                                <Heart className={`w-5 h-5 ${isFav ? 'text-amber-500 fill-amber-500' : 'text-gray-400 dark:text-gray-500'}`} />
                                <span className="text-sm font-bold">{isFav ? 'Remove from Liked Songs' : 'Add to Liked Songs'}</span>
                            </button>

                            {/* Share */}
                            <button
                                onClick={() => { handleShare(); setIsOverflowOpen(false); }}
                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-left text-gray-700 dark:text-gray-300"
                            >
                                <Share2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <span className="text-sm font-bold">Share Song</span>
                            </button>

                            {/* Add to Playlist */}
                            {user ? (
                                id && (
                                    <PlaylistPicker
                                        compositionId={id as string}
                                        userId={user.id}
                                        label="Add to Playlist"
                                        triggerClassName="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-left rounded-none text-gray-700 dark:text-gray-300"
                                        iconClassName="w-5 h-5"
                                    />
                                )
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsOverflowOpen(false);
                                        toast('Sign in to manage playlists', {
                                            action: {
                                                label: 'Sign in →',
                                                onClick: () => { window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`; },
                                            },
                                            classNames: {
                                                actionButton: 'text-amber-400 text-xs font-bold hover:text-amber-300 transition-colors ml-2',
                                            },
                                        });
                                    }}
                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-left text-gray-700 dark:text-gray-300"
                                >
                                    <ListPlus className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm font-bold">Add to Playlist</span>
                                </button>
                            )}

                            {/* Record Rehearsal */}
                            <button
                                onClick={() => {
                                    setIsOverflowOpen(false);
                                    setIsRehearsalDrawerOpen(true);
                                }}
                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-left text-gray-700 dark:text-gray-300"
                            >
                                <Mic className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <span className="text-sm font-bold">Recordings</span>
                            </button>

                            {/* Edit */}
                            {(song.owner_id === user?.id || isAdmin) && (
                                <Link
                                    href={`/songs/${id}/edit`}
                                    onClick={() => setIsOverflowOpen(false)}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-gray-700 dark:text-gray-300"
                                >
                                    <Edit2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm font-bold">Edit Song</span>
                                </Link>
                            )}

                            {/* Delete */}
                            {(song.owner_id === user?.id || isAdmin) && (
                                <button
                                    onClick={() => { setIsOverflowOpen(false); setIsDeleteModalOpen(true); }}
                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-500/10 transition-colors text-red-500 text-left"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    <span className="text-sm font-bold">Delete Song</span>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Rehearsal Drawer Sheet */}
            {currentVersion && (
                <RehearsalDrawer
                    isOpen={isRehearsalDrawerOpen}
                    onClose={() => setIsRehearsalDrawerOpen(false)}
                    onOpen={() => setIsRehearsalDrawerOpen(true)}
                    songVersionId={currentVersion.id}
                    songTitle={song.title}
                    songAuthor={song.original_author || 'Traditional'}
                    youtubeUrl={currentVersion.youtube_url}
                    spotifyUrl={currentVersion.spotify_url}
                    soundcloudUrl={currentVersion.soundcloud_url}
                />
            )}
        </div>
    );
}
