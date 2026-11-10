"use client";

import { CheckCircle2, Clock, Globe, Users, type LucideIcon } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import type { TakeStatusKind, TakeStatusPill } from "@/lib/songs/takeStatus";

const ICONS: Record<TakeStatusKind, LucideIcon> = {
  public: Globe,
  shared: Users,
  verified: CheckCircle2,
  pending: Clock,
};

/**
 * Status of a take as grey pills with icon and text (Story 6.1.16 / G4.3, #400).
 * The text carries the meaning: touch screens have no tooltips and the icon is decorative.
 */
export function TakeStatusPills({ pills }: { pills: TakeStatusPill[] }) {
  const { t } = useLocale();
  if (pills.length === 0) return null;
  return (
    <ul className="mt-1 flex flex-wrap items-center gap-1" data-testid="take-status">
      {pills.map((pill) => {
        const Icon = ICONS[pill.kind];
        return (
          <li
            key={pill.kind}
            data-status={pill.kind}
            className="inline-flex items-center gap-1 rounded-pill bg-chip px-2 py-0.5 text-caption font-medium text-on-chip"
          >
            <Icon aria-hidden="true" className="size-3 shrink-0" />
            {pill.kind === "shared" ? (
              <>
                <span aria-hidden="true">{t("recording.status.shared", { count: pill.count ?? 0 })}</span>
                <span className="sr-only">{t("recording.status.sharedLabel", { count: pill.count ?? 0 })}</span>
              </>
            ) : (
              t(`recording.status.${pill.kind}`)
            )}
          </li>
        );
      })}
    </ul>
  );
}
