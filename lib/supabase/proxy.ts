import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    // List of routes that don't need authentication checks in the middleware
    const isPublicRoute =
        request.nextUrl.pathname === "/" ||
        request.nextUrl.pathname.startsWith("/auth") ||
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/notes") ||
        request.nextUrl.pathname.startsWith("/songs") ||
        request.nextUrl.pathname.startsWith("/explore") ||
        request.nextUrl.pathname.startsWith("/library") ||
        request.nextUrl.pathname.startsWith("/playlists");

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
        },
    );

    // This refreshes the session even if the route is public
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect to login if not authenticated and trying to access a protected route
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        url.searchParams.set('message', 'Please log in to access this page');
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
