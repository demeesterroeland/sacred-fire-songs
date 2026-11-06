"use client";

import { returnFocusToTake } from "@/lib/a11y/returnFocusToTake";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  updateSingerAttribution,
  searchUsersForSharing,
  type UserProfileSummary,
  type UserRecording,
} from "@/lib/actions/rehearsal";
import { useLocale } from "@/context/LocaleContext";
import { toast } from "sonner";
import { Mic, Search, Music, Loader2, Check, UserX } from "lucide-react";
import { actionErrorMessage } from '@/lib/errors/actionError';

interface RecordingAttributionModalProps {
  recording: UserRecording | null;
  isOpen: boolean;
  onClose: () => void;
  onAttributionUpdated?: () => void;
}

export default function RecordingAttributionModal({
  recording,
  isOpen,
  onClose,
  onAttributionUpdated,
}: RecordingAttributionModalProps) {
  const { t } = useLocale();
  const [isUnregistered, setIsUnregistered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfileSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfileSummary | null>(null);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (recording) {
      if (recording.singer_profile_id && recording.singer_profile) {
        setSelectedUser(recording.singer_profile);
        setIsUnregistered(false);
        setCustomName("");
        setCustomEmail("");
      } else if (recording.singer_name) {
        setIsUnregistered(true);
        setSelectedUser(null);
        setCustomName(recording.singer_name);
        setCustomEmail(recording.singer_email || "");
      } else {
        setSelectedUser(null);
        setIsUnregistered(false);
        setCustomName("");
        setCustomEmail("");
      }
    }
    setSearchQuery("");
    setSearchResults([]);
  }, [recording, isOpen]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsersForSharing(query);
        setSearchResults(results);
      } catch (e) {
        console.error("Search singer error:", e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!recording) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      let singerProfileId: string | null = null;
      let singerName: string | null = null;
      let singerEmail: string | null = null;

      if (isUnregistered) {
        singerName = customName.trim();
        singerEmail = customEmail.trim() || null;
      } else if (selectedUser) {
        singerProfileId = selectedUser.id;
        singerName = selectedUser.full_name || selectedUser.email;
        singerEmail = selectedUser.email;
      }

      const res = await updateSingerAttribution(recording.id, {
        singerProfileId,
        singerName,
        singerEmail,
      });

      if (res.success) {
        toast.success(t("recording.attribution.success"));
        onAttributionUpdated?.();
        onClose();
      } else {
        toast.error(actionErrorMessage(res.error, t, 'recording.attribution.error'));
      }
    } catch {
      toast.error(t("recording.attribution.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    setIsSubmitting(true);
    try {
      const res = await updateSingerAttribution(recording.id, {
        singerProfileId: null,
        singerName: null,
        singerEmail: null,
      });

      if (res.success) {
        toast.success(t("recording.attribution.removeSuccess"));
        onAttributionUpdated?.();
        onClose();
      } else {
        toast.error(actionErrorMessage(res.error, t, 'recording.attribution.error'));
      }
    } catch {
      toast.error(t("recording.attribution.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onCloseAutoFocus={returnFocusToTake(recording.id)} className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {t("recording.attribution.title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
            {recording.recording_name}
          </DialogDescription>
        </DialogHeader>

        {/* Toggle between Registered Musician vs Unregistered Singer */}
        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 cursor-pointer text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={isUnregistered}
            onChange={(e) => {
              setIsUnregistered(e.target.checked);
              if (e.target.checked) setSelectedUser(null);
            }}
            className="w-4 h-4 rounded text-indigo-600 border-gray-300 cursor-pointer"
          />
          <span>{t("recording.attribution.unregisteredCheckbox")}</span>
        </label>

        {!isUnregistered ? (
          <div className="space-y-3 text-left">
            {selectedUser ? (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {selectedUser.full_name || selectedUser.email}
                    </span>
                    {selectedUser.is_musician && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-caption font-semibold bg-surface-2 text-fg-muted">
                        <Music className="w-3 h-3" />
                        {t("recording.attribution.badgeVerified")}
                      </span>
                    )}
                  </div>
                  {selectedUser.full_name && (
                    <span className="text-xs text-gray-400 block mt-0.5">
                      {selectedUser.email}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors text-xs font-bold"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("recording.attribution.searchPlaceholder")}
                    aria-label={t("recording.attribution.searchPlaceholder")}
                    className="w-full pl-9 pr-8 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white"
                  />
                  {isSearching && (
                    <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-950 shadow-md">
                    {searchResults.map((user) => (
                      <button
                        type="button"
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors"
                      >
                        <div className="text-left min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user.full_name || user.email}
                            </span>
                            {user.is_musician && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-caption font-semibold bg-surface-2 text-fg-muted">
                                <Music className="w-2.5 h-2.5" />
                                {t("recording.attribution.badgeVerified")}
                              </span>
                            )}
                          </div>
                          {user.full_name && (
                            <span className="text-xs text-gray-400 truncate block">
                              {user.email}
                            </span>
                          )}
                        </div>
                        <Check className="w-4 h-4 text-indigo-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 text-left">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                {t("recording.attribution.namePlaceholder")}
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={t("recording.attribution.namePlaceholder")}
                aria-label={t("recording.attribution.namePlaceholder")}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                {t("recording.attribution.emailPlaceholder")}
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder={t("recording.attribution.emailPlaceholder")}
                aria-label={t("recording.attribution.emailPlaceholder")}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {(recording.singer_profile_id || recording.singer_name) ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isSubmitting}
              className="px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
            >
              {t("recording.attribution.removeButton")}
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={
                isSubmitting ||
                (!isUnregistered && !selectedUser) ||
                (isUnregistered && !customName.trim())
              }
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {t("recording.attribution.saveButton")}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
