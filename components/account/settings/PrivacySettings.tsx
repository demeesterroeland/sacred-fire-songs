"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Download, Trash2, Shield, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface PrivacySettingsProps {
  user: User;
  profile: any;
}

export default function PrivacySettings({ user, profile }: PrivacySettingsProps) {
  const [isPublic] = useState(profile?.is_public ?? false);
  const [showActivity] = useState(profile?.show_activity ?? true);
  const supabase = createClient();

  return (
    <section className="space-y-8">

      {/* Coming soon banner */}
      <div className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
        <Shield className="w-4 h-4 text-gray-500 dark:text-slate-400 shrink-0" />
        <p className="text-sm text-gray-500 dark:text-slate-400">These settings are not yet active.</p>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 rounded-full shrink-0">
          Coming soon
        </span>
      </div>

      <div className="space-y-6 opacity-50 pointer-events-none select-none">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy Settings</h2>
        <div className="space-y-4">
          {/* Public Profile Toggle */}
          <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Make Profile Public</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Allow others to see your public song collections.</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPublic ? "bg-[#f45d1a]" : "bg-slate-700"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          {/* Show Activity Toggle */}
          <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show Activity</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Display when you&apos;re live-viewing a shared song.</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showActivity ? "bg-[#f45d1a]" : "bg-slate-700"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showActivity ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-white/5" />

      <div className="space-y-4 opacity-50 pointer-events-none select-none">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Management</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">Download your personal song data, history, and preferences.</p>
        <button className="flex items-center gap-2 text-[#f45d1a] font-medium">
          <Download className="w-4 h-4" />
          Request Data Take Out (.json)
        </button>
      </div>

      <hr className="border-gray-200 dark:border-white/5" />

      <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl opacity-50 pointer-events-none select-none">
        <h2 className="text-red-400 font-bold mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
          Deleting your account is permanent and will remove all your collections and personalized settings.
        </p>
        <button className="bg-red-600/10 border border-red-600/30 text-red-500 font-bold px-6 py-3 rounded-xl">
          Delete My Account
        </button>
      </div>
    </section>
  );
}
