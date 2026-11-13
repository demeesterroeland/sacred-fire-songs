"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { User as UserIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { FEATURES } from "@/lib/features";
import { Button } from "@/components/ui/button";

interface ProfileSettingsProps {
  user: User;
  profile: any;
}

export default function ProfileSettings({ user, profile }: ProfileSettingsProps) {
  const { t } = useLocale();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;

      toast.success(t("settings.profile.success"));
      router.refresh();
    } catch (error: any) {
      console.error('[settings]', error);
      toast.error(t("settings.profile.error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      toast.error(t("settings.profile.avatar.notImage"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("settings.profile.avatar.tooLarge"));
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      // 1. Upload the file
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // 3. Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success(t("settings.profile.avatar.success"));
      router.refresh();
    } catch (error: any) {
      console.error('[settings]', error);
      toast.error(t("settings.profile.avatar.error"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="space-y-8">
      {/* Avatar upload is unfinished: hidden until FEATURES.avatarUpload is on (Story 6.1.5, #389). */}
      {FEATURES.avatarUpload && (
        <>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-line opacity-50">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-2 ring-1 ring-line flex items-center justify-center relative">
              {profile?.avatar_url ? (
                <Image 
                  src={profile.avatar_url} 
                  alt={t('settings.profile.avatar')} 
                  fill 
                  className="object-cover" 
                  sizes="96px"
                />
              ) : (
                <UserIcon className="w-12 h-12 text-fg-muted" aria-hidden="true" />
              )}
            </div>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-fg">{t("settings.profile.avatar")}</h3>
          </div>
        </div>
        </>
      )}

      <div className="space-y-2">
        <label htmlFor="profile-display-name" className="text-meta font-semibold text-fg-muted ml-1">{t("settings.profile.displayName")}</label>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            id="profile-display-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="flex-1 min-h-tap bg-surface border border-line-strong px-4 py-2.5 rounded-control text-fg transition-colors"
          />
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || fullName === (profile?.full_name || "")}
            className="w-full sm:w-44 shrink-0"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {isSaving ? t("settings.profile.saving") : t("settings.profile.save")}
          </Button>
        </div>
      </div>
    </section>
  );
}
