'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useUserPreferences, type ThemePreference } from '@/context/UserPreferencesContext';
import { useLocale } from '@/context/LocaleContext';

export function ThemeToggle() {
    const { preferences, setPreference } = useUserPreferences();
    const { t } = useLocale();

    const themeOptions: { value: ThemePreference; icon: typeof Sun; label: string }[] = [
        { value: 'light', icon: Sun, label: t('theme.light') },
        { value: 'dark', icon: Moon, label: t('theme.dark') },
        { value: 'system', icon: Monitor, label: t('theme.system') },
    ];

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
            aria-label={t('theme.label', { theme: current.label })}
            title={t('theme.label', { theme: current.label })}
        >
            <Icon className="w-5 h-5" />
        </button>
    );
}
