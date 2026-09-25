'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export type UserRole = 'admin' | 'gatekeeper' | 'musician' | 'member' | 'guest';

export interface AuthUser {
    id: string;
    email?: string;
    role: UserRole;
    full_name?: string;
    avatar_url?: string;
}

export const useAuth = (initialUser: AuthUser | null = null) => {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<AuthUser | null>(initialUser);
    const [loading, setLoading] = useState(false); // Server provides authoritative initial state

    const loadUser = async (signal?: { cancelled: boolean }) => {
        const supabase = createClient();
        const AUTH_TIMEOUT_MS = 5000;

        try {
            // Get session
            const { data: { session } } = await supabase.auth.getSession();
            const sessionUser = session?.user ?? null;

            if (signal?.cancelled) return;

            if (sessionUser) {
                // Instantly set basic user state to eliminate header flash
                setUser((prev) => prev || {
                    id: sessionUser.id,
                    email: sessionUser.email,
                    role: (sessionUser.user_metadata?.role as UserRole) || 'member',
                    full_name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0],
                    avatar_url: sessionUser.user_metadata?.avatar_url,
                });

                // Fetch full DB profile non-blockingly
                const profileResult = await Promise.race([
                    supabase.from('profiles').select('role, full_name, avatar_url').eq('id', sessionUser.id).maybeSingle(),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('useAuth: profile timeout')), AUTH_TIMEOUT_MS)
                    ),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ]).catch(() => null) as any;

                if (signal?.cancelled) return;

                const profile = profileResult?.data;
                setUser({
                    id: sessionUser.id,
                    email: sessionUser.email,
                    role: profile?.role || (sessionUser.user_metadata?.role as UserRole) || 'member',
                    full_name: profile?.full_name || sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0],
                    avatar_url: profile?.avatar_url || sessionUser.user_metadata?.avatar_url,
                });
            } else {
                setUser(null);
            }
        } catch (err) {
            if (signal?.cancelled) return;
            console.warn('[useAuth] Auth resolution failed — falling back to guest mode.', err);
            setUser(null);
        }

        if (!signal?.cancelled) setLoading(false);
    };

    // Initialize state and handle auth events
    useEffect(() => {
        const signal = { cancelled: false };
        const supabase = createClient();

        // Listen for Supabase auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (!signal.cancelled) {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                    // Only reload if the state fundamentally changed to avoid unnecessary queries
                    loadUser(signal);
                } else if (event === 'SIGNED_OUT') {
                    queryClient.clear();
                    setUser(null);
                    setLoading(false);
                }
            }
        });

        // If we didn't get a server user, or if we want to guarantee the profile is fresh, 
        // we can still trigger a background load, but it won't block or flash.
        if (!initialUser) {
            loadUser(signal);
        }

        return () => {
            signal.cancelled = true;
            subscription.unsubscribe();
        };
    }, []);

    const quickLogin = async (email: string) => {
        setLoading(true);
        const supabase = createClient();

        const devPassword = process.env.NEXT_PUBLIC_DEV_TEST_PASSWORD;

        if (!devPassword) {
            console.error('Quick login failed: NEXT_PUBLIC_DEV_TEST_PASSWORD not set in environment.');
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: devPassword
        });

        if (error) {
            console.error('Quick login failed:', error.message);
            setLoading(false);
            return;
        }

        await loadUser();
    };

    const logout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();

        queryClient.clear();
        setUser(null);
    };

    return { user, loading, quickLogin, logout };
};
