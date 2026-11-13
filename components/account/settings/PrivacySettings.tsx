"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Download, Trash2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface PrivacySettingsProps {
  user: User;
  profile: any;
}

export default function PrivacySettings({ profile }: PrivacySettingsProps) {
  const { t } = useLocale();
  const [isPublic] = useState(profile?.is_public ?? false);
  const [showActivity] = useState(profile?.show_activity ?? true);

  return (
    <section className="space-y-8">

      <div className="space-y-6 opacity-50 pointer-events-none select-none">
        <h2 className="text-xl font-bold text-fg">{t("settings.privacy.heading")}</h2>
        <div className="space-y-4">
          {/* Public Profile Toggle */}
          <div className="flex items-center justify-between p-4 bg-surface rounded-panel border border-line">
            <div>
              <p className="font-medium text-fg">{t("settings.privacy.makePublic")}</p>
              <p className="text-sm text-fg-muted">{t("settings.privacy.makePublic.description")}</p>
            </div>
            <Switch checked={isPublic} disabled aria-label={t("settings.privacy.makePublic")} />
          </div>

          {/* Show Activity Toggle */}
          <div className="flex items-center justify-between p-4 bg-surface rounded-panel border border-line">
            <div>
              <p className="font-medium text-fg">{t("settings.privacy.showActivity")}</p>
              <p className="text-sm text-fg-muted">{t("settings.privacy.showActivity.description")}</p>
            </div>
            <Switch checked={showActivity} disabled aria-label={t("settings.privacy.showActivity")} />
          </div>
        </div>
      </div>

      <hr className="border-line" />

      <div className="space-y-4 opacity-50 pointer-events-none select-none">
        <h2 className="text-xl font-bold text-fg">{t("settings.privacy.dataManagement")}</h2>
        <p className="text-fg-muted text-sm">{t("settings.privacy.dataManagement.description")}</p>
        <Button type="button" variant="text" disabled className="px-0">
          <Download className="w-4 h-4" aria-hidden="true" />
          {t("settings.privacy.dataExport")}
        </Button>
      </div>

      <hr className="border-line" />

      <div className="bg-surface border border-danger p-6 rounded-panel opacity-50 pointer-events-none select-none">
        <h2 className="text-danger font-bold mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5" aria-hidden="true" />
          {t("settings.privacy.dangerZone")}
        </h2>
        <p className="text-fg-muted text-sm mb-6">
          {t("settings.privacy.deleteWarning")}
        </p>
        <Button type="button" variant="destructive" disabled>
          {t("settings.privacy.deleteAccount")}
        </Button>
      </div>
    </section>
  );
}
