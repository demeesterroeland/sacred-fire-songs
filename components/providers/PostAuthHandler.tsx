'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGuestFavorites } from '@/hooks/useGuestFavorites';
import { mergeGuestFavorites } from '@/app/actions/mergeGuestFavorites';
import { toast } from 'sonner';

/**
 * Handles post-authentication tasks like merging localStorage guest favorites
 * into the real user account.
 */
export default function PostAuthHandler() {
    const { user } = useAuth();
    const guestFavorites = useGuestFavorites();
    const lastUserRef = useRef<string | null>(null);

    useEffect(() => {
        const handleMerge = async () => {
            // Only merge if we just logged in (user transitioned from null to object)
            if (user && !lastUserRef.current) {
                const guestIds = guestFavorites.getAll();
                
                if (guestIds.length > 0) {
                    try {
                        const result = await mergeGuestFavorites(guestIds);
                        
                        // Clear guest favorites from localStorage regardless of merge count
                        // (we don't want to keep trying if they are already in the setlist or invalid)
                        guestFavorites.clear();

                        if (result.merged > 0) {
                            toast('Your hearth has been carried into your account', {
                                description: `${result.merged} song${result.merged !== 1 ? 's' : ''} added to My Favorites`,
                                duration: 5000,
                            });
                        }
                    } catch (error) {
                        console.error('Failed to merge guest favorites:', error);
                    }
                }
            }
            lastUserRef.current = user?.id || null;
        };

        // Listen for auth-role-change event (fired by LoginForm and useAuth)
        window.addEventListener('auth-role-change', handleMerge);
        
        // Also run on mount/render to catch redirects from Magic Link
        handleMerge();

        return () => window.removeEventListener('auth-role-change', handleMerge);
    }, [user, guestFavorites]);

    return null;
}
