'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Plus, ListMusic, Loader2, List } from 'lucide-react';
import Link from 'next/link';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import { getSetlists, createSetlist } from '@/app/actions/setlists';
import { Setlist } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SongCounts {
    total: number;
    public: number;
    draft: number;
}

function SongCountSubtitle({ counts, emptyLabel }: { counts?: SongCounts; emptyLabel: string }) {
    if (!counts || counts.total === 0) return <p className="text-xs text-gray-500 mt-0.5">{emptyLabel}</p>;
    return (
        <p className="text-xs text-gray-500 mt-0.5">
            {counts.total} song{counts.total !== 1 ? 's' : ''}
            {counts.public > 0 && (
                <>
                    {' · '}
                    <span className="text-emerald-500/70">{counts.public} public</span>
                </>
            )}
            {counts.draft > 0 && (
                <>
                    {' · '}
                    <span className="text-amber-500/70">{counts.draft} draft</span>
                </>
            )}
        </p>
    );
}

export default function SetlistManager({ initialSetlists = [] }: { initialSetlists?: Setlist[] }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const queryClient = useQueryClient();

    const { data: setlists, isLoading } = useQuery({
        queryKey: SONG_KEYS.setlists(),
        queryFn: async () => {
            const result = await getSetlists();
            if ('error' in result) throw new Error(result.error);
            return result.setlists;
        },
        initialData: initialSetlists,
        staleTime: 60 * 60 * 1000, // 1 hour
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            const result = await createSetlist(newTitle, newDescription);
            if ('error' in result) throw new Error(result.error);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SONG_KEYS.allSetlists() });
            toast.success('Playlist created at the fire');
            setIsCreateModalOpen(false);
            setNewTitle('');
            setNewDescription('');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create playlist');
        },
    });

    const otherSetlists = (setlists ?? []).filter(s => s.title !== 'My Favorites');

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        createMutation.mutate();
    };

    if (isLoading && !setlists) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                <p>Gathering your hearth...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Actions */}
            <div className="flex justify-end">
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                            <Plus className="w-4 h-4" />
                            Create Playlist
                        </button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-950 border-emerald-500/30 text-white">
                        <form onSubmit={handleCreateSubmit}>
                            <DialogHeader>
                                <DialogTitle>New Playlist</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Give your collection a name and a description.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Ceremony - Equinox 2024"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="bg-gray-900 border-gray-800"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        placeholder="Songs for the opening circle..."
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        className="bg-gray-900 border-gray-800"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending || !newTitle.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-500"
                                >
                                    {createMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Plus className="w-4 h-4 mr-2" />
                                    )}
                                    Create at the Fire
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* My Favorites — smart playlist, always shown */}
            <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Smart Playlist</p>
                <Link href="/songs?favorites=true">
                    <div className="bg-amber-500/8 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4 group hover:bg-amber-500/15 hover:border-amber-500/35 transition-all hover:-translate-y-0.5">
                        <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center group-hover:bg-amber-500/25 transition-colors shrink-0">
                            <Heart className="w-6 h-6 text-amber-400 fill-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-100 group-hover:text-white transition-colors">My Favorites</h3>
                            <SongCountSubtitle emptyLabel="No songs yet — tap ♥ on any song" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Other user setlists (real) */}
            <div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">My Playlists</p>
                {otherSetlists.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {otherSetlists.map(setlist => (
                            <Link key={setlist.id} href={`/library/playlists/${setlist.id}`}>
                                <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex items-center gap-4 group cursor-pointer hover:bg-gray-800/60 transition-all hover:-translate-y-0.5">
                                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-gray-700 transition-colors shrink-0">
                                        <ListMusic className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-100 group-hover:text-white transition-colors">{setlist.title}</h3>
                                        <SongCountSubtitle emptyLabel={setlist.description || 'No songs yet'} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-900/20 border border-dashed border-gray-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center mb-3">
                            <List className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-500 max-w-xs">Your personal playlists will gather here. Create one to organize your medicine.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
