"use client";

import React, { useRef } from "react";
import { Download, Globe, Link2, Lock, Mic, Pause, Pencil, Play, Share2, Trash2 } from "lucide-react";
import { BottomSheet, BottomSheetContent, SheetAction, SheetSeparator } from "@/components/ui/bottom-sheet";
import { useLocale } from "@/context/LocaleContext";
import type { UserRecording } from "@/lib/actions/rehearsal";
import { takeActionGroups, type TakeActionId } from "@/lib/songs/takeActions";

/** Actions that must run inside the tap (user-gesture APIs), not after the sheet closes. */
const IMMEDIATE: ReadonlySet<TakeActionId> = new Set<TakeActionId>(["play", "download", "copyLink", "visibility"]);

export type TakeActionHandlers = Record<TakeActionId, () => void>;

interface TakeActionsSheetProps {
  take: UserRecording;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPlaying: boolean;
  /** Handlers by action id; `copyLink` is optional (no row action without it). */
  on: Partial<TakeActionHandlers> & Pick<TakeActionHandlers, "play" | "delete">;
}

/**
 * The actions of a take in a grouped bottom action sheet (Story 6.1.17 / G4.4, #401):
 * listen / rename / download, then share / singer / visibility / copy link, then
 * Delete alone in `text-danger`. Delete asks for confirmation (the caller opens it).
 * The chosen action runs after the sheet has closed, so two dialogs never overlap
 * and focus lands where the action wants it (e.g. the rename field).
 */
export default function TakeActionsSheet({ take, open, onOpenChange, isPlaying, on }: TakeActionsSheetProps) {
  const { t } = useLocale();
  const afterClose = useRef<{ id: TakeActionId; run: () => void } | null>(null);
  const groups = takeActionGroups(take, { canCopyLink: !!on.copyLink });
  const shareCount = take.shared_with?.length ?? 0;

  const choose = (id: TakeActionId) => {
    const handler = on[id];
    if (handler && IMMEDIATE.has(id)) {
      // Clipboard, audio.play() and downloads need the tap itself (iOS Safari).
      handler();
      onOpenChange(false);
      return;
    }
    afterClose.current = handler ? { id, run: handler } : null;
    onOpenChange(false);
  };

  const rows: Record<TakeActionId, { icon: React.ReactNode; label: string; disabled?: boolean; tone?: "danger"; badge?: number }> = {
    play: {
      icon: isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current" />,
      label: !take.audioUrl
        ? t("rehearsal.recording.missingTitle")
        : isPlaying
          ? t("rehearsal.recording.pause")
          : t("rehearsal.recording.play"),
      disabled: !take.audioUrl,
    },
    rename: { icon: <Pencil />, label: t("rehearsal.recording.edit.ariaLabel") },
    download: { icon: <Download />, label: t("rehearsal.recording.download.ariaLabel"), disabled: !take.audioUrl },
    share: { icon: <Share2 />, label: t("recording.sharing.button"), badge: shareCount },
    singer: { icon: <Mic />, label: t("recording.attribution.button") },
    visibility: {
      icon: take.is_public ? <Lock /> : <Globe />,
      label: take.is_public ? t("recording.publish.makePrivate") : t("recording.publish.makePublic"),
    },
    copyLink: { icon: <Link2 />, label: t("rehearsal.recording.copyLink") },
    delete: { icon: <Trash2 />, label: t("rehearsal.recording.delete.ariaLabel"), tone: "danger" },
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent
        title={take.recording_name}
        onCloseAutoFocus={(e) => {
          const next = afterClose.current;
          if (!next) return;
          afterClose.current = null;
          if (next.id === "rename") {
            // The rename field takes focus itself.
            e.preventDefault();
            next.run();
            return;
          }
          // Let focus return to the ⋯ trigger first, so the dialog that opens next
          // gives focus back to it when it closes.
          setTimeout(next.run, 0);
        }}
      >
        <div className="pb-2">
          {groups.map((group, i) => (
            <React.Fragment key={group.key}>
              {i > 0 && <SheetSeparator />}
              <div role="group" data-testid={`take-actions-${group.key}`}>
                {group.actions.map((id) => {
                  const row = rows[id];
                  return (
                    <SheetAction
                      key={id}
                      icon={row.icon}
                      tone={row.tone}
                      disabled={row.disabled}
                      data-action={id}
                      onClick={() => choose(id)}
                    >
                      {row.label}
                      {row.badge ? (
                        <>
                          <span aria-hidden="true" className="ml-2 text-caption text-fg-muted">{row.badge}</span>
                          <span className="sr-only">, {t("recording.status.sharedLabel", { count: row.badge })}</span>
                        </>
                      ) : null}
                    </SheetAction>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
