"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import {
  User as UserIcon,
  Settings,
  Lock,
  Shield,
  Mail,
  LayoutDashboard,
  Compass,
  Library,
  ListMusic,
  PlusCircle,
  Camera,
  LogOut,
  Download,
  Flame
} from "lucide-react";
import ProfileSettings from "@/components/account/settings/ProfileSettings";
import SecuritySettings from "@/components/account/settings/SecuritySettings";
import PrivacySettings from "@/components/account/settings/PrivacySettings";
import PreferencesSettings from "@/components/account/settings/PreferencesSettings";

interface AccountSettingsProps {
  user: User;
  profile: any;
}

type TabType = "profile" | "account" | "preferences" | "privacy";

export default function AccountSettings({ user, profile }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const tabs = [
    { id: "profile" as const,      label: "Profile" },
    { id: "account" as const,      label: "Account" },
    { id: "preferences" as const,  label: "Preferences" },
    { id: "privacy" as const,      label: "Privacy & Data" },
  ];

  return (
    <main className="flex-1 p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-white">Account Settings</h1>
          <p className="text-slate-400">Manage your profile, account security, and data preferences.</p>
        </header>

        {/* Tabs Navigation */}
        <div className="flex p-1 bg-slate-950/40 rounded-2xl mb-8 w-fit border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                ? "bg-[#f45d1a]/10 text-[#f45d1a] shadow-[0_0_15px_rgba(244,93,26,0.1)]"
                : "text-slate-500 hover:text-slate-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === "profile" && <ProfileSettings user={user} profile={profile} />}
          {activeTab === "account" && <SecuritySettings user={user} />}
          {activeTab === "preferences" && <PreferencesSettings />}
          {activeTab === "privacy" && <PrivacySettings user={user} profile={profile} />}
        </div>
      </div>
    </main>
  );
}
