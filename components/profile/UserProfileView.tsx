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
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("user.profile.backToSong")}
      </Link>

      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
          {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
              {profile.full_name || profile.email}
            </h1>
            {profile.is_musician ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Music className="w-3.5 h-3.5" />
                {t("user.profile.verifiedMusician")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <UserCheck className="w-3.5 h-3.5" />
                {t("user.profile.member")}
              </span>
            )}
          </div>
          {profile.full_name && (
            <p className="text-xs text-gray-400">{profile.email}</p>
          )}
        </div>
      </div>

      {/* Attributed Recordings Section */}
      <div className="space-y-3 text-left">
        <h2 className="text-sm font-semibold text-fg-muted flex items-center gap-2">
          <Mic className="w-4 h-4 text-indigo-500" />
          {t("user.profile.attributedRecordings")} ({profile.attributed_recordings.length})
        </h2>

        {profile.attributed_recordings.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
              {t("user.profile.noAttributedRecordings")}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {profile.attributed_recordings.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
              >
                <div className="min-w-0 pr-3">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {rec.recording_name}
                  </h4>
                  {rec.song_title && (
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium block truncate">
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
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold transition-all shrink-0"
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
