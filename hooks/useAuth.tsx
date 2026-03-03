'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export type UserRole = 'admin' | 'musician' | 'member' | 'guest';

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
};

export interface AuthUser {
    id: string;
    email?: string;
    role: UserRole;
    full_name?: string;
    avatar_url?: string;
}

export const useAuth = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [mockRole, setMockRole] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('mockUserRole');
    });

    const loadUser = async (currentMockRole: string | null) => {
        // A. If Mock Role is active and valid, use it
        if (currentMockRole && MOCK_USERS[currentMockRole as keyof typeof MOCK_USERS]) {
            const mockData = MOCK_USERS[currentMockRole as keyof typeof MOCK_USERS];
            setUser(mockData as AuthUser);
            setLoading(false);
            return;
        }

        // B. If 'guest' is explicitly selected
        if (currentMockRole === 'guest') {
            setUser(null);
            setLoading(false);
            return;
        }

        // C. Fallback to Real Supabase Auth
        const supabase = createClient();
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();

        if (supabaseUser) {
            // Fetch real profile data
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, full_name, avatar_url')
                .eq('id', supabaseUser.id)
                .maybeSingle();

            setUser({
                id: supabaseUser.id,
                email: supabaseUser.email,
                role: profile?.role || 'member',
                full_name: profile?.full_name,
                avatar_url: profile?.avatar_url
            });
        } else {
            setUser(null);
        }
        setLoading(false);
    };

    // Initialize state and handle auth events
    useEffect(() => {
        let mounted = true;
        const supabase = createClient();

        // Listen for Supabase auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (mounted && !localStorage.getItem('mockUserRole')) {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                    loadUser(null);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setLoading(false);
                }
            }
        });

        // Load user immediately on mount if not already loading/loaded
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadUser(mockRole);

        // Listen for custom event to trigger re-render on role switch
        const handleRoleChange = () => {
            if (mounted) {
                const newRole = localStorage.getItem('mockUserRole');
                setMockRole(newRole);
                loadUser(newRole);
            }
        };

        window.addEventListener('auth-role-change', handleRoleChange);
        
        return () => {
            mounted = false;
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

        // 3. Force "guest" state
        setUser(null);
        setMockRole(null);

        // 4. Notify components
        window.dispatchEvent(new Event('auth-role-change'));

        // 5. Force reload to guest mode if needed, or ensure "guest" is selected in dropdown
        // (The hook logic will reloadUser(null) effectively)
    };

    return { user, loading, mockRole, switchMockRole, quickLogin, logout };
}
