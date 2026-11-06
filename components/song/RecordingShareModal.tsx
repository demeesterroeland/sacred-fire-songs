"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";
import { shareDialogStep } from "@/lib/songs/shareDialogStep";
import { toast } from "sonner";
import { Search, UserPlus, Trash2, Loader2, Music, Check, Shield, Lock, Globe } from "lucide-react";

interface RecordingShareModalProps {
  recording: UserRecording | null;
  isOpen: boolean;
  onClose: () => void;
  onSharesUpdated?: () => void;
  /** False for a private song: the dialog first explains what sharing does (Story 6.1.18). */
  songIsPublic?: boolean;
  /** Song owner or admin: the only ones who can make the song public. */
  canMakeSongPublic?: boolean;
  /** Makes the song public; resolves true on success. */
  onMakeSongPublic?: () => Promise<boolean>;
}

export default function RecordingShareModal({
  recording,
  isOpen,
  onClose,
  onSharesUpdated,
  songIsPublic = true,
  canMakeSongPublic = false,
  onMakeSongPublic,
}: RecordingShareModalProps) {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserProfileSummary[]>([]);
  const [currentShares, setCurrentShares] = useState<RecordingShareInfo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  // Query the last search returned no members for (drives the empty state).
  const [emptyFor, setEmptyFor] = useState<string | null>(null);
  const [publishedHere, setPublishedHere] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  // Guards the confirm against a double tap before React re-renders the disabled button.
  const publishingRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // After the song is made public here, the member search appears: move focus to it.
  useEffect(() => {
    if (publishedHere) searchInputRef.current?.focus();
  }, [publishedHere]);

  useEffect(() => {
    if (recording?.shared_with) {
      setCurrentShares(recording.shared_with);
    } else {
      setCurrentShares([]);
    }
    setSearchQuery("");
    setSearchResults([]);
    setEmptyFor(null);
    setPublishedHere(false);
  }, [recording, isOpen]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setEmptyFor(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsersForSharing(query);
        setEmptyFor(results.length === 0 ? query : null);
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

  const handleConfirmPrivate = async () => {
    if (!onMakeSongPublic || publishingRef.current) return;
    publishingRef.current = true;
    setIsPublishing(true);
    try {
      if (await onMakeSongPublic()) setPublishedHere(true);
    } catch {
      toast.error(t("recording.sharing.error"));
    } finally {
      publishingRef.current = false;
      setIsPublishing(false);
    }
  };

  const step = publishedHere ? "search" : shareDialogStep({ songIsPublic, canMakeSongPublic });
  const showEmpty = step === "search" && !isSearching && emptyFor !== null && emptyFor === searchQuery.trim();

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
      <DialogContent data-testid="share-dialog" className="max-w-md bg-surface border border-line rounded-panel p-6 shadow-sheet">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-title font-semibold text-fg flex items-center gap-2">
            {step === "search" ? (
              <UserPlus className="w-5 h-5 text-fg-muted" aria-hidden />
            ) : (
              <Lock className="w-5 h-5 text-fg-muted" aria-hidden />
            )}
            {step === "confirm-private"
              ? t("recording.sharing.privateSongPrompt.title")
              : step === "not-owner"
                ? t("recording.sharing.privateSongPrompt.notOwnerTitle")
                : t("recording.sharing.title")}
          </DialogTitle>
          <DialogDescription className="text-meta text-fg-muted">
            {recording.recording_name}
          </DialogDescription>
        </DialogHeader>

        {step === "confirm-private" && (
          <div className="min-w-0 space-y-4" data-testid="share-private-confirm">
            <div className="space-y-3 rounded-control border border-line bg-surface-2 p-4 text-left">
              <p className="text-meta text-fg-muted">{t("recording.sharing.privateSongPrompt.body")}</p>
              <ul className="space-y-2 text-meta text-fg">
                <li className="flex items-start gap-2">
                  <Globe className="w-4 h-4 mt-0.5 shrink-0 text-fg-muted" aria-hidden />
                  <span>{t("recording.sharing.privateSongPrompt.effectLyrics")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <UserPlus className="w-4 h-4 mt-0.5 shrink-0 text-fg-muted" aria-hidden />
                  <span>
                    {t("recording.sharing.privateSongPrompt.effectTake", { name: recording.recording_name })}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="w-4 h-4 mt-0.5 shrink-0 text-fg-muted" aria-hidden />
                  <span>{t("recording.sharing.privateSongPrompt.effectPublicTakes")}</span>
                </li>
              </ul>
              <p className="text-meta text-fg-muted">{t("recording.sharing.privateSongPrompt.note")}</p>
            </div>
            <div className="flex flex-row flex-wrap justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isPublishing}>
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleConfirmPrivate}
                disabled={isPublishing || !onMakeSongPublic}
                className="h-auto whitespace-normal text-center"
              >
                {isPublishing ? <Loader2 className="animate-spin" aria-hidden /> : <Globe aria-hidden />}
                {t("recording.sharing.privateSongPrompt.confirm")}
              </Button>
            </div>
          </div>
        )}

        {step === "not-owner" && (
          <div className="min-w-0 space-y-4" data-testid="share-private-not-owner">
            <div className="space-y-2 rounded-control border border-line bg-surface-2 p-4 text-left">
              <p className="text-meta text-fg-muted">{t("recording.sharing.privateSongPrompt.notOwner")}</p>
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.close")}
              </Button>
            </div>
          </div>
        )}

        {step === "search" && (
          <>
            {/* DRM-lite Protection Notice */}
            <div className="flex items-center gap-2.5 p-3 bg-surface-2 border border-line rounded-control text-meta text-fg-muted">
              <Shield className="w-4 h-4 shrink-0" aria-hidden />
              <span>
                {t("recording.sharing.cannotDownload")} {t("recording.sharing.cannotShare")}
              </span>
            </div>

            {/* User Search Input */}
            <div className="space-y-2 mt-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" aria-hidden />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("recording.sharing.searchPlaceholder")}
                  aria-label={t("recording.sharing.searchPlaceholder")}
                  aria-describedby="share-helper"
                  className="w-full min-h-tap pl-9 pr-9 bg-bg border border-line-strong rounded-control text-body outline-none focus-visible:outline-2 focus-visible:outline-focus text-fg placeholder:text-fg-subtle"
                />
                {isSearching && (
                  <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle motion-safe:animate-spin" aria-hidden />
                )}
              </div>
              <p id="share-helper" className="text-meta text-fg-muted text-left">
                {t("recording.sharing.helper")}
              </p>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-control border border-line divide-y divide-line bg-surface shadow-sheet">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3">
                      <div className="text-left min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-body font-semibold text-fg truncate">
                            {user.full_name || user.email}
                          </span>
                          {user.is_musician && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-caption font-semibold bg-surface-2 text-fg-muted">
                              <Music className="w-2.5 h-2.5" aria-hidden />
                              {t("recording.attribution.badgeVerified")}
                            </span>
                          )}
                        </div>
                        {user.full_name && (
                          <span className="text-meta text-fg-muted truncate block">{user.email}</span>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleShareWith(user)}
                        disabled={isSubmitting === user.id}
                        className="shrink-0"
                      >
                        {isSubmitting === user.id ? (
                          <Loader2 className="motion-safe:animate-spin" aria-hidden />
                        ) : (
                          <>
                            <Check aria-hidden />
                            {t("recording.sharing.button")}
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state: nobody registered matches */}
              {showEmpty && (
                <p
                  role="status"
                  data-testid="share-no-results"
                  className="rounded-control border border-line bg-surface-2 p-3 text-meta text-fg-muted text-left"
                >
                  {t("recording.sharing.noResults", { query: searchQuery.trim() })}
                </p>
              )}
            </div>

            {/* Existing Shares List */}
            <div className="space-y-2 mt-4 pt-4 border-t border-line">
              <h3 className="text-meta font-semibold text-fg-muted text-left">
                {t("recording.sharing.sharedWithTitle")} ({currentShares.length})
              </h3>

              {currentShares.length === 0 ? (
                <p className="text-meta text-fg-muted py-2 text-left">{t("recording.sharing.noShares")}</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {currentShares.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-2.5 rounded-control bg-surface-2 border border-line"
                    >
                      <div className="text-left min-w-0 pr-2">
                        <span className="text-meta font-semibold text-fg truncate block">
                          {share.full_name || share.email}
                        </span>
                        {share.full_name && (
                          <span className="text-caption text-fg-muted truncate block">{share.email}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRevoke(share.user_id)}
                        disabled={isSubmitting === share.user_id}
                        className="size-tap flex items-center justify-center rounded-control text-fg-muted hover:text-danger hover:bg-surface-2 transition-colors shrink-0"
                        title={t("recording.sharing.revoke")}
                        aria-label={t("recording.sharing.revoke")}
                      >
                        {isSubmitting === share.user_id ? (
                          <Loader2 className="w-4 h-4 motion-safe:animate-spin" aria-hidden />
                        ) : (
                          <Trash2 className="w-4 h-4" aria-hidden />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
