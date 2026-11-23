/**
 * Hardened validator for `next=` redirect targets (login, sign-up, auth callback / confirm,
 * finish-registration, song form). Only same-site paths survive; everything else becomes `fallback`.
 *
 * Rejects: anything not starting with a single `/`, backslashes, control characters and whitespace
 * (browsers drop `\t`/`\n` inside URLs, so `/\t/evil` becomes `//evil`), percent-encoded variants of
 * those (also double-encoded), and any path that still collapses to `//` after dot-segment
 * normalisation (`/.//evil`, `/%2e%2e//evil`).
 */
const PROBE_ORIGIN = 'http://x.invalid';
const RAW_FORBIDDEN = /[\u0000- \u007f\\]/;
const DECODED_FORBIDDEN = /[\u0000-\u001f\u007f\\]/;

function pathPart(value: string): string {
  const cut = value.search(/[?#]/);
  return cut === -1 ? value : value.slice(0, cut);
}

function isHostile(pathname: string): boolean {
  return pathname.startsWith('//') || DECODED_FORBIDDEN.test(pathname);
}

export function safeNextPath(next: string | null | undefined, fallback = '/'): string {
  if (typeof next !== 'string' || !next.startsWith('/') || RAW_FORBIDDEN.test(next)) return fallback;
  if (next.startsWith('//')) return fallback;

  // Percent-decode the path part up to three times; every layer must stay a single-slash, backslash-free path.
  let layer = pathPart(next);
  for (let i = 0; i < 3; i += 1) {
    if (isHostile(layer)) return fallback;
    let decoded: string;
    try {
      decoded = decodeURIComponent(layer);
    } catch {
      return fallback;
    }
    if (decoded === layer) break;
    layer = decoded;
  }
  if (isHostile(layer)) return fallback;

  let url: URL;
  try {
    url = new URL(next, PROBE_ORIGIN);
  } catch {
    return fallback;
  }
  if (url.origin !== PROBE_ORIGIN) return fallback;
  if (isHostile(url.pathname)) return fallback;
  return url.pathname + url.search + url.hash;
}
