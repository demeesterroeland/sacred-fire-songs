"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { User as UserIcon, Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProfileSettingsProps {
  user: User;
  profile: any;
}

export default function ProfileSettings({ user, profile }: ProfileSettingsProps) {
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

      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
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

      toast.success("Avatar updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="space-y-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-gray-200 dark:border-white/5 opacity-50">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 ring-2 ring-gray-900/10 dark:ring-white/10 flex items-center justify-center relative">
            {profile?.avatar_url ? (
              <Image 
                src={profile.avatar_url} 
                alt="Avatar" 
                fill 
                className="object-cover" 
                sizes="96px"
              />
            ) : (
              <UserIcon className="w-12 h-12 text-slate-600" />
            )}
          </div>
        </div>
        <div className="text-center md:text-left">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Avatar</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 rounded-full">
              Coming soon
            </span>
          </div>
          <p className="text-sm text-slate-500">Avatar upload will be available soon.</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="flex-1 bg-slate-100/50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#f45d1a] transition-all"
          />
          <button
            onClick={handleSave}
            disabled={isSaving || fullName === (profile?.full_name || "")}
            className="w-full sm:w-44 shrink-0 bg-[#f45d1a] text-white font-semibold px-6 py-3 rounded-xl hover:brightness-110 shadow-lg shadow-orange-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </section>
  );
}
