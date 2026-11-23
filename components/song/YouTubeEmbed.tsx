'use client';

interface YouTubeEmbedProps {
    videoId: string;
}

export default function YouTubeEmbed({ videoId }: YouTubeEmbedProps) {
    return (
        <div className="mt-8 border-t border-line pt-6">
            <span className="text-meta font-semibold text-fg-muted mb-3 block">Listen on YouTube</span>
            <div className="w-full aspect-video bg-surface-2 rounded-panel overflow-hidden relative border border-line">
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
