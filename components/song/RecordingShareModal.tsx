"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  searchUsersForSharing,
  shareRecording,
  unshareRecording,
  type UserProfileSummary,
  type RecordingShareInfo,
  type UserRecording,
} from "@/lib/actions/rehearsal";
import { useLocale } from "@/context/LocaleContext";
import { toast } from "sonner";
import { Search, UserPlus, Trash2, Loader2, Music, Check, Shield } from "lucide-react";

interface RecordingShareModalProps {
  recording: UserRecording | null;
  isOpen: boolean;
  onClose: () => void;
  onSharesUpdated?: () => void;
}

export default function RecordingShareModal({
  recording,
  isOpen,
  onClose,
  onSharesUpdated,
}: RecordingShareModalProps) {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserProfileSummary[]>([]);
  const [currentShares, setCurrentShares] = useState<RecordingShareInfo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (recording?.shared_with) {
      setCurrentShares(recording.shared_with);
    } else {
      setCurrentShares([]);
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
        // Exclude current owner and already shared users
        const filtered = results.filter(
          (u) =>
            u.id !== recording?.user_id &&
            !currentShares.some((s) => s.user_id === u.id)
        );
        setSearchResults(filtered);
      } catch (e) {
        console.error("Search users error:", e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, recording?.user_id, currentShares]);

  if (!recording) return null;

  const handleShareWith = async (targetUser: UserProfileSummary) => {
    setIsSubmitting(targetUser.id);
    try {
      const res = await shareRecording(recording.id, targetUser.id);
      if (res.success) {
        toast.success(t("recording.sharing.success"));
        setCurrentShares((prev) => [
          ...prev,
          {
            id: targetUser.id,
            user_id: targetUser.id,
            email: targetUser.email,
            full_name: targetUser.full_name,
          },
        ]);
        setSearchResults((prev) => prev.filter((u) => u.id !== targetUser.id));
        setSearchQuery("");
        onSharesUpdated?.();
      } else {
        toast.error(res.error || t("recording.sharing.error"));
      }
    } catch {
      toast.error(t("recording.sharing.error"));
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleRevoke = async (targetUserId: string) => {
    setIsSubmitting(targetUserId);
    try {
      const res = await unshareRecording(recording.id, targetUserId);
      if (res.success) {
        toast.success(t("recording.sharing.revokeSuccess"));
        setCurrentShares((prev) => prev.filter((s) => s.user_id !== targetUserId));
        onSharesUpdated?.();
      } else {
        toast.error(res.error || t("recording.sharing.error"));
      }
    } catch {
      toast.error(t("recording.sharing.error"));
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {t("recording.sharing.title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
            {recording.recording_name}
          </DialogDescription>
        </DialogHeader>

        {/* DRM-lite Protection Notice */}
        <div className="flex items-center gap-2.5 p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-xs text-indigo-700 dark:text-indigo-300">
          <Shield className="w-4 h-4 shrink-0 text-indigo-500" />
          <span>
            {t("recording.sharing.cannotDownload")} {t("recording.sharing.cannotShare")}
          </span>
        </div>

        {/* User Search Input */}
        <div className="space-y-2 mt-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("recording.sharing.searchPlaceholder")}
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-950 shadow-lg">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
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
                  <button
                    onClick={() => handleShareWith(user)}
                    disabled={isSubmitting === user.id}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 flex items-center gap-1"
                  >
                    {isSubmitting === user.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        {t("recording.sharing.button")}
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Existing Shares List */}
        <div className="space-y-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <h4 className="text-meta font-semibold text-fg-muted text-left">
            {t("recording.sharing.sharedWithTitle")} ({currentShares.length})
          </h4>

          {currentShares.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic py-2 text-left">
              {t("recording.sharing.noShares")}
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {currentShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800"
                >
                  <div className="text-left min-w-0 pr-2">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white truncate block">
                      {share.full_name || share.email}
                    </span>
                    {share.full_name && (
                      <span className="text-caption text-fg-muted truncate block">
                        {share.email}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRevoke(share.user_id)}
                    disabled={isSubmitting === share.user_id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                    title={t("recording.sharing.revoke")}
                    aria-label={t("recording.sharing.revoke")}
                  >
                    {isSubmitting === share.user_id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
