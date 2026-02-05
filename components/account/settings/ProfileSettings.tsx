"use client";

import { useState, useRef } from "react";
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

  const handleRemoveAvatar = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Avatar removed");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove avatar");
    }
  };

  return (
    <section className="bg-slate-800/40 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-3xl space-y-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-white/5">
        <div className="relative group">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 ring-2 ring-[#f45d1a]/50 flex items-center justify-center cursor-pointer relative"
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-[#f45d1a] animate-spin" />
            ) : profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-12 h-12 text-slate-600" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold mb-1 text-white">Avatar</h3>
          <p className="text-sm text-slate-400 mb-4">Recommended: 400x400px. JPG, PNG or GIF.</p>
          <div className="flex gap-3 justify-center md:justify-start">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
            >
              Change
            </button>
            {profile?.avatar_url && (
              <button
                onClick={handleRemoveAvatar}
                className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 px-4 py-4 rounded-xl text-white focus:outline-none focus:border-[#f45d1a] transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#f45d1a] text-white font-semibold px-6 py-3 rounded-xl hover:brightness-110 shadow-lg shadow-orange-900/20 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}
