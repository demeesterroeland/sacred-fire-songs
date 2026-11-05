export type SettingsTab = "profile" | "account" | "preferences" | "privacy";

const TAB_IDS: readonly SettingsTab[] = ["profile", "account", "preferences", "privacy"];

/**
 * Maps the `?tab=` query value to a settings tab; unknown values open Profile.
 * Lives outside the "use client" AccountSettings module so the server page can call it.
 */
export function parseSettingsTab(value: string | string[] | undefined): SettingsTab {
  const tab = Array.isArray(value) ? value[0] : value;
  return TAB_IDS.find((id) => id === tab) ?? "profile";
}
