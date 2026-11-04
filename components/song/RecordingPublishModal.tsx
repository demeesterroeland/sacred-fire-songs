"use client";

import React, { useState, useEffect } from "react";
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
import { Globe, AlertTriangle, Loader2 } from "lucide-react";

interface RecordingPublishModalProps {
  recording: UserRecording | null;
  isOpen: boolean;
  onClose: () => void;
  onPublished?: () => void;
}

export default function RecordingPublishModal({
  recording,
  isOpen,
  onClose,
  onPublished,
}: RecordingPublishModalProps) {
  const { t } = useLocale();
  const [hasConsent, setHasConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setHasConsent(false);
  }, [isOpen, recording]);

  if (!recording) return null;

  const handleConfirmPublish = async () => {
    if (!hasConsent) return;
    setIsSubmitting(true);
    try {
      const res = await publishRecording(recording.id, true);
      if (res.success) {
        toast.success(t("recording.publish.success"));
        onPublished?.();
        onClose();
      } else {
        toast.error(res.error || t("recording.publish.error"));
      }
    } catch {
      toast.error(t("recording.publish.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {t("recording.publish.title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
            {recording.recording_name}
          </DialogDescription>
        </DialogHeader>

        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed text-left">
          {t("recording.publish.description")}
        </p>

        {/* Singer Consent & Rights Explicit Disclaimer Box */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left space-y-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{t("recording.publish.disclaimerTitle")}</span>
          </div>
          <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            {t("recording.publish.disclaimerText")}
          </p>
        </div>

        {/* Explicit Consent Acknowledgement Checkbox */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 cursor-pointer text-left hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <input
            type="checkbox"
            checked={hasConsent}
            onChange={(e) => setHasConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer shrink-0"
          />
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 select-none leading-snug">
            {t("recording.publish.consentCheckbox")}
          </span>
        </label>

        <DialogFooter className="flex gap-2 sm:justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all"
          >
            {t("recording.publish.cancelButton")}
          </button>
          <button
            type="button"
            onClick={handleConfirmPublish}
            disabled={!hasConsent || isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
            {t("recording.publish.confirmButton")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
