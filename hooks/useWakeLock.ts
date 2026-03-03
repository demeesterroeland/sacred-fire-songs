'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useUserPreferences } from '@/context/UserPreferencesContext';

interface WakeLockSentinel {
  release(): Promise<void>;
  addEventListener(event: string, listener: () => void): void;
}

interface NavigatorWithWakeLock {
  wakeLock: {
    request(type: 'screen'): Promise<WakeLockSentinel>;
  };
}

export function useWakeLock() {
  const { preferences } = useUserPreferences();
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    if (!preferences.keepScreenAwake || !('wakeLock' in navigator)) return;

    try {
      const wakeLock = (navigator as NavigatorWithWakeLock).wakeLock;
      wakeLockRef.current = await wakeLock.request('screen');
      console.log('Wake Lock is active');

      wakeLockRef.current.addEventListener('release', () => {
        console.log('Wake Lock was released');
      });
    } catch (err) {
      const error = err as Error;
      console.error(`Wake Lock error: ${error.name}, ${error.message}`);
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
