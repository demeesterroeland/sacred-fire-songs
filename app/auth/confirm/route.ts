import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/safeNext";
import { authErrorPath, knownAuthCode } from "@/lib/auth/notice";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);

    // Log full URL and params for debugging in production/dev logs
    console.debug(`[Auth Confirm] Request received: ${request.url}`);

    const token_hash = searchParams.get("token_hash") || searchParams.get("token");
    const type = searchParams.get("type") as EmailOtpType | null;
    const code = searchParams.get("code");
    let next = searchParams.get("next");

    if (!next) {
        if (type === 'recovery') {
            next = "/auth/update-password";
        } else if (type === 'signup') {
            next = "/auth/finish-registration";
        } else {
            next = "/";
        }
    }

    const supabase = await createClient();

    // Helper to ensure we have a valid absolute URL for redirection
    // `next` is untrusted: only same-site paths survive (absolute same-origin URLs are reduced to their path).
    const getRedirectUrl = (baseUrl: string) => {
        let target = next!;
        if (/^https?:\/\//i.test(target)) {
            try {
                const abs = new URL(target);
                if (abs.origin !== origin && abs.origin !== baseUrl) return `${baseUrl}/`;
                target = abs.pathname + abs.search + abs.hash;
            } catch {
                return `${baseUrl}/`;
            }
        }
        // Ensure 'next' starts with /
        const path = safeNextPath(target.startsWith("/") ? target : `/${target}`);
        return `${baseUrl}${path}`;
    };

    const originBase = origin;
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development" || origin.includes("localhost");

    let baseUrl = originBase;
    if (forwardedHost && !isLocalEnv) {
        baseUrl = `https://${forwardedHost}`;
    } else if (forwardedHost && isLocalEnv) {
        baseUrl = `http://${forwardedHost}`;
    }

    // 1. Handle PKCE Code Exchange (Standard Next.js Flow)
    if (code) {
        console.debug(`[Auth Confirm] Exchanging code for session...`);
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(getRedirectUrl(baseUrl));
        }
        console.error(`[Auth Confirm] Code exchange error: ${error.message}`);
        return NextResponse.redirect(new URL(authErrorPath(knownAuthCode(error)), request.url));
    }

    // 2. Handle OTP/Token Hash Verification
    if (token_hash && type) {
        console.debug(`[Auth Confirm] Verifying OTP... type=${type}`);
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

        if (!error) {
            return NextResponse.redirect(getRedirectUrl(baseUrl));
        }
        console.error(`[Auth Confirm] OTP verification error: ${error.message}`);
        return NextResponse.redirect(new URL(authErrorPath(knownAuthCode(error)), request.url));
    }

    // 3. Fallback: No valid params found
    const availableParams = Array.from(searchParams.keys()).join(", ");
    console.error(`[Auth Confirm] Missing params. Available: ${availableParams}`);

    return NextResponse.redirect(new URL(authErrorPath("missing_params"), request.url));
}
