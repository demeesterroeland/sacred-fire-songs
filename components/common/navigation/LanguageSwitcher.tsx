'use client';

import { useLocale } from '@/context/LocaleContext';

/**
 * EN / NL segmented switch. Each option is labelled in its own language
 * ("English", "Nederlands") so it stays recognisable whatever is active.
 * Used in the user menu, the sidebar footer (guests) and Account → Preferences.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, t, setLocaleAndPersist, supportedLocales, localeLabels } = useLocale();

  return (
    <div
      role="group"
      aria-label={t('userMenu.language')}
      data-testid="language-switcher"
      className={`inline-flex gap-1 ${className}`}
    >
      {supportedLocales.map((loc) => {
        const active = locale === loc;
        return (
          <button
            key={loc}
            type="button"
            lang={loc}
            aria-pressed={active}
            aria-label={localeLabels[loc]}
            title={localeLabels[loc]}
            onClick={() => {
              if (!active) setLocaleAndPersist(loc);
            }}
            className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${
              active
                ? 'bg-red-500 text-white'
                : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {loc.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
