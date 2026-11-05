/**
 * Product feature switches. A feature that is off keeps its route and data
 * model but has no entry point in the UI.
 *
 * - albums: on the roadmap, hidden (UX v2 owner decision UXD-4,
 *   docs/design/adr/0004-ux-v2-albums-hidden.md).
 */
export type Features = { albums: boolean };

export const FEATURES: Features = { albums: false };
