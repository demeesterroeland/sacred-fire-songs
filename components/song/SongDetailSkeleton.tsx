'use client';

export default function SongDetailSkeleton() {
    return (
        <div data-testid="song-skeleton" className="flex-1 p-6 text-fg overflow-hidden animate-pulse">
            <div className="space-y-4">
                {/* Title Skeleton */}
                <div className="h-8 bg-surface-2 rounded-full w-3/4"></div>
                {/* Author Skeleton */}
                <div className="h-4 bg-surface-2 rounded-full w-1/3"></div>
            </div>

            <div className="mt-8 space-y-6">
                {/* Lyric Lines Skeletons */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                        {/* Chord placeholders */}
                        <div className="flex gap-4">
                            <div className="h-3 bg-surface-2 rounded w-8"></div>
                            <div className="h-3 bg-surface-2 rounded w-6"></div>
                        </div>
                        {/* Text placeholder */}
                        <div className="h-4 bg-surface-2 rounded-full w-full"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
