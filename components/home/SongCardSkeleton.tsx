'use client';

export default function SongCardSkeleton() {
    return (
        <div className="bg-gray-200/20 dark:bg-gray-800/20 p-4 rounded-2xl border border-gray-200 dark:border-white/5 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="flex-1 space-y-3">
                    {/* Title Skeleton */}
                    <div className="h-4 bg-gray-300/50 dark:bg-gray-700/50 rounded-full w-2/3"></div>
                    {/* Author Skeleton */}
                    <div className="h-3 bg-gray-300/30 dark:bg-gray-700/30 rounded-full w-1/2"></div>
                </div>
                {/* Key Badge Skeleton */}
                <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="h-2 bg-gray-300/20 dark:bg-gray-700/20 rounded-full w-6"></div>
                    <div className="h-8 bg-gray-300/40 dark:bg-gray-700/40 rounded-lg w-10"></div>
                </div>
            </div>
        </div>
    );
}
