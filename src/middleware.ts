import { NextRequest, NextResponse } from "next/server";

/**
 * S1: Middleware — CSP nonce generation
 *
 * Generates a cryptographic nonce per request and injects it into:
 *   1. The Content-Security-Policy response header (replacing 'unsafe-inline')
 *   2. A `x-nonce` response header so React components can read it
 *
 * This eliminates the need for 'unsafe-inline' in script-src and style-src,
 * significantly improving XSS protection. The nonce is unique per request
 * so an attacker cannot guess or reuse it.
 *
 * Note: 'unsafe-eval' is still required for Monaco Editor and dynamic imports.
 */

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  const nonce = generateNonce();
  const response = NextResponse.next();

  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com;
    style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://cdn.jsdelivr.net;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https:;
    connect-src 'self' https://us.i.posthog.com https://api.tinyurl.com;
    worker-src 'self' blob:;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-nonce", nonce);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static assets — no CSP needed)
     * - _next/image (image optimization)
     * - favicon.ico, icon.png, apple-icon.png, manifest.json, sw.js
     * - api routes handle their own CSP
     */
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|apple-icon\\.png|manifest\\.json|sw\\.js|api/).*)",
  ],
};
