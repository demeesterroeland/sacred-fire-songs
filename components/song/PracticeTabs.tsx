"use client";

import React from "react";
import { useLocale } from "@/context/LocaleContext";

export type PracticeTabId = "media" | "recorder";

interface PracticeTabsProps {
  /** Prefix for the tab and panel ids (the drawer's `useId()`). */
  idPrefix: string;
  /** Items per tab (`practiceAvailability`); a zero count shows no badge. */
  counts: { listen: number; record: number };
  activeTab: PracticeTabId;
  onSelect: (tab: PracticeTabId) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

/** The Practice drawer's Listen · Record tab strip with count badges (Story 6.1.40 / G4, #586). */
export function PracticeTabs({ idPrefix, counts, activeTab, onSelect, onKeyDown }: PracticeTabsProps) {
  const { t } = useLocale();
  const tabs = [
    { id: "media", testId: "practice-tab-listen", label: t('practice.tab.listen'), count: counts.listen },
    { id: "recorder", testId: "practice-tab-record", label: t('practice.tab.record'), count: counts.record },
  ] as const;
  return (
    <div role="tablist" aria-label={t('practice.title')} onKeyDown={onKeyDown} className="flex px-6 border-b border-line shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`${idPrefix}-tab-${tab.id}`}
          aria-selected={activeTab === tab.id}
          aria-controls={`${idPrefix}-panel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          data-testid={tab.testId}
          onClick={() => onSelect(tab.id)}
          className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all ${
            activeTab === tab.id
              ? "border-accent text-accent"
              : "border-transparent text-fg-muted hover:text-fg"
          }`}
        >
          {tab.label}
          {tab.count > 0 && (
            <span
              data-testid={`${tab.testId}-count`}
              className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-pill bg-chip px-1.5 text-caption font-medium tabular-nums text-on-chip"
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
