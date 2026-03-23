'use client';

export default function SongDetailSkeleton() {
    return (
        <main className="flex-1 p-6 text-gray-900 dark:text-white overflow-hidden animate-pulse">
            <div className="space-y-4">
                {/* Title Skeleton */}
                <div className="h-8 bg-gray-300/50 dark:bg-gray-700/50 rounded-full w-3/4"></div>
                {/* Author Skeleton */}
                <div className="h-4 bg-gray-300/30 dark:bg-gray-700/30 rounded-full w-1/3"></div>
            </div>

            <div className="mt-8 space-y-6">
                {/* Lyric Lines Skeletons */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                        {/* Chord placeholders */}
                        <div className="flex gap-4">
                            <div className="h-3 bg-red-900/20 rounded w-8"></div>
                            <div className="h-3 bg-red-900/20 rounded w-6"></div>
                        </div>
                        {/* Text placeholder */}
                        <div className="h-4 bg-gray-300/20 dark:bg-gray-700/20 rounded-full w-full"></div>
                    </div>
                ))}
            </div>
        </main>
    );
}
