import React from 'react';

interface MediaEmbedsProps {
    youtubeUrl?: string | null;
    spotifyUrl?: string | null;
    soundcloudUrl?: string | null;
}

const MediaEmbeds: React.FC<MediaEmbedsProps> = ({ youtubeUrl, spotifyUrl, soundcloudUrl }) => {
    if (!youtubeUrl && !spotifyUrl && !soundcloudUrl) return null;

    return (
        <div className="space-y-6 mt-8">
            {youtubeUrl && (
                <div className="bg-gray-100/50 dark:bg-black/20 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/5">
                    <div className="p-3 bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500 text-sm">play_circle</span>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">YouTube</h3>
                    </div>
                    <div className="aspect-video">
                        <iframe
                            width="100%"
                            height="100%"
                            src={getYouTubeEmbedUrl(youtubeUrl)}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            {soundcloudUrl && (
                <div className="bg-gray-100/50 dark:bg-black/20 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/5">
                    <div className="p-3 bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#ff5500] text-sm">cloud</span>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">SoundCloud</h3>
                    </div>
                    {/* SoundCloud embed logic often requires API call if just a track URL, 
                        but standard Embed URL works if user pastes embed src.
                        Assumption: User pastes full track URL, we might need to use standard visual widget 
                        via OEmbed or just iframe if they paste embed code. Let's try iframe with standard widget URL construction? 
                        The standard widget requires encoded URL: https://w.soundcloud.com/player/?url=[ENCODED_URL]
                    */}
                    <div className="h-[166px]">
                        <iframe
                            width="100%"
                            height="166"
                            scrolling="no"
                            frameBorder="no"
                            allow="autoplay"
                            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
                        ></iframe>
                    </div>
                </div>
            )}

            {spotifyUrl && (
                <div className="bg-gray-100/50 dark:bg-black/20 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/5">
                    <div className="p-3 bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1db954] text-sm">radio</span>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Spotify</h3>
                    </div>
                    <div className="h-[152px]">
                        {/* Spotify Embed requires converting open.spotify.com/track/ID to open.spotify.com/embed/track/ID */}
                        <iframe
                            style={{ borderRadius: '12px' }}
                            src={getSpotifyEmbedUrl(spotifyUrl)}
                            width="100%"
                            height="152"
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper: Convert YouTube URL to Embed URL
function getYouTubeEmbedUrl(url: string): string {
    // If it's already an embed URL, return it
    if (url.includes('/embed/')) return url;

    let videoId = '';
    // Standard watch?v=
    const vMatch = url.match(/[?&]v=([^&]+)/);
    if (vMatch) videoId = vMatch[1];

    // Short youtu.be/
    if (!videoId) {
        const shortMatch = url.match(/youtu\.be\/([^?]+)/);
        if (shortMatch) videoId = shortMatch[1];
    }

    // Embed path
    if (!videoId) {
        const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
        if (embedMatch) videoId = embedMatch[1];
    }

    // Fallback: assume the whole string is an ID if it's short and no slashes?
    // Or just default to empty if not found.
    if (!videoId && !url.includes('/')) videoId = url;

    return `https://www.youtube.com/embed/${videoId}`;
}

// Helper: Convert Spotify URL to Embed URL
function getSpotifyEmbedUrl(url: string): string {
    // e.g. https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC
    // -> https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC

    if (url.includes('/embed/')) return url;

    try {
        const urlObj = new URL(url);
        // If path starts with /track, /album, /playlist, /artist
        // we just inject /embed after origin
        return `${urlObj.origin}/embed${urlObj.pathname}${urlObj.search}`;
    } catch (e) {
        // If invalid URL, return as is (might be just ID but spotify embed needs paths)
        return url;
    }
}


export default MediaEmbeds;
