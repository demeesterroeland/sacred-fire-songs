'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
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
  // True only while the browser really holds the lock (Story 6.1.10, #394: the reader's stay-awake indicator).
  const [isActive, setIsActive] = useState(false);

  // Bumped on cleanup: a request that resolves after the page has gone must not keep the screen on.
  const generationRef = useRef(0);

  const requestWakeLock = useCallback(() => {
    if (!preferences.keepScreenAwake || !('wakeLock' in navigator)) return;

    const generation = generationRef.current;
    (navigator as NavigatorWithWakeLock).wakeLock
      .request('screen')
      .then((sentinel) => {
        if (generation !== generationRef.current) {
          sentinel.release().catch(() => {});
          return;
        }
        // A second request (tab visible again) replaces the old lock: let go of it first.
        const previous = wakeLockRef.current;
        wakeLockRef.current = sentinel;
        if (previous && previous !== sentinel) previous.release().catch(() => {});
        setIsActive(true);
        sentinel.addEventListener('release', () => {
          // Only the lock we still hold may switch the indicator off.
          if (wakeLockRef.current !== sentinel) return;
          wakeLockRef.current = null;
          setIsActive(false);
        });
      })
      .catch((err: Error) => {
        console.error(`Wake Lock error: ${err.name}, ${err.message}`);
      });
  }, [preferences.keepScreenAwake]);

  const releaseWakeLock = useCallback(() => {
    generationRef.current += 1;
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
    setIsActive(false);
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

  return { isSupported: typeof navigator !== 'undefined' && 'wakeLock' in navigator, isActive };
}
