'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useUserPreferences } from '@/context/UserPreferencesContext';

export function useWakeLock() {
  const { preferences } = useUserPreferences();
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = useCallback(async () => {
    if (!preferences.keepScreenAwake || !('wakeLock' in navigator)) return;

    try {
      wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      console.log('Wake Lock is active');

      wakeLockRef.current.addEventListener('release', () => {
        console.log('Wake Lock was released');
      });
    } catch (err: any) {
      console.error(`Wake Lock error: ${err.name}, ${err.message}`);
    }
  }, [preferences.keepScreenAwake]);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock]);

  return { isSupported: typeof navigator !== 'undefined' && 'wakeLock' in navigator };
}
