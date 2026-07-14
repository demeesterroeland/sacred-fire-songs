/**
 * Shared two-line card content used by PlaylistCard, SmartPlaylistCard, and ArtistCard.
 * Line 1: title · description
 * Line 2: subtitle (e.g. song counts) | song title previews
 */
interface CardContentProps {
    title: string;
    description?: string | null;
    subtitle: React.ReactNode;
    songTitles?: string[];
}

export function CardContent({ title, description, subtitle, songTitles = [] }: CardContentProps) {
    return (
        <div className="flex-1 min-w-0">
            <p className="truncate">
                <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {title}
                </span>
                {description && (
                    <span className="ml-2 text-xs font-normal text-gray-500">· {description}</span>
                )}
            </p>
            <div className="mt-0.5 text-xs text-gray-500 truncate">
                {subtitle}
                {songTitles.length > 0 && (
                    <>
                        <span className="mx-1.5 text-gray-700">|</span>
                        <span className="text-gray-600">{songTitles.join(', ')}</span>
                    </>
                )}
            </div>
        </div>
    );
}
