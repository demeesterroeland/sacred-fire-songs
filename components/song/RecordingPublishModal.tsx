"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { publishRecording, type UserRecording } from "@/lib/actions/rehearsal";
import { useLocale } from "@/context/LocaleContext";
import { toast } from "sonner";
import { Globe, Lock, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { returnFocusToTake } from "@/lib/a11y/returnFocusToTake";
import {
  SONG_NOT_PUBLIC,
  canPublishTake,
  publishAudience,
  publishAudienceKey,
  publishOffer,
} from "@/lib/songs/publishAudience";
import { actionErrorMessage } from '@/lib/errors/actionError';

interface RecordingPublishModalProps {
  recording: UserRecording | null;
  isOpen: boolean;
  onClose: () => void;
  onPublished?: () => void;
  /** Title of the song the take belongs to: shown so the owner knows exactly what is published. */
  songTitle: string;
  /**
   * Whether the song itself is public. `null` while that is not known yet: the dialog waits and
   * does not offer to publish. A take on a private song cannot be published.
   */
  songIsPublic: boolean | null;
  /** Looking up the visibility of the song failed: the dialog says so and does not offer to publish. */
  visibilityUnreadable?: boolean;
  /** Song owner or admin: the only ones who can make the song public. */
  canMakeSongPublic?: boolean;
  /** Makes the song public; resolves true on success. */
  onMakeSongPublic?: () => Promise<boolean>;
}

export default function RecordingPublishModal({
  recording,
  isOpen,
  onClose,
  onPublished,
  songTitle,
  songIsPublic,
  visibilityUnreadable = false,
  canMakeSongPublic = false,
  onMakeSongPublic,
}: RecordingPublishModalProps) {
  const { t } = useLocale();
  const [hasConsent, setHasConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [madePublicHere, setMadePublicHere] = useState(false);
  const [isMakingPublic, setIsMakingPublic] = useState(false);
  // Guards the make-public confirm against a double tap before React re-renders the disabled button.
  const makingPublicRef = useRef(false);

  useEffect(() => {
    setHasConsent(false);
    setMadePublicHere(false);
  }, [isOpen, recording]);

  if (!recording) return null;

  const visibility = { songIsPublic: madePublicHere ? true : songIsPublic, unreadable: visibilityUnreadable && !madePublicHere };
  const audience = publishAudience(visibility);
  const canPublish = canPublishTake(visibility);
  const offer = publishOffer({ ...visibility, canMakeSongPublic });
  const busy = isSubmitting || isMakingPublic;

  const handleConfirmPublish = async () => {
    if (!hasConsent || !canPublish) return;
    setIsSubmitting(true);
    try {
      const res = await publishRecording(recording.id, true);
      if (res.success) {
        toast.success(t("recording.publish.success"));
        onPublished?.();
        onClose();
      } else if (res.code === SONG_NOT_PUBLIC) {
        toast.error(t("recording.publish.errorSongPrivate"));
      } else {
        toast.error(actionErrorMessage(res.error, t, 'recording.publish.error'));
      }
    } catch {
      toast.error(t("recording.publish.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMakeSongPublic = async () => {
    if (!onMakeSongPublic || makingPublicRef.current) return;
    makingPublicRef.current = true;
    setIsMakingPublic(true);
    try {
      if (await onMakeSongPublic()) setMadePublicHere(true);
    } catch {
      toast.error(t("recording.publish.error"));
    } finally {
      makingPublicRef.current = false;
      setIsMakingPublic(false);
    }
  };

  const AudienceIcon = audience === "song-private" ? Lock : audience === "unreadable" ? AlertTriangle : Globe;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent
        data-testid="publish-dialog"
        aria-describedby="publish-take-info publish-audience-text"
        showCloseButton={!busy}
        onCloseAutoFocus={returnFocusToTake(recording.id)}
        className="max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto bg-surface border border-line rounded-panel p-6 shadow-sheet"
      >
        <DialogHeader className="min-w-0 text-left space-y-1">
          <DialogTitle className="text-title font-semibold text-fg flex items-center gap-2">
            <Globe className="w-5 h-5 shrink-0 text-fg-muted" aria-hidden />
            {t("recording.publish.title")}
          </DialogTitle>
          <DialogDescription asChild>
            <div id="publish-take-info" data-testid="publish-take-info" className="min-w-0 text-meta text-fg-muted">
              <p className="font-semibold text-fg [overflow-wrap:anywhere]">{recording.recording_name}</p>
              <p className="[overflow-wrap:anywhere]">{t("recording.publish.songLabel", { title: songTitle })}</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Who will hear it: a public song reaches everyone; a private song has no audience yet.
            The sentence is a status: while the song is checked it reads "Checking…", and the real
            sentence then replaces it in the same element, so the change is announced. */}
        <div className="flex items-start gap-2 rounded-control border border-line bg-surface-2 p-3 text-left">
          <AudienceIcon className="w-4 h-4 mt-0.5 shrink-0 text-fg-muted" aria-hidden />
          <div className="min-w-0 space-y-1 text-meta">
            <p id="publish-audience-text" data-testid="publish-audience" role="status" className="font-semibold text-fg">
              {t(publishAudienceKey(visibility))}
            </p>
            {audience === "everyone" && <p className="text-fg-muted">{t("recording.publish.reversible")}</p>}
          </div>
        </div>

        {offer === "make-song-public" && (
          <div className="space-y-3 rounded-control border border-line p-3 text-left" data-testid="publish-make-song-public">
            <ul className="space-y-2 text-meta text-fg">
              <li className="flex items-start gap-2">
                <Globe className="w-4 h-4 mt-0.5 shrink-0 text-fg-muted" aria-hidden />
                <span>{t("recording.sharing.privateSongPrompt.effectLyrics")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Globe className="w-4 h-4 mt-0.5 shrink-0 text-fg-muted" aria-hidden />
                <span>{t("recording.sharing.privateSongPrompt.effectPublicTakes")}</span>
              </li>
            </ul>
            <p className="text-meta text-fg-muted">{t("recording.sharing.privateSongPrompt.note")}</p>
            <Button
              type="button"
              onClick={handleMakeSongPublic}
              disabled={isMakingPublic || !onMakeSongPublic}
              className="h-auto w-full whitespace-normal text-center"
            >
              {isMakingPublic ? <Loader2 className="motion-safe:animate-spin" aria-hidden /> : <Globe aria-hidden />}
              {t("recording.sharing.privateSongPrompt.confirm")}
            </Button>
          </div>
        )}

        {offer === "ask-owner" && (
          <p className="rounded-control border border-line p-3 text-left text-meta text-fg-muted" data-testid="publish-not-owner">
            {t("recording.publish.privateSong.notOwner")}
          </p>
        )}

        {canPublish && (
          <>
            {/* Singer consent and rights: stated before the checkbox */}
            <div className="space-y-2 rounded-control border border-line-strong p-3 text-left">
              <div className="flex items-center gap-2 text-meta font-semibold text-fg">
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden />
                <span>{t("recording.publish.disclaimerTitle")}</span>
              </div>
              <p className="text-meta text-fg-muted">{t("recording.publish.disclaimerText")}</p>
            </div>

            {/* Explicit consent acknowledgement */}
            <label className="flex min-h-tap items-start gap-3 rounded-control border border-line bg-bg p-3 text-left cursor-pointer hover:bg-surface-2">
              <input
                type="checkbox"
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-accent cursor-pointer"
              />
              <span className="text-meta font-semibold text-fg select-none">
                {t("recording.publish.consentCheckbox")}
              </span>
            </label>
          </>
        )}

        <DialogFooter className="flex flex-row flex-wrap gap-2 sm:justify-end mt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            {t("recording.publish.cancelButton")}
          </Button>
          {canPublish && (
            <Button type="button" onClick={handleConfirmPublish} disabled={!hasConsent || isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="motion-safe:animate-spin" aria-hidden />
              ) : (
                <Globe aria-hidden />
              )}
              {t("recording.publish.confirmButton")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
