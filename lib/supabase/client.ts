import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    const isDev = process.env.NODE_ENV === "development";
    const url = typeof window !== 'undefined'
        ? `${window.location.origin}/supabase-api`
        : (isDev
            ? process.env.NEXT_PUBLIC_SUPABASE_URL_DEV!
            : process.env.NEXT_PUBLIC_SUPABASE_URL!);
    const anonKey = isDev
        ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEV!
        : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    return createBrowserClient(url, anonKey, {
        cookieOptions: {
            name: "sb-auth-token",
        },
    });
}