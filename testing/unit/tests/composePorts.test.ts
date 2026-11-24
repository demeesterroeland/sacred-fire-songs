import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * #654: the self-host `docker-compose.yml` and the Supabase CLI dev stack (`supabase/config.toml`)
 * must not publish the same host port, so both can run on one machine and every port has one meaning.
 */
const compose = readFileSync(join(process.cwd(), 'docker-compose.yml'), 'utf8');
const config = readFileSync(join(process.cwd(), 'supabase/config.toml'), 'utf8');

/** Host ports published by docker-compose.yml, with `${VAR:-default}` resolved to its default. */
function composeHostPorts(): number[] {
  const ports: number[] = [];
  for (const match of compose.matchAll(/^\s+-\s+"([^"]+):\d+"\s*$/gm)) {
    const host = match[1].replace(/^\$\{[A-Z0-9_]+:-(\d+)\}$/, '$1');
    ports.push(Number(host));
  }
  return ports;
}

/** Every `port = N` / `smtp_port = N` / `shadow_port = N` in supabase/config.toml (comments ignored). */
function cliPorts(): number[] {
  return config
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .flatMap((line) => {
      const m = line.match(/^\s*(?:port|smtp_port|shadow_port|pop3_port|inspector_port)\s*=\s*(\d+)/);
      return m ? [Number(m[1])] : [];
    });
}

describe('docker-compose.yml host ports (#654)', () => {
  it('publishes only numeric host ports or ${VAR:-number} defaults', () => {
    const ports = composeHostPorts();
    expect(ports.length).toBeGreaterThan(0);
    for (const port of ports) expect(Number.isInteger(port), String(port)).toBe(true);
  });

  it('shares no host port with the Supabase CLI dev stack', () => {
    const cli = new Set(cliPorts());
    expect(cli.has(54321)).toBe(true);
    const clashes = composeHostPorts().filter((port) => cli.has(port));
    expect(clashes).toEqual([]);
  });

  it('keeps the default Supabase URLs in line with the published API port', () => {
    const api = compose.match(/^\s+-\s+"\$\{SFS_API_PORT:-(\d+)\}:8000"\s*$/m)?.[1];
    expect(api).toBeDefined();
    expect(compose).toContain(`NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL:-http://localhost:${api}}`);
    expect(compose).toContain(`SUPABASE_PUBLIC_URL: \${API_EXTERNAL_URL:-http://localhost:${api}}`);
  });
});
