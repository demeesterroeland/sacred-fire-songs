'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe, Lock, Loader2 } from 'lucide-react';
import { createPlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function CreatePlaylistPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [title, setTitle] = useState('');
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus the title input
    useEffect(() => {
        // Small delay to ensure the page has rendered
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }, []);

    // Redirect guests to login
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login?message=Please log in to create playlists');
        }
    }, [loading, user, router]);

    const handleCreate = () => {
        const trimmed = title.trim();
        if (!trimmed) {
            toast.error('Please enter a playlist name');
            inputRef.current?.focus();
            return;
        }

        startTransition(async () => {
            const result = await createPlaylist(trimmed);
            if ('error' in result) {
                toast.error(result.error);
            } else {
                toast.success('Playlist created');
                router.push(`/library/playlists/${result.id}`);
            }
        });
    };

    if (loading) return null;

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <Link
                        href="/library/playlists"
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors shrink-0"
                        aria-label="Back to playlists"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <input
                            ref={inputRef}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleCreate();
                                if (e.key === 'Escape') router.push('/library/playlists');
                            }}
                            placeholder="Playlist name…"
                            className="w-full bg-transparent text-xl font-bold text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none border-b border-gray-300 dark:border-gray-700 focus:border-amber-500 pb-1 transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
                            <Lock className="w-3 h-3" />
                            Created as private — you can change this later
                        </p>
                    </div>
                </div>
            </div>

            {/* Create button */}
            <button
                onClick={handleCreate}
                disabled={isPending || !title.trim()}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating…
                    </>
                ) : (
                    'Create Playlist'
                )}
            </button>
        </div>
    );
}
