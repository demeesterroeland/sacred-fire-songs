"use client";

import { useState } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { User as UserIcon, Lock, Shield, SlidersHorizontal } from "lucide-react";
import ProfileSettings from "@/components/account/settings/ProfileSettings";
import SecuritySettings from "@/components/account/settings/SecuritySettings";
import PrivacySettings from "@/components/account/settings/PrivacySettings";
import PreferencesSettings from "@/components/account/settings/PreferencesSettings";
import { useLocale } from "@/context/LocaleContext";
import { parseSettingsTab, visibleSettingsTabs, type SettingsTab } from "@/lib/account/settingsTabs";
import { FEATURES } from "@/lib/features";

// Re-exported for tests; server code imports it from "@/lib/account/settingsTabs".
export { parseSettingsTab };

type TabType = SettingsTab;

interface AccountSettingsProps {
  user: User;
  profile: any;
  initialTab?: TabType;
}

export default function AccountSettings({ user, profile, initialTab = "profile" }: AccountSettingsProps) {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Story 6.1.5 (#389): only tabs that work; "Privacy & Data" is hidden while FEATURES.privacySettings is off.
  const tabMeta = {
    profile:     { label: t("settings.tab.profile"),     icon: UserIcon },
    account:     { label: t("settings.tab.security"),    icon: Lock },
    preferences: { label: t("settings.tab.preferences"), icon: SlidersHorizontal },
    privacy:     { label: t("settings.tab.privacy"),     icon: Shield },
  } satisfies Record<TabType, { label: string; icon: typeof Lock }>;
  const tabs = visibleSettingsTabs().map((id) => ({ id, ...tabMeta[id] }));

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-fg">{t("settings.pageTitle")}</h1>
          <p className="text-fg-muted">{t("settings.pageIntro")}</p>
        </header>

        {/* Tabs Navigation — horizontally scrollable on mobile */}
        <div className="relative mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  aria-pressed={active}
                  className={`inline-flex min-h-tap items-center gap-1.5 px-3.5 rounded-pill text-meta font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? "bg-chip-active text-on-chip-active"
                      : "bg-chip text-on-chip hover:bg-line"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
          {/* Right-fade scroll hint — hidden on md+ where all tabs fit */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 -right-4 md:right-0 w-12 bg-gradient-to-l from-bg to-transparent md:hidden" />
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === "profile" && <ProfileSettings user={user} profile={profile} />}
          {activeTab === "account" && <SecuritySettings user={user} />}
          {activeTab === "preferences" && <PreferencesSettings />}
          {FEATURES.privacySettings && activeTab === "privacy" && <PrivacySettings user={user} profile={profile} />}
        </div>

        {/* Terms and Privacy: public pages, also linked from the sign-in and sign-up forms. */}
        <nav aria-label={t("legal.account.title")} className="mt-12 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4 text-meta">
          <Link href="/terms" className="inline-flex min-h-tap items-center text-fg-muted underline-offset-4 hover:text-fg hover:underline">
            {t("auth.tos.terms")}
          </Link>
          <Link href="/privacy" className="inline-flex min-h-tap items-center text-fg-muted underline-offset-4 hover:text-fg hover:underline">
            {t("auth.tos.privacy")}
          </Link>
        </nav>
      </div>
    </div>
  );
}
