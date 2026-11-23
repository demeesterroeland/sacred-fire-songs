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
  getOwnSingerEmail,
  type UserProfileSummary,
  type UserRecording,
} from "@/lib/actions/rehearsal";
import { useLocale } from "@/context/LocaleContext";
import { toast } from "sonner";
import { Mic, Search, Music, Loader2, UserX } from "lucide-react";
import { actionErrorMessage } from '@/lib/errors/actionError';
import { Button } from "@/components/ui/button";

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
  // False while the stored singer address is loading or could not be loaded; then a save
  // with an empty address field keeps the stored one instead of clearing it.
  const [emailLoaded, setEmailLoaded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setEmailLoaded(true);
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
        setCustomEmail("");
        // The address is not part of the take; only the owner may read it back.
        if (isOpen && recording.is_owner) {
          setEmailLoaded(false);
          getOwnSingerEmail(recording.id)
            .then(({ ok, email }) => {
              if (cancelled || !ok) return;
              // Do not overwrite what the owner typed meanwhile.
              setCustomEmail((typed) => typed || email || "");
              setEmailLoaded(true);
            })
            .catch((e) => console.error("Load singer email error:", e));
        }
      } else {
        setSelectedUser(null);
        setIsUnregistered(false);
        setCustomName("");
        setCustomEmail("");
      }
    }
    setSearchQuery("");
    setSearchResults([]);
    return () => {
      cancelled = true;
    };
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
      let singerEmail: string | null | undefined = null;

      if (isUnregistered) {
        singerName = customName.trim();
        const typed = customEmail.trim();
        singerEmail = typed || (emailLoaded ? null : undefined);
      } else if (selectedUser) {
        singerProfileId = selectedUser.id;
        // A registered singer is named from the profile; no address is stored for them.
        singerName = selectedUser.full_name || null;
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
      <DialogContent onCloseAutoFocus={returnFocusToTake(recording.id)} className="max-w-md bg-surface text-fg border border-line rounded-panel p-6 shadow-sheet">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-lg font-extrabold text-fg flex items-center gap-2">
            <Mic aria-hidden="true" className="w-5 h-5 text-fg-muted" />
            {t("recording.attribution.title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-fg-muted">
            {recording.recording_name}
          </DialogDescription>
        </DialogHeader>

        {/* Toggle between Registered Musician vs Unregistered Singer */}
        <label className="flex items-center gap-2.5 p-3 rounded-control border border-line bg-surface-2 cursor-pointer text-left text-xs font-semibold text-fg">
          <input
            type="checkbox"
            checked={isUnregistered}
            onChange={(e) => {
              setIsUnregistered(e.target.checked);
              if (e.target.checked) setSelectedUser(null);
            }}
            className="w-4 h-4 rounded accent-accent cursor-pointer"
          />
          <span>{t("recording.attribution.unregisteredCheckbox")}</span>
        </label>

        {!isUnregistered ? (
          <div className="space-y-3 text-left">
            {selectedUser ? (
              <div className="p-3.5 rounded-control bg-accent-soft border border-accent flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-fg">
                      {selectedUser.full_name || t("user.unnamed")}
                    </span>
                    {selectedUser.is_musician && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-caption font-semibold bg-surface-2 text-fg-muted">
                        <Music className="w-3 h-3" />
                        {t("recording.attribution.badgeVerified")}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  aria-label={t("recording.attribution.clearSinger")}
                  title={t("recording.attribution.clearSinger")}
                  className="inline-flex size-tap shrink-0 items-center justify-center rounded-control text-fg-muted hover:text-danger hover:bg-surface transition-colors"
                >
                  <UserX aria-hidden="true" className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search aria-hidden="true" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("recording.attribution.searchPlaceholder")}
                    aria-label={t("recording.attribution.searchPlaceholder")}
                    className="w-full pl-9 pr-8 py-2.5 bg-bg border border-line-strong rounded-control text-sm text-fg placeholder:text-fg-subtle"
                  />
                  {isSearching && (
                    <Loader2 aria-hidden="true" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle animate-spin" />
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="max-h-44 overflow-y-auto rounded-control border border-line divide-y divide-line bg-surface shadow-sheet">
                    {searchResults.map((user) => (
                      <button
                        type="button"
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="w-full flex items-center justify-between p-3 min-h-tap hover:bg-surface-2 cursor-pointer transition-colors"
                      >
                        <div className="text-left min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-fg truncate">
                              {user.full_name || t("user.unnamed")}
                            </span>
                            {user.is_musician && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-caption font-semibold bg-surface-2 text-fg-muted">
                                <Music className="w-2.5 h-2.5" />
                                {t("recording.attribution.badgeVerified")}
                              </span>
                            )}
                          </div>
                        </div>
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
              <label className="text-xs font-bold text-fg block mb-1">
                {t("recording.attribution.namePlaceholder")}
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={t("recording.attribution.namePlaceholder")}
                aria-label={t("recording.attribution.namePlaceholder")}
                className="w-full px-3 py-2 bg-bg border border-line-strong rounded-control text-sm text-fg placeholder:text-fg-subtle"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-fg block mb-1">
                {t("recording.attribution.emailPlaceholder")}
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder={t("recording.attribution.emailPlaceholder")}
                aria-label={t("recording.attribution.emailPlaceholder")}
                className="w-full px-3 py-2 bg-bg border border-line-strong rounded-control text-sm text-fg placeholder:text-fg-subtle"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between items-center mt-4 pt-4 border-t border-line">
          {(recording.singer_profile_id || recording.singer_name) ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isSubmitting}
              className="text-danger"
            >
              {t("recording.attribution.removeButton")}
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={
                isSubmitting ||
                (!isUnregistered && !selectedUser) ||
                (isUnregistered && !customName.trim())
              }
            >
              {isSubmitting && <Loader2 aria-hidden="true" className="animate-spin" />}
              {t("recording.attribution.saveButton")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
