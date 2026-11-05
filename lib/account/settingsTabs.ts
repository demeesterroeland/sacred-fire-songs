import { FEATURES, type Features } from "@/lib/features";

export type SettingsTab = "profile" | "account" | "preferences" | "privacy";

/** Tabs a member can open. "Privacy & Data" stays hidden while `privacySettings` is off (Story 6.1.5, #389). */
export function visibleSettingsTabs(features: Features = FEATURES): SettingsTab[] {
  const tabs: SettingsTab[] = ["profile", "account", "preferences"];
  if (features.privacySettings) tabs.push("privacy");
  return tabs;
}

/**
 * Maps the `?tab=` query value to a settings tab; unknown or hidden values open Profile.
 * Lives outside the "use client" AccountSettings module so the server page can call it.
 */
export function parseSettingsTab(
  value: string | string[] | undefined,
  features: Features = FEATURES,
): SettingsTab {
  const tab = Array.isArray(value) ? value[0] : value;
  return visibleSettingsTabs(features).find((id) => id === tab) ?? "profile";
}
