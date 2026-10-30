'use client';

import { useLocale } from '@/context/LocaleContext';
import { isLocale } from '@/lib/i18n';

/**
 * Language picker. Each option is labelled in its own language
 * ("English", "Nederlands", "Русский", …) so it stays recognisable whatever is
 * active. A native <select> keeps eight languages compact and accessible on
 * mobile. Used in the user menu, the sidebar footer (guests) and
 * Account → Preferences.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, t, setLocaleAndPersist, supportedLocales, localeLabels } = useLocale();

  return (
    <select
      aria-label={t('userMenu.language')}
      data-testid="language-switcher"
      value={locale}
      onChange={(e) => {
        const next = e.target.value;
        if (isLocale(next) && next !== locale) setLocaleAndPersist(next);
      }}
      className={`text-xs font-bold rounded-md px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 cursor-pointer ${className}`}
    >
      {supportedLocales.map((loc) => (
        <option key={loc} value={loc} lang={loc}>
          {localeLabels[loc]}
        </option>
      ))}
    </select>
  );
}
