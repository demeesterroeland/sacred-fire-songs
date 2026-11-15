import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { shouldRedirectToLogin } from "@/lib/supabase/routeAccess";
import { RETURN_PATH_HEADER, loginRedirectHref, returnPath } from "@/lib/auth/guestGate";

export async function updateSession(request: NextRequest) {
    // #600: Server Components get the current path + query, to build a sign-in link with next=.
    // Rebuilt from request.headers each time, so refreshed session cookies are forwarded too.
    const here = returnPath(request.nextUrl.pathname, request.nextUrl.search);
    const forwardedRequest = () => {
        const headers = new Headers(request.headers);
        headers.set(RETURN_PATH_HEADER, here);
        return { headers };
    };
    let supabaseResponse = NextResponse.next({
        request: forwardedRequest(),
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
                        request: forwardedRequest(),
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
        // #600: keep the page (path + query) in next= so the guest returns there after signing in.
        return NextResponse.redirect(new URL(loginRedirectHref(request.nextUrl.pathname, request.nextUrl.search), request.url));
    }

    return supabaseResponse;
}
