/**
 * The number in the song search placeholder, "Search 1000+ songs" (#657).
 *
 * The placeholder used a fixed number. It now shows the real number of public songs, rounded down so the "+" stays
 * true and the text does not change with every new song: to the hundred from 100 songs, to the ten from 10, exact
 * below that. Null when there is nothing to count or the count is unknown; the search fields then show the
 * placeholder without a number.
 */
export function roundSongCount(count: number | null | undefined): number | null {
  if (count == null || !Number.isFinite(count) || count < 1) return null;
  const whole = Math.floor(count);
  if (whole >= 100) return Math.floor(whole / 100) * 100;
  if (whole >= 10) return Math.floor(whole / 10) * 10;
  return whole;
}
