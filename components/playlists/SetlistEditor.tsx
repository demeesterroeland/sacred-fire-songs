'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, Trash2, Music, ChevronLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Setlist, SetlistItem } from '@/types';
import { removeSongFromSetlist, updateSetlistItemOrder, getSetlistDetail } from '@/app/actions/setlists';
import { SONG_KEYS } from '@/lib/songs/queryKeys';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SetlistEditorProps {
    initialSetlist: Setlist;
}

export default function SetlistEditor({ initialSetlist }: SetlistEditorProps) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: setlist, isLoading } = useQuery({
        queryKey: SONG_KEYS.setlistDetail(initialSetlist.id),
        queryFn: async () => {
            const result = await getSetlistDetail(initialSetlist.id);
            if ('error' in result) throw new Error(result.error);
            return result.setlist as Setlist;
        },
        initialData: initialSetlist,
        staleTime: 60 * 60 * 1000, // 1 hour
    });

    const [items, setItems] = useState<SetlistItem[]>(setlist.items || []);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setItems(setlist.items || []);
        setHasChanges(false);
    }, [setlist.items]);

    const handleReorder = (newOrder: SetlistItem[]) => {
        setItems(newOrder);
        setHasChanges(true);
    };

    const handleRemove = async (itemId: string) => {
        const confirmRemove = confirm('Remove this song from the playlist?');
        if (!confirmRemove) return;

        const result = await removeSongFromSetlist(itemId);
        if ('error' in result) {
            toast.error(result.error);
        } else {
            queryClient.invalidateQueries({ queryKey: SONG_KEYS.setlistDetail(setlist.id) });
            toast.success('Removed from playlist');
        }
    };

    const handleSaveOrder = async () => {
        setIsSaving(true);
        const updates = items.map((item, index) => ({
            id: item.id,
            order_index: index,
        }));

        const result = await updateSetlistItemOrder(setlist.id, updates);
        setIsSaving(false);

        if ('error' in result) {
            toast.error(result.error);
        } else {
            queryClient.invalidateQueries({ queryKey: SONG_KEYS.setlistDetail(setlist.id) });
            toast.success('Order saved to the hearth');
            setHasChanges(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/library/playlists" className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{setlist.title}</h1>
                        <p className="text-sm text-gray-500">{setlist.description || 'No description'}</p>
                    </div>
                </div>
                
                {hasChanges && (
                    <Button 
                        onClick={handleSaveOrder} 
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save New Order
                    </Button>
                )}
            </div>

            {/* List */}
            {items.length > 0 ? (
                <Reorder.Group 
                    axis="y" 
                    values={items} 
                    onReorder={handleReorder}
                    className="space-y-3"
                >
                    {items.map((item) => (
                        <ReorderItem 
                            key={item.id} 
                            item={item} 
                            onRemove={() => handleRemove(item.id)} 
                        />
                    ))}
                </Reorder.Group>
            ) : (
                <div className="bg-gray-900/20 border border-dashed border-gray-800 p-12 rounded-3xl flex flex-col items-center justify-center text-center">
                    <Music className="w-12 h-12 text-gray-700 mb-4" />
                    <p className="text-gray-500">This playlist is currently empty.</p>
                    <Link href="/songs" className="text-emerald-500 hover:underline mt-2">Browse songs to add some</Link>
                </div>
            )}
        </div>
    );
}

function ReorderItem({ item, onRemove }: { item: SetlistItem; onRemove: () => void }) {
    const controls = useDragControls();
    const song = item.song_version;

    return (
        <Reorder.Item
            value={item}
            dragListener={false}
            dragControls={controls}
            className="bg-gray-900/40 border border-gray-800 p-4 rounded-2xl flex items-center gap-4 group hover:bg-gray-800/60 transition-colors"
        >
            <div 
                onPointerDown={(e) => controls.start(e)}
                className="cursor-grab active:cursor-grabbing p-1 text-gray-600 hover:text-gray-400 transition-colors shrink-0"
            >
                <GripVertical className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-100 truncate">
                    {song?.version_name === 'Standard' ? '' : `[${song?.version_name}] `}
                    {(song as any)?.composition?.title || 'Unknown Song'}
                </h3>
                <p className="text-xs text-gray-500">Key: {song?.key || '-'} · Capo: {song?.capo || '0'}</p>
            </div>

            <button 
                onClick={onRemove}
                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                aria-label="Remove from playlist"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </Reorder.Item>
    );
}
