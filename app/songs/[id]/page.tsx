'use client';

import { useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/context/SidebarContext';
import SongDisplay from '@/components/song/SongDisplay';
import SongDetailSkeleton from '@/components/song/SongDetailSkeleton';
import MediaEmbeds from '@/components/song/MediaEmbeds';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Edit2, ArrowLeft, Lock as LockIcon, Music, Link as LinkIcon, Flame, IndentIncrease } from 'lucide-react';
import { UserProfile } from '@/components/common/navigation/UserProfile';
import { getCategoryColor, getCategoryStyles } from '@/lib/uiUtils';

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
    const queryClient = useQueryClient();
    const router = useRouter();
    const id = typeof params.id === 'string' ? params.id : params.id?.[0]; // Safe type handling

    const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { user, loading: authLoading } = useAuth();
    const { setIsOpen } = useSidebar();
    const isAdmin = user?.role === 'admin';

    // The Query Hook
    const { data: song, isLoading: songLoading } = useQuery({
        queryKey: ['song', id],
        queryFn: () => fetchSong(id!),
        enabled: !!id,
    });

    if (songLoading || authLoading) return <SongDetailSkeleton />;
    if (!song) return notFound();

    const versions = song.song_versions || [];
    const currentVersion = versions[selectedVersionIndex];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = song.song_category_map?.map((map: any) => map.categories) || [];

    const handleDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        const supabase = createClient();
        // Direct Client-Side Delete (bypasses Server Action auth issues for Mock Users)
        const { error } = await supabase
            .from('compositions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete Error:', error);
            alert('Failed to delete song: ' + error.message);
            setIsDeleting(false);
            return;
        }

        // Invalidate the song list cache so it re-fetches
        await queryClient.invalidateQueries({ queryKey: ['songs'] });

        // Success: Redirect to Home
        router.refresh(); // Refresh Server Components if any
        router.push('/');
    };

    // Helper for badge colors (could be moved to utils or globals)
    // REMOVED: local getCategoryColor - imported from uiUtils

    return (
        <div className="flex flex-col min-h-screen">
            {/* Mobile Header (Visible only on mobile < lg) */}
            <header className="lg:hidden flex justify-between items-center px-4 py-3 sticky top-0 bg-gray-900/95 backdrop-blur-md z-30 border-b border-white/5 shadow-lg">
                <div className="flex items-center gap-3">
                    {/* Menu Trigger */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-1.5 pr-3 rounded-xl hover:bg-gray-800 group shrink-0 border border-transparent hover:border-gray-700"
                    >
                        <IndentIncrease className="w-7 h-7" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity hidden sm:inline">Menu</span>
                    </button>

                    <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/30 ring-1 ring-white/10 shrink-0">
                        <Flame className="text-white w-5 h-5 fill-current" />
                    </div>
                    <h1 className="font-bold text-base tracking-tight text-white truncate">Sacred Fire Songs</h1>
                </div>
                {/* Action Buttons and User Profile (Mobile) */}
                <div className="flex items-center gap-2">
                    {(song.owner_id === user?.id || isAdmin) && (
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/20 transition-all"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                    {(song.owner_id === user?.id || isAdmin) && (
                        <Link href={`/songs/${id}/edit`}>
                            <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg border border-gray-700 transition-all">
                                <Edit2 className="w-5 h-5" />
                            </button>
                        </Link>
                    )}
                    <Link href="/" className="p-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <UserProfile layout="header" showText={false} />
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
                        <Link href="/" className="p-2 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="border-l border-gray-800/50 pl-3 ml-1">
                            <UserProfile layout="header" showText={false} />
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl p-6 md:p-10 space-y-0">

                    {/* Mobile: Song Title, Badges, and Action Buttons Row (md:hidden but we use lg:hidden to match header switch) */}
                    <div className="lg:hidden flex flex-col gap-4 mb-6">
                        <div className="flex-1 space-y-3">
                            {/* Title and Badges */}
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-4xl font-black text-[#ff4400] tracking-tight">{song.title}</h1>
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
                            {/* Artist */}
                            <p className="text-gray-400 text-base font-medium">by {song.original_author || 'Traditional'}</p>
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
