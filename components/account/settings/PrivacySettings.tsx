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
    <section className="bg-slate-800/40 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-3xl">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Privacy & Data</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Privacy controls, data export, and account deletion will be available here soon.
        </p>
        <span className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
          Coming soon
        </span>
      </div>
    </section>
  );
}
