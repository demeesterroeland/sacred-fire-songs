'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useUserPreferences, type ThemePreference } from '@/context/UserPreferencesContext';

const themeOptions: { value: ThemePreference; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
];

export function ThemeToggle() {
    const { preferences, setPreference } = useUserPreferences();

    // Cycle through: light → dark → system → light
    const cycleTheme = () => {
        const order: ThemePreference[] = ['light', 'dark', 'system'];
        const idx = order.indexOf(preferences.theme);
        const next = order[(idx + 1) % order.length];
        setPreference('theme', next);
    };

    const current = themeOptions.find((o) => o.value === preferences.theme) || themeOptions[2];
    const Icon = current.icon;

    return (
        <button
            onClick={cycleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            aria-label={`Theme: ${current.label}`}
            title={`Theme: ${current.label}`}
        >
            <Icon className="w-5 h-5" />
        </button>
    );
}
