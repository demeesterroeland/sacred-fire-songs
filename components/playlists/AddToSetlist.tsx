'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListPlus, Check, Loader2 } from 'lucide-react';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import { getSetlists, addSongToSetlist } from '@/app/actions/setlists';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface AddToSetlistProps {
    songVersionId: string;
    className?: string;
}

export default function AddToSetlist({ songVersionId, className }: AddToSetlistProps) {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const { data: setlists, isLoading } = useQuery({
        queryKey: SONG_KEYS.setlists(),
        queryFn: async () => {
            const result = await getSetlists();
            if ('error' in result) throw new Error(result.error);
            return result.setlists;
        },
        enabled: isOpen,
    });

    const addMutation = useMutation({
        mutationFn: async (setlistId: string) => {
            const result = await addSongToSetlist(setlistId, songVersionId);
            if ('error' in result) throw new Error(result.error);
            return result;
        },
        onSuccess: (_, setlistId) => {
            queryClient.invalidateQueries({ queryKey: SONG_KEYS.setlistDetail(setlistId) });
            toast.success('Added to your hearth');
            setIsOpen(false);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to add song');
        },
    });

    // Exclude "My Favorites" as it's handled by the heart button
    const playlists = (setlists ?? []).filter(s => s.title !== 'My Favorites');

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-all",
                        className
                    )}
                    aria-label="Add to setlist"
                >
                    <ListPlus className="w-5 h-5" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-950 border-gray-800 text-white">
                <DropdownMenuLabel>Add to Playlist</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                
                {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    </div>
                ) : playlists.length > 0 ? (
                    playlists.map((setlist) => (
                        <DropdownMenuItem
                            key={setlist.id}
                            onClick={() => addMutation.mutate(setlist.id)}
                            disabled={addMutation.isPending}
                            className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer"
                        >
                            {addMutation.isPending && addMutation.variables === setlist.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                            ) : (
                                <Check className="w-3.5 h-3.5 mr-2 opacity-0 group-hover:opacity-100" />
                            )}
                            <span className="truncate">{setlist.title}</span>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <div className="p-4 text-center text-xs text-gray-500">
                        <p>No playlists found.</p>
                        <Link href="/library/playlists" className="text-emerald-500 hover:underline mt-2 block">
                            Create one first
                        </Link>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Internal link component to avoid import cycles or missing components
import Link from 'next/link';
