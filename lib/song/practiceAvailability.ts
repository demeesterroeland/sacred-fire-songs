/**
 * Story 6.1.40 / G4 (#586): what the song page's Practice dot and the drawer's tab counts show.
 *
 * - Listen lists the reference providers (YouTube, SoundCloud, Spotify) with a link; a guest also hears the
 *   public takes there.
 * - Record lists every take a member can open (their own, shared with them, public). A guest cannot open it.
 * - `available` is the single dot on Practice: anything to listen to or practise. Zero counts are hidden.
 */
export interface PracticeAvailabilityInput {
  /** Reference providers with a link on the shown version. */
  providerCount: number;
  /** Takes of the shown version the viewer can open (already filtered by access). */
  takeCount: number;
  isMember: boolean;
}

export interface PracticeAvailability {
  listen: number;
  record: number;
  available: boolean;
}

export function practiceAvailability({ providerCount, takeCount, isMember }: PracticeAvailabilityInput): PracticeAvailability {
  const listen = providerCount + (isMember ? 0 : takeCount);
  const record = isMember ? takeCount : 0;
  return { listen, record, available: listen + record > 0 };
}
