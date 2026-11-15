/**
 * Product feature switches. A feature that is off keeps its code, route and data
 * model but has no entry point in the UI, so members never meet a "coming soon"
 * placeholder or a control that does nothing (Story 6.1.5 / G1.5, #389).
 * Switch one on only when it works end to end.
 *
 * - albums: on the roadmap, hidden (UX v2 owner decision UXD-4,
 *   docs/design/adr/0004-ux-v2-albums-hidden.md).
 * - avatarUpload: the Profile avatar block (upload is not wired to a visible control yet).
 * - privacySettings: the Settings "Privacy & Data" tab (its toggles, export and delete do nothing yet).
 * - plannedPreferences: the Preferences rows for auto-scroll, default chord display and offline mode
 *   (not implemented; offline mode ships with the Offline Library epic).
 * - melodyNotation: the "Melody notation" section of the song form.
 */
export type Features = {
  albums: boolean;
  avatarUpload: boolean;
  privacySettings: boolean;
  plannedPreferences: boolean;
  melodyNotation: boolean;
};

export const FEATURES: Features = {
  albums: false,
  avatarUpload: false,
  privacySettings: false,
  plannedPreferences: false,
  melodyNotation: false,
};
