"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import type { MusicianProfileData } from "@/lib/users/serverQueries";
import { Music, ArrowLeft, Mic, Calendar, UserCheck } from "lucide-react";

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
            {profile.is_musician ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-control text-xs font-semibold bg-surface-2 text-fg border border-line">
                <Music className="w-3.5 h-3.5" />
                {t("user.profile.verifiedMusician")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-control text-xs font-medium bg-surface-2 text-fg border border-line">
                <UserCheck className="w-3.5 h-3.5" />
                {t("user.profile.member")}
              </span>
            )}
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
          <div className="divide-y divide-line border-y border-line">
            {profile.attributed_recordings.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between py-3 px-2 hover:bg-surface-2 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <h4 className="text-sm font-bold text-fg truncate">
                    {rec.recording_name}
                  </h4>
                  {rec.song_title && (
                    <span className="text-xs text-fg-muted font-medium block truncate">
                      {rec.song_title}
                    </span>
                  )}
                  <div className="text-caption text-fg-muted flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(rec.created_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                {rec.song_id && (
                  <Link
                    href={`/songs/${rec.song_id}`}
                    className="px-3 py-1.5 rounded-control bg-surface-2 text-fg border border-line hover:bg-line text-xs font-semibold transition-colors shrink-0"
                  >
                    {t("user.profile.backToSong")}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
