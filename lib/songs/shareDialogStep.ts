// Story 6.1.18 / G4.5 (#402): which step the Share dialog opens on.
//
// Sharing a take needs a public song (`shareRecording` refuses a private one so the member can
// open the lyrics). Only the song owner or an admin can make a song public (`makeSongPublic`).
export type ShareStep = 'search' | 'confirm-private' | 'not-owner';

export function shareDialogStep(opts: { songIsPublic: boolean; canMakeSongPublic: boolean }): ShareStep {
  if (opts.songIsPublic) return 'search';
  return opts.canMakeSongPublic ? 'confirm-private' : 'not-owner';
}
