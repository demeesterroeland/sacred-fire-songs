import type { UserRecording } from "@/lib/actions/rehearsal";

/**
 * Story 6.1.15 / G4.2 (#399), UXD-3: the Record tab lists "My takes" and
 * "Shared with me" apart. A take belongs to me when I own it (a take without
 * ownership info, e.g. one just saved on this device, is mine); every other
 * take (shared with me, or public) is "shared". Order is kept in both lists.
 */
export function partitionTakes(takes: ReadonlyArray<UserRecording>): {
  mine: UserRecording[];
  shared: UserRecording[];
} {
  const mine: UserRecording[] = [];
  const shared: UserRecording[] = [];
  for (const take of takes) {
    (take.is_owner === false ? shared : mine).push(take);
  }
  return { mine, shared };
}

/** Display name of the person who shared a take: full name, else email, else null. */
export function sharedByName(
  owner: { full_name?: string | null; email?: string | null } | null | undefined
): string | null {
  const name = owner?.full_name?.trim();
  if (name) return name;
  const email = owner?.email?.trim();
  return email || null;
}
