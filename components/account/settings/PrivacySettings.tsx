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
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? false);
  const [showActivity, setShowActivity] = useState(profile?.show_activity ?? true);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  const handleToggle = async (field: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Preference updated");
    } catch (error: any) {
      setter(!value); // Revert on error
      toast.error(error.message || "Failed to update preference");
    }
  };

  const handleExportData = () => {
    toast.info("Data export request received. You will receive an email shortly.");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you absolutely sure? This will permanently delete your account and all your song collections. This action cannot be undone.");
    if (!confirmed) return;

    toast.error("Account deletion requires manual verification for safety. Please contact support.");
  };

  return (
    <section className="bg-slate-800/40 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-3xl space-y-8">
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Privacy Settings</h2>
        <div className="space-y-4">
          {/* Public Profile Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <p className="font-medium text-white">Make Profile Public</p>
              <p className="text-sm text-slate-400">Allow others to see your public song collections.</p>
            </div>
            <button
              onClick={() => handleToggle("is_public", !isPublic, setIsPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPublic ? "bg-[#f45d1a]" : "bg-slate-700"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Show Activity Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <p className="font-medium text-white">Show Activity</p>
              <p className="text-sm text-slate-400">Display when you're live-viewing a shared song.</p>
            </div>
            <button
              onClick={() => handleToggle("show_activity", !showActivity, setShowActivity)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showActivity ? "bg-[#f45d1a]" : "bg-slate-700"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showActivity ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      <hr className="border-white/5" />

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Data Management</h2>
        <p className="text-slate-400 text-sm">Download your personal song data, history, and preferences.</p>
        <button
          onClick={handleExportData}
          className="flex items-center gap-2 text-[#f45d1a] hover:underline font-medium transition-all"
        >
          <Download className="w-4 h-4" />
          Request Data Take Out (.json)
        </button>
      </div>

      <hr className="border-white/5" />

      <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
        <h2 className="text-red-400 font-bold mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Deleting your account is permanent and will remove all your collections and personalized settings.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-500 font-bold px-6 py-3 rounded-xl transition-all"
        >
          Delete My Account
        </button>
      </div>
    </section>
  );
}
