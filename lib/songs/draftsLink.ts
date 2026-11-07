/**
 * The list behind "My Drafts" (Library card, Home counter, account menu, sidebar): my songs that are drafts. The card
 * counts only the signed-in user's own drafts, so the link filters on the owner too (`mine`). An admin reads every
 * draft through row-level security; `status=draft` alone would list all of them.
 */
export const MY_DRAFTS_HREF = '/songs?mine=true&status=draft';
