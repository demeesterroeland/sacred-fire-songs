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
                <span className="font-semibold text-fg transition-colors">
                    {title}
                </span>
                {description && (
                    <span className="ml-2 text-caption font-normal text-fg-muted">· {description}</span>
                )}
            </p>
            <div className="mt-0.5 text-caption text-fg-muted truncate">
                {subtitle}
                {songTitles.length > 0 && (
                    <>
                        <span className="mx-1.5 text-fg-subtle">|</span>
                        <span className="text-fg-muted">{songTitles.join(', ')}</span>
                    </>
                )}
            </div>
        </div>
    );
}
