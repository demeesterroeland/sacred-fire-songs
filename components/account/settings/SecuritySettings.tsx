"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Mail, Lock, LogOut, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface SecuritySettingsProps {
  user: User;
}

export default function SecuritySettings({ user }: SecuritySettingsProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const supabase = createClient();

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      window.location.href = "/auth/login";
    } catch (error) {
      toast.error("Failed to log out from all devices");
    }
  };

  return (
    <section className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
          <Mail className="w-5 h-5 text-slate-400" />
          Email Address
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="email"
            value={user.email}
            disabled
            className="flex-1 bg-slate-900/50 border border-white/10 px-4 py-3 rounded-xl text-white opacity-60 cursor-not-allowed"
          />
          <button
            onClick={() => toast.info("Email change is currently handled via support.")}
            className="w-44 shrink-0 bg-white/5 border border-white/10 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            Change Email
          </button>
        </div>
        <p className="text-xs text-slate-500 italic">Changing your email will require re-verification.</p>
      </div>

      <hr className="border-white/5" />

      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
          <Lock className="w-5 h-5 text-slate-400" />
          Password
        </h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 px-4 py-3 pr-10 rounded-xl text-white focus:outline-none focus:border-[#f45d1a] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-slate-500 hover:text-white transition-colors p-1"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 px-4 py-3 pr-10 rounded-xl text-white focus:outline-none focus:border-[#f45d1a] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-slate-500 hover:text-white transition-colors p-1"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            onClick={handleUpdatePassword}
            disabled={isUpdating || !newPassword}
            className="w-44 shrink-0 bg-white/5 border border-white/10 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isUpdating ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      <hr className="border-white/5" />

      <div className="pt-2">
        <button
          onClick={handleLogoutAll}
          className="w-full md:w-auto flex items-center justify-center gap-2 text-red-400 hover:text-red-300 transition-colors px-6 py-3 border border-red-500/20 rounded-xl hover:bg-red-500/5"
        >
          <LogOut className="w-5 h-5" />
          Log Out from all devices
        </button>
      </div>
    </section>
  );
}
