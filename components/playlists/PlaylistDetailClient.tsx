'use client';

import { useState, useTransition, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Music, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { reorderPlaylistSongs, removeSongFromPlaylist } from '@/app/actions/playlistActions';
import { AddSongsSheet } from './AddSongsSheet';

export interface PlaylistItem {
    id: string;
    songTitle: string;
    songAuthor: string;
    songId: string;
}

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableRow({
    item,
    onRemove,
    disabled,
}: {
    item: PlaylistItem;
    onRemove: (id: string) => void;
    disabled?: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-3 bg-gray-900/40 border border-gray-800 rounded-xl group hover:bg-gray-800/60 hover:border-gray-700 transition-colors"
        >
            {/* Drag handle */}
            <button
                {...attributes}
                {...(disabled ? {} : listeners)}
                disabled={disabled}
                className="text-gray-700 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Drag to reorder"
            >
                <GripVertical className="w-4 h-4" />
            </button>

            {/* Song info */}
            <Link
                href={`/songs/${item.songId}`}
                className="flex-1 min-w-0 hover:text-amber-400 transition-colors"
                onClick={e => e.stopPropagation()}
            >
                <p className="text-sm font-medium text-gray-100 truncate">{item.songTitle}</p>
                <p className="text-xs text-gray-500 truncate">{item.songAuthor}</p>
            </Link>

            {/* Remove button */}
            <button
                onClick={() => onRemove(item.id)}
                disabled={disabled}
                className="text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 disabled:pointer-events-none"
                aria-label={`Remove ${item.songTitle} from playlist`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PlaylistDetailClient({
    playlistId,
    initialItems,
    isOwner,
}: {
    playlistId: string;
    initialItems: PlaylistItem[];
    isOwner: boolean;
}) {
    const [items, setItems] = useState(initialItems);
    const [isPending, startTransition] = useTransition();
    const [sheetOpen, setSheetOpen] = useState(false);

    // Sync when server refreshes (e.g. after adding/removing via sheet)
    useEffect(() => { setItems(initialItems); }, [initialItems]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);

        const prev = items;
        setItems(reordered); // optimistic

        startTransition(async () => {
            const result = await reorderPlaylistSongs(playlistId, reordered.map(i => i.id));
            if (result.error) {
                setItems(prev); // revert
                toast.error('Could not save order');
            }
        });
    };

    const handleRemove = (itemId: string) => {
        const prev = items;
        setItems(items.filter(i => i.id !== itemId)); // optimistic

        startTransition(async () => {
            const result = await removeSongFromPlaylist(itemId);
            if (result.error) {
                setItems(prev); // revert
                toast.error(result.error);
            }
        });
    };

    const existingCompositionIds = items.map(i => i.songId);

    if (items.length === 0) {
        return (
            <>
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <Music className="w-10 h-10 text-gray-700" />
                    <p className="text-gray-500 text-sm max-w-xs">No songs yet.</p>
                    {isOwner && (
                        <button
                            onClick={() => setSheetOpen(true)}
                            className="flex items-center gap-1.5 text-sm font-semibold text-amber-400 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 rounded-full px-4 py-1.5 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Songs
                        </button>
                    )}
                </div>
                {isOwner && (
                    <AddSongsSheet
                        playlistId={playlistId}
                        existingCompositionIds={existingCompositionIds}
                        open={sheetOpen}
                        onClose={() => setSheetOpen(false)}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={isOwner ? handleDragEnd : () => {}}>
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {items.map(item => (
                            <SortableRow
                                key={item.id}
                                item={item}
                                onRemove={handleRemove}
                                disabled={!isOwner || isPending}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Add more songs */}
            {isOwner && (
                <>
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={() => setSheetOpen(true)}
                            className="flex items-center gap-1.5 text-sm font-semibold text-amber-400 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 rounded-full px-4 py-1.5 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Songs
                        </button>
                    </div>
                    <AddSongsSheet
                        playlistId={playlistId}
                        existingCompositionIds={existingCompositionIds}
                        open={sheetOpen}
                        onClose={() => setSheetOpen(false)}
                    />
                </>
            )}
        </>
    );
}
