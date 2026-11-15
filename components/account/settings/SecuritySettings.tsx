"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Mail, Lock, LogOut, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";

interface SecuritySettingsProps {
  user: User;
}

export default function SecuritySettings({ user }: SecuritySettingsProps) {
  const { t } = useLocale();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const supabase = createClient();

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(t("settings.security.mismatch"));
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success(t("settings.security.success"));
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('[settings]', error);
      toast.error(t("settings.security.error"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      window.location.href = "/auth/login";
    } catch {
      toast.error(t("settings.security.signOutAllError"));
    }
  };

  return (
    <section className="space-y-8">
      {/* Email Address */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-fg">
          <Mail className="w-5 h-5 text-fg-muted" aria-hidden="true" />
          {t("field.email.label")}
        </h2>
        <input
          type="email"
          value={user.email}
          disabled
          aria-label={t("field.email.label")}
          className="w-full min-h-tap bg-surface border border-line px-4 py-2.5 rounded-control text-fg-muted opacity-70 cursor-not-allowed"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => toast.info(t("settings.profile.emailNote"))}
          className="w-full sm:w-auto"
        >
          {t("settings.security.changeEmail")}
        </Button>
        <p className="text-caption text-fg-subtle">{t("settings.security.emailReverifyHint")}</p>
      </div>

      <hr className="border-line" />

      {/* Password */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-fg">
          <Lock className="w-5 h-5 text-fg-muted" aria-hidden="true" />
          {t("settings.security.changePassword")}
        </h2>

        <div className="space-y-2">
          <label htmlFor="security-new-password" className="text-meta font-semibold text-fg-muted">{t("settings.security.newPassword")}</label>
          <div className="relative">
            <input
              id="security-new-password"
              type={showNewPassword ? "text" : "password"}
              placeholder={t("field.password.placeholder")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full min-h-tap bg-surface border border-line-strong px-4 py-2.5 pr-12 rounded-control text-fg transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(prev => !prev)}
              className="absolute right-0.5 top-1/2 -translate-y-1/2 z-10 size-tap inline-flex items-center justify-center rounded-control text-fg-muted hover:text-fg transition-colors"
              aria-label={showNewPassword ? t("settings.security.hidePassword") : t("settings.security.showPassword")}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="security-confirm-password" className="text-meta font-semibold text-fg-muted">{t("settings.security.confirmPassword")}</label>
          <div className="relative">
            <input
              id="security-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("field.password.placeholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full min-h-tap bg-surface border border-line-strong px-4 py-2.5 pr-12 rounded-control text-fg transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(prev => !prev)}
              className="absolute right-0.5 top-1/2 -translate-y-1/2 z-10 size-tap inline-flex items-center justify-center rounded-control text-fg-muted hover:text-fg transition-colors"
              aria-label={showConfirmPassword ? t("settings.security.hidePassword") : t("settings.security.showPassword")}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleUpdatePassword}
          disabled={isUpdating || !newPassword}
          className="w-full sm:w-auto"
        >
          {isUpdating && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {isUpdating ? t("settings.security.updating") : t("settings.security.updatePassword")}
        </Button>
      </div>

      <hr className="border-line" />

      <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleLogoutAll}
          className="w-full md:w-auto text-danger border-line hover:bg-surface-2 hover:text-danger"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          {t("settings.security.signOutAll")}
        </Button>
      </div>
    </section>
  );
}
