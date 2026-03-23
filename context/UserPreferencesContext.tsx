'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemePreference = 'dark' | 'light' | 'system';

interface UserPreferences {
  keepScreenAwake: boolean;
  theme: ThemePreference;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resolvedTheme: 'dark' | 'light';
}

const STORAGE_KEY = 'sacred-fire-songs-preferences';

const defaultPreferences: UserPreferences = {
  keepScreenAwake: true, // Enabled by default as requested for mobile convenience
  theme: 'dark', // Backward compatible — existing users stay on dark
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeClass(resolved: 'dark' | 'light') {
  const doc = document.documentElement;
  if (resolved === 'dark') {
    doc.classList.add('dark');
  } else {
    doc.classList.remove('dark');
  }
}

function updateThemeColor(resolved: 'dark' | 'light') {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#1a0505' : '#ffffff');
  }
}

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window === 'undefined') return defaultPreferences;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...defaultPreferences, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse user preferences:', e);
      }
    }
    return defaultPreferences;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return preferences.theme === 'system' ? getSystemTheme() : preferences.theme;
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  // Apply theme class + listen for system changes
  useEffect(() => {
    const resolved = preferences.theme === 'system' ? getSystemTheme() : preferences.theme;
    setResolvedTheme(resolved);
    applyThemeClass(resolved);
    updateThemeColor(resolved);

    if (preferences.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        const newResolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        applyThemeClass(newResolved);
        updateThemeColor(newResolved);
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [preferences.theme]);

  const setPreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, setPreference, resolvedTheme }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
