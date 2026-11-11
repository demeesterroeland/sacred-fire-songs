import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

type Env = Record<string, string | undefined>;

/**
 * Server-only Supabase client with the project's secret (service role) key.
 *
 * Only for the few database calls that must never run with a user's session, such as
 * claiming a share e-mail (`lib/actions/notifications.ts`). Never import this from a
 * client component: the key bypasses row-level security. Returns null when
 * `SUPABASE_SECRET_KEY` is not set, so those features switch off cleanly.
 */
export function createAdminClient(env: Env = process.env): SupabaseClient | null {
    if (typeof window !== "undefined") {
        throw new Error("createAdminClient must only run on the server.");
    }
    const key = env.SUPABASE_SECRET_KEY?.trim();
    const url = (env.NODE_ENV === "development"
        ? env.NEXT_PUBLIC_SUPABASE_URL_DEV
        : env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
    if (!key || !url) return null;
    return createSupabaseClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
}
