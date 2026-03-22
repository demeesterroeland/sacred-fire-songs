'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SongDisplay from '@/components/song/SongDisplay';
import SongDetailSkeleton from '@/components/song/SongDetailSkeleton';
import MediaEmbeds from '@/components/song/MediaEmbeds';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import { useQuery } from '@tanstack/react-query';
import { Trash2, Edit2, ArrowLeft, Music, Link as LinkIcon, Heart, MoreHorizontal } from 'lucide-react';
import { useToggleFavorite } from '@/hooks/useToggleFavorite';
import { PlaylistPicker } from '@/components/playlists/PlaylistPicker';
import { useDeleteSong } from '@/hooks/useDeleteSong';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import { useWakeLock } from '@/hooks/useWakeLock';
import { UserProfile } from '@/components/common/navigation/UserProfile';
import { getCategoryColor, getCategoryStyles } from '@/lib/uiUtils';
import { recordSongView } from '@/app/actions/recordSongView';

// Standalone fetch function
const fetchSong = async (id: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
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
              slug
            )
          )
        `)
        .eq('id', id)
        .single();

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
    const { data: song, isLoading: songLoading } = useQuery({
        queryKey: SONG_KEYS.detail(id!),
        queryFn: () => fetchSong(id!),
        enabled: !!id,
    });

    // Favorites — shares cache with SongsPageContent
    const { data: favoriteIds = new Set<string>() } = useQuery({
        queryKey: SONG_KEYS.favorites(user?.id),
        queryFn: async () => {
            if (!user) return new Set<string>();
            const supabase = createClient();
            const { data: setlist } = await supabase
                .from('setlists').select('id')
                .eq('title', 'My Favorites').maybeSingle();
            if (!setlist) return new Set<string>();
            const { data: items } = await supabase
                .from('setlist_items')
                 
                .select('song_versions(composition_id)').eq('setlist_id', setlist.id);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new Set<string>((items ?? []).map((i: any) => i.song_versions?.composition_id).filter(Boolean));
        },
        enabled: !!user,
    });
    const { isFav, handleToggle: handleToggleFavorite } = useToggleFavorite(id!, favoriteIds.has(id!));

    if (songLoading || authLoading) return <SongDetailSkeleton />;
    if (!song) return notFound();

    const versions = song.song_versions || [];
    const currentVersion = versions[selectedVersionIndex];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = song.song_category_map?.map((map: any) => map.categories) || [];

    const handleDelete = async () => {
        if (!id) return;
        await deleteSong(id, { redirectTo: '/' });
    };

    // Helper for badge colors (could be moved to utils or globals)
    // REMOVED: local getCategoryColor - imported from uiUtils

    return (
        <div className="flex flex-col min-h-screen">
            {/* Mobile Header (Visible only on mobile < lg) */}
            <header className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 bg-gray-900/95 backdrop-blur-md z-30 border-b border-white/5 shadow-lg">
                <Link href="/" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-bold text-sm tracking-tight text-white truncate mx-4 flex-1 text-center">
                    {song.title}
                </h1>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleToggleFavorite}
                        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        className={`p-2 rounded-full transition-all duration-300 ${isFav ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400/60'}`}
                    >
                        <Heart className={`w-5 h-5 transition-all duration-200 ${isFav ? 'fill-amber-400' : ''}`} strokeWidth={1.5} />
                    </button>
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setIsOverflowOpen(!isOverflowOpen)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                aria-label="More actions"
                            >
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {isOverflowOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsOverflowOpen(false)} />
                                    <div className="absolute right-0 top-full mt-1 z-50 bg-gray-900 border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[180px]">
                                        {(song.owner_id === user?.id || isAdmin) && (
                                            <Link
                                                href={`/songs/${id}/edit`}
                                                onClick={() => setIsOverflowOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/50 transition-colors text-gray-300"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                <span className="text-sm font-medium">Edit</span>
                                            </Link>
                                        )}
                                        {(song.owner_id === user?.id || isAdmin) && (
                                            <button
                                                onClick={() => { setIsOverflowOpen(false); setIsDeleteModalOpen(true); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="text-sm font-medium">Delete</span>
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 min-w-0 overflow-y-auto bg-[#0b0f1a]">

                {/* Desktop Page Header (Title, Actions) - Visible only on desktop >= lg */}
                <div className="hidden lg:flex justify-between items-center px-8 py-4 border-b border-gray-800/50 bg-[#0d121f]/50 sticky top-0 backdrop-blur-md z-10 transition-all">
                    {/* Title and Artist */}
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-[#ff4400] tracking-tight">{song.title}</h1>
                                <div className="flex items-center gap-2">
                                    {song.has_chords && (
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm bg-amber-500/5 border border-amber-500/30 text-amber-500">
                                            <LinkIcon className="w-3 h-3" /> Chords
                                        </span>
                                    )}
                                    {song.has_melody && (
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm bg-emerald-500/5 border border-emerald-500/30 text-emerald-500">
                                            <Music className="w-3 h-3" /> Melody
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-gray-400 text-sm font-medium">by {song.original_author || 'Traditional'}</p>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {categories.map((cat: any) => {
                                    const color = getCategoryColor(cat.slug);
                                    const styles = getCategoryStyles(color);
                                    return (
                                        <span key={cat.slug} className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${styles.pill}`}>
                                            {cat.name}
                                        </span>
                                    );
                                })}
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
                                <Trash2 className="w-4 h-4" /> <span className="hidden xl:inline">Delete</span>
                            </button>
                        )}
                        {(song.owner_id === user?.id || isAdmin) && (
                            <Link href={`/songs/${id}/edit`}>
                                <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-bold border border-gray-700 transition-all">
                                    <Edit2 className="w-4 h-4" /> <span className="hidden xl:inline">Edit</span>
                                </button>
                            </Link>
                        )}
                        {user && id && (
                            <PlaylistPicker
                                compositionId={id}
                                userId={user.id}
                                triggerClassName="p-2"
                                iconClassName="w-[17px] h-[17px]"
                            />
                        )}
                        <button
                            onClick={handleToggleFavorite}
                            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                            className={`p-2 rounded-full transition-all duration-300 ${isFav ? 'text-amber-400 heart-glow' : 'text-gray-600 hover:text-amber-400/60'}`}
                        >
                            <Heart className={`w-5 h-5 transition-all duration-200 ${isFav ? 'fill-amber-400' : ''}`} strokeWidth={1.5} />
                        </button>
                        <Link href="/" className="p-2 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="border-l border-gray-800/50 pl-3 ml-1">
                            <UserProfile layout="header" showText={false} />
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl p-6 md:p-10 space-y-0">

                    {/* Mobile: Song Title, Author, Badges row */}
                    <div className="lg:hidden flex flex-col gap-4 mb-6">
                        <div className="flex-1 space-y-3">
                            {/* Title and Author Grouping */}
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-baseline gap-x-3">
                                    <h1 className="text-4xl font-black text-[#ff4400] tracking-tight">{song.title}</h1>
                                    <p className="text-gray-400 text-base font-medium">by {song.original_author || 'Traditional'}</p>
                                </div>
                            </div>

                            {/* Technical Badges (Chords/Melody) */}
                            <div className="flex items-center gap-2">
                                {song.has_chords && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm bg-amber-500/5 border border-amber-500/30 text-amber-500">
                                        <LinkIcon className="w-3 h-3" /> Chords
                                    </span>
                                )}
                                {song.has_melody && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm bg-emerald-500/5 border border-emerald-500/30 text-emerald-500">
                                        <Music className="w-3 h-3" /> Melody
                                    </span>
                                )}
                            </div>

                            {/* Category Tags */}
                            <div className="flex items-center gap-2">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {categories.map((cat: any) => {
                                    const color = getCategoryColor(cat.slug);
                                    const styles = getCategoryStyles(color);
                                    return (
                                        <span key={cat.slug} className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${styles.pill}`}>
                                            {cat.name}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Action Buttons (Mobile) */}
                        <div className="flex items-center gap-2">
                            {(song.owner_id === user?.id || isAdmin) && (
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-bold border border-red-500/20 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" /> <span className="sm:inline">Delete</span>
                                </button>
                            )}
                            {(song.owner_id === user?.id || isAdmin) && (
                                <Link href={`/songs/${id}/edit`}>
                                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-bold border border-gray-700 transition-all">
                                        <Edit2 className="w-4 h-4" /> <span className="sm:inline">Edit</span>
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Metadata Grid (Key, Capo, Tuning) */}
                    {(currentVersion?.key || currentVersion?.capo || (currentVersion?.tuning && currentVersion.tuning !== 'Standard')) && (
                        <div className="grid grid-cols-3 gap-6 py-6 border-y border-gray-800/30">
                            <div className="text-center space-y-2">
                                <p className="text-[10px] uppercase font-black text-gray-500 tracking-[0.25em]">KEY</p>
                                <p className="text-2xl font-mono font-bold text-amber-500">{currentVersion?.key || '-'}</p>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-[10px] uppercase font-black text-gray-500 tracking-[0.25em]">CAPO</p>
                                <p className="text-lg font-bold text-gray-300">{currentVersion?.capo ? `${currentVersion.capo}nd fret` : '-'}</p>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-[10px] uppercase font-black text-gray-500 tracking-[0.25em]">TUNING</p>
                                <p className="text-base font-bold text-gray-300 tracking-wider">{currentVersion?.tuning || 'Standard'}</p>
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

                    {/* Player Section */}
                    {(currentVersion?.youtube_url || currentVersion?.spotify_url || currentVersion?.soundcloud_url) && (
                        <div className="pt-8 border-t border-gray-800/50">
                            <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-6">Recordings</h3>
                            <div className="w-full aspect-video bg-black/40 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                                <MediaEmbeds
                                    youtubeUrl={currentVersion.youtube_url}
                                    spotifyUrl={currentVersion.spotify_url}
                                    soundcloudUrl={currentVersion.soundcloud_url}
                                />
                            </div>
                        </div>
                    )}

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
        </div>
    );
}
