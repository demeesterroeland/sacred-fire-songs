'use client';

interface YouTubeEmbedProps {
    videoId: string;
}

export default function YouTubeEmbed({ videoId }: YouTubeEmbedProps) {
    return (
        <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Listen on YouTube</span>
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative border border-gray-300 dark:border-gray-700 shadow-2xl">
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}
