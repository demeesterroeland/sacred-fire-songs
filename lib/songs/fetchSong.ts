/**
 * Song detail lookup for the client song page (app/songs/[id]/page.tsx).
 *
 * Returns null when no song has the id, so the page renders notFound();
 * real failures (network, timeout, RLS) throw, so the page offers Retry (#353).
 */
import { createClient } from '@/lib/supabase/client';
import { sortVersions } from '@/lib/songs/versionOrder';
import { SONG_SELECT } from '@/lib/songs/songSelect';

// Enforce a timeout on any promise to prevent infinite loading skeletons
export function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage = "Request timed out"): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(errorMessage));
        }, ms);

        promise
            .then((res) => {
                clearTimeout(timer);
                resolve(res);
            })
            .catch((err) => {
                clearTimeout(timer);
                reject(err);
            });
    });
}

export const fetchSong = async (id: string) => {
    const supabase = createClient();
    const queryPromise = supabase
        .from('compositions')
        .select(SONG_SELECT)
        .eq('id', id)
        .maybeSingle();

    // Wrap query with a dynamic timeout (4.5s in production, 15s in development/testing)
    const isProd = process.env.NODE_ENV === "production";
    const timeoutMs = isProd ? 4500 : 15000;
    const { data, error } = (await withTimeout(
        Promise.resolve(queryPromise), 
        timeoutMs, 
        "The database took too long to respond. This might be due to connection pool limits. Please try again."
    )) as { data: any; error: any };

    if (error) throw error;
    // Story 6.1.11 (#395, UXA-049): one stable order (original, variants, translations; each oldest first, id as tiebreak) for the version switch.
    if (data && Array.isArray(data.song_versions)) {
        data.song_versions = sortVersions(data.song_versions);
    }
    return data;
};
