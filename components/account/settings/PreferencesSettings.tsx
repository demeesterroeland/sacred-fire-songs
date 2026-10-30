"use client";

import { Monitor, FileText, Music2, Type, WifiOff, Sun, Moon, SlidersHorizontal } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useUserPreferences, type ThemePreference } from "@/context/UserPreferencesContext";
import { t } from "@/lib/i18n";
import { useLocale } from "@/context/LocaleContext";

interface PreferenceRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  comingSoon?: boolean;
  notSupported?: boolean;
}

function PreferenceRow({
  icon, label, description, checked, onCheckedChange,
  disabled, comingSoon, notSupported,
}: PreferenceRowProps) {
  return (
    <div className={`flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5 transition-opacity ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3 pr-4">
        <div className="mt-0.5 text-gray-500 dark:text-slate-400">{icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 dark:text-white">{label}</p>
            {comingSoon && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 rounded-full">
                {t("settings.comingSoon")}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {description}
            {notSupported && (
              <span className="text-amber-500 block mt-1">Not supported by your browser</span>
            )}
          </p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="data-[state=checked]:bg-[#f45d1a] shrink-0"
      />
    </div>
  );
}

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: t('theme.light'), icon: <Sun className="w-4 h-4" /> },
  { value: 'dark', label: t('theme.dark'), icon: <Moon className="w-4 h-4" /> },
  { value: 'system', label: t('theme.system'), icon: <Monitor className="w-4 h-4" /> },
];

function ThemeSelector() {
  const { locale } = useLocale();
  const { preferences, setPreference } = useUserPreferences();

  return (
    <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5">
      <div className="flex items-start gap-3 pr-4">
        <div className="mt-0.5 text-gray-500 dark:text-slate-400">
          {preferences.theme === 'light' ? <Sun className="w-5 h-5" /> : preferences.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{t("settings.prefs.appearance")}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {t("settings.prefs.appearance.description")}
          </p>
        </div>
      </div>
      <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-xl inline-flex shadow-inner shrink-0">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setPreference('theme', option.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              preferences.theme === option.value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-300 dark:ring-white/5'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {option.icon}
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PreferencesSettings() {
  const { locale } = useLocale();
  const { preferences, setPreference } = useUserPreferences();
  const { isSupported } = useWakeLock();

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t("settings.prefs.heading")}</h2>

      {/* Theme Selector — functional */}
      <ThemeSelector />

      {/* Keep Screen Awake — functional */}
      <PreferenceRow
        icon={<Monitor className="w-5 h-5" />}
        label={t("settings.prefs.keepAwake")}
        description={t("settings.prefs.keepAwake.description")}
        checked={preferences.keepScreenAwake && isSupported}
        onCheckedChange={(v) => setPreference("keepScreenAwake", v)}
        disabled={!isSupported}
        notSupported={!isSupported}
      />

      {/* Auto-hide Bottom Nav — functional */}
      <PreferenceRow
        icon={<SlidersHorizontal className="w-5 h-5" />}
        label={t("settings.prefs.autoHideNav")}
        description={t("settings.prefs.autoHideNav.description")}
        checked={preferences.autoHideBottomNav}
        onCheckedChange={(v) => setPreference("autoHideBottomNav", v)}
      />

      {/* Auto-scroll Lyrics — disabled */}
      <PreferenceRow
        icon={<FileText className="w-5 h-5" />}
        label={t("settings.prefs.autoScroll")}
        description={t("settings.prefs.autoScroll.description")}
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />

      {/* Default Chord Display — disabled */}
      <PreferenceRow
        icon={<Music2 className="w-5 h-5" />}
        label={t("settings.prefs.showChords")}
        description={t("settings.prefs.showChords.description")}
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />

      {/* Font Size — disabled */}
      <PreferenceRow
        icon={<Type className="w-5 h-5" />}
        label={t("settings.prefs.largeFont")}
        description={t("settings.prefs.largeFont.description")}
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />

      {/* Offline Mode — disabled */}
      <PreferenceRow
        icon={<WifiOff className="w-5 h-5" />}
        label={t("settings.prefs.offlineMode")}
        description={t("settings.prefs.offlineMode.description")}
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />
    </section>
  );
}
