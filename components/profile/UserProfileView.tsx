"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import type { MusicianProfileData } from "@/lib/users/serverQueries";
import { ArrowLeft, Mic } from "lucide-react";
import { ProfileRecordingRow } from "@/components/profile/ProfileRecordingRow";
import RoleBadge from "@/components/profile/RoleBadge";

export default function UserProfileView({ profile }: { profile: MusicianProfileData }) {
  const { t } = useLocale();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/songs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-fg-muted hover:text-fg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("user.profile.backToSong")}
      </Link>

      {/* Profile Header Card */}
      <div className="p-6 rounded-panel bg-surface border border-line flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="w-20 h-20 rounded-full bg-surface-2 border border-line flex items-center justify-center text-fg text-2xl font-bold shrink-0">
          {(profile.full_name || t("user.unnamed")).charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-bold text-fg">
              {profile.full_name || t("user.unnamed")}
            </h1>
            <RoleBadge role={profile.role} />
          </div>
        </div>
      </div>

      {/* Attributed Recordings Section */}
      <div className="space-y-3 text-left">
        <h2 className="text-sm font-semibold text-fg-muted flex items-center gap-2">
          <Mic className="w-4 h-4 text-accent" />
          {t("user.profile.attributedRecordings")} ({profile.attributed_recordings.length})
        </h2>

        {profile.attributed_recordings.length === 0 ? (
          <div className="p-8 text-center rounded-panel border border-dashed border-line">
            <p className="text-xs text-fg-muted italic">
              {t("user.profile.noAttributedRecordings")}
            </p>
          </div>
        ) : (
          <ul className="border-y border-line">
            {profile.attributed_recordings.map((rec) => (
              <ProfileRecordingRow key={rec.id} recording={rec} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
