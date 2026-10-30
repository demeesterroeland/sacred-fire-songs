"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Download, Trash2, Shield, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { useLocale } from "@/context/LocaleContext";

interface PrivacySettingsProps {
  user: User;
  profile: any;
}

export default function PrivacySettings({ user, profile }: PrivacySettingsProps) {
  const { locale } = useLocale();
  const [isPublic] = useState(profile?.is_public ?? false);
  const [showActivity] = useState(profile?.show_activity ?? true);
  const supabase = createClient();

  return (
    <section className="space-y-8">

      {/* Coming soon banner */}
      <div className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
        <Shield className="w-4 h-4 text-gray-500 dark:text-slate-400 shrink-0" />
        <p className="text-sm text-gray-500 dark:text-slate-400">{t("settings.privacy.notActive")}</p>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 rounded-full shrink-0">
          {t("settings.comingSoon")}
        </span>
      </div>

      <div className="space-y-6 opacity-50 pointer-events-none select-none">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("settings.privacy.heading")}</h2>
        <div className="space-y-4">
          {/* Public Profile Toggle */}
          <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{t("settings.privacy.makePublic")}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t("settings.privacy.makePublic.description")}</p>
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
              <p className="font-medium text-gray-900 dark:text-white">{t("settings.privacy.showActivity")}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t("settings.privacy.showActivity.description")}</p>
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
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("settings.privacy.dataManagement")}</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">{t("settings.privacy.dataManagement.description")}</p>
        <button className="flex items-center gap-2 text-[#f45d1a] font-medium">
          <Download className="w-4 h-4" />
          {t("settings.privacy.dataExport")}
        </button>
      </div>

      <hr className="border-gray-200 dark:border-white/5" />

      <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl opacity-50 pointer-events-none select-none">
        <h2 className="text-red-400 font-bold mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          {t("settings.privacy.dangerZone")}
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
          {t("settings.privacy.deleteWarning")}
        </p>
        <button className="bg-red-600/10 border border-red-600/30 text-red-500 font-bold px-6 py-3 rounded-xl">
          {t("settings.privacy.deleteAccount")}
        </button>
      </div>
    </section>
  );
}
