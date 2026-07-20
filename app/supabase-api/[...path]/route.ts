import { NextRequest, NextResponse } from 'next/server';

async function proxyRequest(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const subPath = path.join('/');
  const isDev = process.env.NODE_ENV === "development";
  const targetBase = (isDev
    ? process.env.NEXT_PUBLIC_SUPABASE_URL_DEV
    : process.env.NEXT_PUBLIC_SUPABASE_URL) || "http://127.0.0.1:54321";

  const searchParams = request.nextUrl.search;
  const targetUrl = `${targetBase}/${subPath}${searchParams}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  // Avoid compression issues when proxying
  headers.delete('accept-encoding');

  try {
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
    });

    const responseHeaders = new Headers(response.headers);
    // Remove content-encoding header as fetch decompresses the response
    responseHeaders.delete('content-encoding');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Supabase API proxy error:', error);
    return NextResponse.json({ error: 'Supabase API proxy error' }, { status: 500 });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
export const OPTIONS = proxyRequest;
