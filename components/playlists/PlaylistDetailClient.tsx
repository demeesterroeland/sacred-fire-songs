'use client';

// Stub — full implementation in Task 11

export interface PlaylistItem {
    id: string;
    songTitle: string;
    songAuthor: string;
    songId: string;
}

interface PlaylistDetailClientProps {
    playlistId: string;
    initialItems: PlaylistItem[];
}

export function PlaylistDetailClient({ initialItems }: PlaylistDetailClientProps) {
    return (
        <div className="space-y-2">
            {initialItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-4 bg-gray-900/40 border border-gray-800 rounded-xl">
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-100 truncate">{item.songTitle}</p>
                        <p className="text-xs text-gray-500 truncate">{item.songAuthor}</p>
                    </div>
                </div>
            ))}
            {initialItems.length === 0 && (
                <p className="text-sm text-gray-600 italic py-4 text-center">No songs yet — add some from the song library.</p>
            )}
        </div>
    );
}
