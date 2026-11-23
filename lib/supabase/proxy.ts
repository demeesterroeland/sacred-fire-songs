import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { shouldRedirectToLogin } from "@/lib/supabase/routeAccess";
import { LOGIN_REQUIRED_NOTICE } from "@/lib/auth/notice";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        (process.env.NODE_ENV === "development"
            ? process.env.NEXT_PUBLIC_SUPABASE_URL_DEV!
            : process.env.NEXT_PUBLIC_SUPABASE_URL!),
        (process.env.NODE_ENV === "development"
            ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEV!
            : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!),
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
            cookieOptions: {
                name: "sb-auth-token",
            },
        },
    );

    // This refreshes the session even if the route is public
    const { data: { user } } = await supabase.auth.getUser();

    // Only protected prefixes redirect a guest to login; unknown paths fall through to
    // app/not-found.tsx (see lib/supabase/routeAccess.ts).
    if (shouldRedirectToLogin(request.nextUrl.pathname, !!user)) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        url.searchParams.set('message', LOGIN_REQUIRED_NOTICE);
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
