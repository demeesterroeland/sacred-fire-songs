import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * #651: `supabase/config.toml` must parse with the pinned Supabase CLI 3.x. The 3.x CLI renamed the
 * `[inbucket]` mail catcher section to `[local_smtp]` and renamed `enable_signup` to `enabled` under
 * `[auth.email]` / `[auth.sms]`. The mail catcher keeps its ports: UI + API on 54324, SMTP on 54325.
 */
const config = readFileSync(join(process.cwd(), 'supabase/config.toml'), 'utf8');
const lines = config.split('\n').filter((line) => !line.trim().startsWith('#'));

/** Body of a `[section]` without comment lines, up to the next section header. */
function section(name: string): string {
  const start = lines.findIndex((line) => line.trim() === `[${name}]`);
  if (start === -1) return '';
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^\s*\[/.test(line));
  return (end === -1 ? rest : rest.slice(0, end)).join('\n');
}

describe('supabase/config.toml (CLI 3.x)', () => {
  it('uses [local_smtp], not the removed [inbucket] section', () => {
    expect(lines.some((line) => line.trim() === '[inbucket]')).toBe(false);
    expect(section('local_smtp')).toMatch(/^enabled\s*=\s*true$/m);
  });

  it('keeps the mail catcher ports the app and the E2E specs rely on', () => {
    const smtp = section('local_smtp');
    expect(smtp).toMatch(/^port\s*=\s*54324$/m);
    expect(smtp).toMatch(/^smtp_port\s*=\s*54325$/m);
  });

  it('uses `enabled` (not the deprecated `enable_signup`) under [auth.email] and [auth.sms]', () => {
    for (const name of ['auth.email', 'auth.sms']) {
      expect(section(name), name).toMatch(/^enabled\s*=/m);
      expect(section(name), name).not.toMatch(/^enable_signup\s*=/m);
    }
  });
});
