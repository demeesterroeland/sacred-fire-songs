/**
 * Who runs this server (validation 2, item 12). Every self-hoster runs the same public image, so the operator's
 * details cannot be baked in: they come from the server environment, `OPERATOR_NAME` and `OPERATOR_CONTACT_EMAIL`.
 * Never `NEXT_PUBLIC_`: those are fixed at build time and the images are built once, in public. Read this on the
 * server, on each request (the pages are `force-dynamic`).
 */
export interface Operator {
  name: string | null;
  email: string | null;
}

const MAX_NAME_LENGTH = 200;
// One address, no whitespace, no angle brackets or double quotes: anything else is treated as not set.
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

type Env = Record<string, string | undefined>;

export function readOperator(env: Env = process.env): Operator {
  const name = (env.OPERATOR_NAME ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
  const email = (env.OPERATOR_CONTACT_EMAIL ?? '').trim();
  return { name: name || null, email: EMAIL.test(email) ? email : null };
}
