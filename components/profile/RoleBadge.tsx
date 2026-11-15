"use client";

// Story 6.1.38 (#534): one badge per role on a profile page.
import React from "react";
import { Award, KeyRound, Music, Shield, UserCheck, type LucideIcon } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { roleBadge, type RoleBadgeIcon } from "@/lib/users/roleBadge";

const ICONS: Record<RoleBadgeIcon, LucideIcon> = { Shield, KeyRound, Award, Music, UserCheck };

export default function RoleBadge({ role }: { role: string | null | undefined }) {
  const { t } = useLocale();
  const badge = roleBadge(role);
  const Icon = ICONS[badge.icon];

  return (
    <span
      data-testid="profile-role-badge"
      data-role={badge.role}
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-control text-xs font-semibold bg-surface-2 text-fg border border-line"
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" data-icon={badge.icon} />
      {t(badge.labelKey)}
    </span>
  );
}
