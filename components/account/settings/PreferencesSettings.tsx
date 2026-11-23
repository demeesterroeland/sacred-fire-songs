"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Globe, Mail, Monitor, FileText, Music2, WifiOff, Sun, Moon, SlidersHorizontal } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useUserPreferences, type ThemePreference } from "@/context/UserPreferencesContext";
import { useLocale } from "@/context/LocaleContext";
import { FEATURES } from "@/lib/features";
import type { TranslationKey } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/common/navigation/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { getEmailNotificationsEnabled, setEmailNotificationsEnabled } from "@/lib/notifications/queries";

interface PreferenceRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  notSupported?: boolean;
}

function PreferenceRow({
  icon, label, description, checked, onCheckedChange,
  disabled, notSupported,
}: PreferenceRowProps) {
  const { t } = useLocale();
  return (
    <div className={`flex min-h-tap items-center justify-between p-4 bg-surface rounded-panel border border-line transition-opacity ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3 pr-4">
        <div className="mt-0.5 text-fg-muted" aria-hidden="true">{icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-fg">{label}</p>
          </div>
          <p className="text-sm text-fg-muted mt-0.5">
            {description}
            {notSupported && (
              <span className="text-fg-subtle block mt-1">{t('settings.prefs.notSupported')}</span>
            )}
          </p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={label}
        className="shrink-0"
      />
    </div>
  );
}

const THEME_OPTIONS: { value: ThemePreference; labelKey: TranslationKey; icon: React.ReactNode }[] = [
  { value: 'light', labelKey: 'theme.light', icon: <Sun className="w-4 h-4" aria-hidden="true" /> },
  { value: 'dark', labelKey: 'theme.dark', icon: <Moon className="w-4 h-4" aria-hidden="true" /> },
  { value: 'system', labelKey: 'theme.system', icon: <Monitor className="w-4 h-4" aria-hidden="true" /> },
];

function ThemeSelector() {
  const { t } = useLocale();
  const { preferences, setPreference } = useUserPreferences();

  return (
    <div className="flex items-center justify-between p-4 bg-surface rounded-panel border border-line">
      <div className="flex items-start gap-3 pr-4">
        <div className="mt-0.5 text-fg-muted">
          {preferences.theme === 'light' ? <Sun className="w-5 h-5" aria-hidden="true" /> : preferences.theme === 'dark' ? <Moon className="w-5 h-5" aria-hidden="true" /> : <Monitor className="w-5 h-5" aria-hidden="true" />}
        </div>
        <div>
          <p className="font-medium text-fg">{t("settings.prefs.appearance")}</p>
          <p className="text-sm text-fg-muted mt-0.5">
            {t("settings.prefs.appearance.description")}
          </p>
        </div>
      </div>
      <div className="bg-surface-2 p-0.5 rounded-panel inline-flex gap-0.5 shrink-0">
        {THEME_OPTIONS.map((option) => {
          const active = preferences.theme === option.value;
          const label = t(option.labelKey);
          return (
            <button
              key={option.value}
              type="button"
              aria-label={label}
              aria-pressed={active}
              onClick={() => setPreference('theme', option.value)}
              className={`min-h-tap inline-flex items-center justify-center gap-1.5 px-3 text-meta font-semibold rounded-control transition-colors ${
                active
                  ? 'bg-chip-active text-on-chip-active'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              {option.icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LanguageSelector() {
  const { t } = useLocale();

  return (
    <div className="flex items-center justify-between p-4 bg-surface rounded-panel border border-line">
      <div className="flex items-start gap-3 pr-4">
        <div className="mt-0.5 text-fg-muted">
          <Globe className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-fg">{t("settings.prefs.language")}</p>
          <p className="text-sm text-fg-muted mt-0.5">
            {t("settings.prefs.language.description")}
          </p>
        </div>
      </div>
      <LanguageSwitcher className="shrink-0" />
    </div>
  );
}

/** Opt-out for transactional emails such as "a recording was shared with you". */
function EmailNotificationsRow() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    getEmailNotificationsEnabled(user.id)
      .then((v) => { if (!cancelled) setEnabled(v); })
      .catch(() => { if (!cancelled) setEnabled(true); });
    return () => { cancelled = true; };
  }, [user?.id]);

  if (!user?.id) return null;

  const onChange = async (v: boolean) => {
    const previous = enabled;
    setEnabled(v);
    try {
      await setEmailNotificationsEnabled(user.id, v);
    } catch {
      setEnabled(previous);
      toast.error(t("settings.prefs.emailNotifications.saveError"));
    }
  };

  return (
    <PreferenceRow
      icon={<Mail className="w-5 h-5" aria-hidden="true" />}
      label={t("settings.prefs.emailNotifications")}
      description={t("settings.prefs.emailNotifications.description")}
      checked={enabled ?? true}
      onCheckedChange={onChange}
      disabled={enabled === null}
    />
  );
}

export default function PreferencesSettings() {
  const { t } = useLocale();
  const { preferences, setPreference } = useUserPreferences();
  const { isSupported } = useWakeLock();

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-fg mb-6">{t("settings.prefs.heading")}</h2>

      {/* Theme Selector — functional */}
      <ThemeSelector />

      {/* Language — functional */}
      <LanguageSelector />

      {/* Keep Screen Awake — functional */}
      <PreferenceRow
        icon={<Monitor className="w-5 h-5" aria-hidden="true" />}
        label={t("settings.prefs.keepAwake")}
        description={t("settings.prefs.keepAwake.description")}
        checked={preferences.keepScreenAwake && isSupported}
        onCheckedChange={(v) => setPreference("keepScreenAwake", v)}
        disabled={!isSupported}
        notSupported={!isSupported}
      />

      {/* Auto-hide Bottom Nav — functional */}
      <PreferenceRow
        icon={<SlidersHorizontal className="w-5 h-5" aria-hidden="true" />}
        label={t("settings.prefs.autoHideNav")}
        description={t("settings.prefs.autoHideNav.description")}
        checked={preferences.autoHideBottomNav}
        onCheckedChange={(v) => setPreference("autoHideBottomNav", v)}
      />

      {/* Email notifications — functional (Story 4.6.6) */}
      <EmailNotificationsRow />

      {/* Not implemented yet: hidden until FEATURES.plannedPreferences is on (Story 6.1.5, #389). */}
      {FEATURES.plannedPreferences && (
        <>
        {/* Auto-scroll Lyrics — disabled */}
        <PreferenceRow
          icon={<FileText className="w-5 h-5" aria-hidden="true" />}
          label={t("settings.prefs.autoScroll")}
          description={t("settings.prefs.autoScroll.description")}
          checked={false}
          onCheckedChange={() => {}}
          disabled
        />

        {/* Default Chord Display — disabled */}
        <PreferenceRow
          icon={<Music2 className="w-5 h-5" aria-hidden="true" />}
          label={t("settings.prefs.showChords")}
          description={t("settings.prefs.showChords.description")}
          checked={false}
          onCheckedChange={() => {}}
          disabled
        />

        {/* Offline Mode — disabled */}
        <PreferenceRow
          icon={<WifiOff className="w-5 h-5" aria-hidden="true" />}
          label={t("settings.prefs.offlineMode")}
          description={t("settings.prefs.offlineMode.description")}
          checked={false}
          onCheckedChange={() => {}}
          disabled
        />
        </>
      )}
    </section>
  );
}
