"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import {
  User as UserIcon,
  Settings,
  Lock,
  Shield,
  SlidersHorizontal,
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
    { id: "profile" as const,      label: "Profile",      icon: UserIcon },
    { id: "account" as const,      label: "Account",      icon: Lock },
    { id: "preferences" as const,  label: "Preferences",  icon: SlidersHorizontal },
    { id: "privacy" as const,      label: "Privacy & Data", icon: Shield },
  ];

  return (
    <main className="flex-1 p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-white">Account Settings</h1>
          <p className="text-slate-400">Manage your profile, account security, and data preferences.</p>
        </header>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === id
                  ? "bg-white text-gray-950"
                  : "bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
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
