// #623: the Supabase API proxy passes redirects to the browser instead of following them on the server.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/supabase-api/[...path]/route';

const UPSTREAM = 'http://auth-upstream.test';

function call(path: string[], search = '') {
  const req = new NextRequest(`http://app.test/supabase-api/${path.join('/')}${search}`);
  return GET(req, { params: Promise.resolve({ path }) });
}

describe('Supabase API proxy redirects (#623)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv('SUPABASE_INTERNAL_URL', UPSTREAM);
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('asks fetch not to follow redirects', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 303, headers: { location: '/auth/callback?code=abc' } }));
    await call(['auth', 'v1', 'verify'], '?token=t&type=magiclink');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${UPSTREAM}/auth/v1/verify?token=t&type=magiclink`);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ redirect: 'manual' });
  });

  it('answers a verify redirect with the same 303 and Location', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { status: 303, headers: { location: 'https://app.example/auth/callback?code=abc' } }),
    );
    const res = await call(['auth', 'v1', 'verify'], '?token=t&type=magiclink');
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('https://app.example/auth/callback?code=abc');
  });

  it('leaves a normal response unchanged', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    const res = await call(['rest', 'v1', 'songs']);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('still answers 500 when the upstream cannot be reached', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    const res = await call(['auth', 'v1', 'verify']);
    expect(res.status).toBe(500);
  });
});

// Real upstream (no mocked fetch): the 303 points at a port where nothing listens, so following it fails like in
// production. The proxy must hand the 303 to the browser instead.
describe('Supabase API proxy against a real upstream (#623)', () => {
  it('returns the 303 even when its Location is unreachable from the server', async () => {
    const http = await import('node:http');
    const server = http.createServer((_req, res) => {
      res.writeHead(303, { location: 'http://127.0.0.1:1/auth/callback?code=abc' });
      res.end();
    });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const { port } = server.address() as { port: number };
    vi.stubEnv('SUPABASE_INTERNAL_URL', `http://127.0.0.1:${port}`);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const res = await call(['auth', 'v1', 'verify'], '?token=t&type=magiclink');
      expect(res.status).toBe(303);
      expect(res.headers.get('location')).toBe('http://127.0.0.1:1/auth/callback?code=abc');
    } finally {
      vi.unstubAllEnvs();
      await new Promise<void>((done) => server.close(() => done()));
    }
  });
});
