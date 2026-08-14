'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export type UserRole = 'admin' | 'gatekeeper' | 'musician' | 'member' | 'guest';

// For Local Dev - Mock Users Configuration (using valid UUIDs for DB compatibility)
export const MOCK_USERS = {
    'guest': null,
    'mock-member': {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'member@mock.com',
        role: 'member' as UserRole,
        full_name: 'Mock Member',
        avatar_url: undefined
    },
    'mock-musician': {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'musician@mock.com',
        role: 'musician' as UserRole,
        full_name: 'Mock Musician',
        avatar_url: undefined
    },
    'mock-admin': {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'admin@mock.com',
        role: 'admin' as UserRole,
        full_name: 'Mock Admin',
        avatar_url: undefined
    },
    'mock-gatekeeper': {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'gatekeeper@mock.com',
        role: 'gatekeeper' as UserRole,
        full_name: 'Mock Gatekeeper',
        avatar_url: undefined
    },
};

export interface AuthUser {
    id: string;
    email?: string;
    role: UserRole;
    full_name?: string;
    avatar_url?: string;
}

export const useAuth = () => {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [mockRole, setMockRole] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('mockUserRole');
    });

    const loadUser = async (currentMockRole: string | null, signal?: { cancelled: boolean }) => {
        // A. If Mock Role is active and valid, use it
        if (currentMockRole && MOCK_USERS[currentMockRole as keyof typeof MOCK_USERS]) {
            if (signal?.cancelled) return;
            const mockData = MOCK_USERS[currentMockRole as keyof typeof MOCK_USERS];
            setUser(mockData as AuthUser);
            setLoading(false);
            return;
        }

        // B. If 'guest' is explicitly selected
        if (currentMockRole === 'guest') {
            if (signal?.cancelled) return;
            setUser(null);
            setLoading(false);
            return;
        }

        // C. Fast Auth Resolution: Check session locally from storage first for instant (<10ms) hydration
        const supabase = createClient();
        const AUTH_TIMEOUT_MS = 5000;

        try {
            // 1. Instantly check local session token
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
                setLoading(false);

                // 2. Fetch full DB profile non-blockingly / in parallel
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
        // Cancellation token: prevents stale loadUser calls from updating state
        const signal = { cancelled: false };
        const supabase = createClient();

        // Listen for Supabase auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (!signal.cancelled && !localStorage.getItem('mockUserRole')) {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                    loadUser(null, signal);
                } else if (event === 'SIGNED_OUT') {
                    queryClient.clear();
                    setUser(null);
                    setLoading(false);
                }
            }
        });

        // Load user immediately on mount
        loadUser(mockRole, signal);

        // Listen for custom event to trigger re-render on role switch
        const handleRoleChange = () => {
            if (!signal.cancelled) {
                const newRole = localStorage.getItem('mockUserRole');
                setMockRole(newRole);
                loadUser(newRole, signal);
            }
        };

        window.addEventListener('auth-role-change', handleRoleChange);

        return () => {
            signal.cancelled = true; // Cancel any in-flight loadUser calls
            subscription.unsubscribe();
            window.removeEventListener('auth-role-change', handleRoleChange);
        };
    }, [mockRole]);



    const switchMockRole = (roleKey: string | null) => {
        if (roleKey) {
            localStorage.setItem('mockUserRole', roleKey);
        } else {
            localStorage.removeItem('mockUserRole');
        }
        // Dispatch event so other components update immediately
        window.dispatchEvent(new Event('auth-role-change'));
    };

    const quickLogin = async (email: string) => {
        setLoading(true);
        const supabase = createClient();

        // 1. Clear any existing mock roles
        localStorage.removeItem('mockUserRole');
        setMockRole(null);

        // 2. Perform real sign in
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

        // 3. Reload user data
        await loadUser(null);

        // 4. Notify other components
        window.dispatchEvent(new Event('auth-role-change'));
    };

    const logout = async () => {
        // 1. Clear Mock Role
        localStorage.removeItem('mockUserRole');

        // 2. Clear Real Auth
        const supabase = createClient();
        await supabase.auth.signOut();

        // 3. Purge React Query cache
        queryClient.clear();

        // 4. Force "guest" state
        setUser(null);
        setMockRole(null);

        // 5. Notify components
        window.dispatchEvent(new Event('auth-role-change'));
    };

    return { user, loading, mockRole, switchMockRole, quickLogin, logout };
}
