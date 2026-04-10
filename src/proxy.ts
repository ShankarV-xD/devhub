/**
 * Next.js Proxy (Edge Middleware)
 *
 * Runs on every request at the edge (before pages/API routes).
 *
 * S4: Redirects HTTP → HTTPS in production (permanent 301).
 * S1: Generates a per-request CSP nonce and injects it into both
 *     the request headers (so layout.tsx can read it) and the
 *     response headers (Content-Security-Policy).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // ── S4: HTTPS enforcement ─────────────────────────────────────────────────
  if (process.env.NODE_ENV === "production") {
    const proto = request.headers.get("x-forwarded-proto") ?? "http";
    if (proto === "http") {
      const httpsUrl = request.nextUrl.clone();
      httpsUrl.protocol = "https:";
      return NextResponse.redirect(httpsUrl, 301);
    }
  }

  // ── S1: CSP nonce generation ──────────────────────────────────────────────
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = Buffer.from(nonceBytes).toString("base64");

  const cspHeader = buildCSP();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// ---------------------------------------------------------------------------
// CSP builder
// ---------------------------------------------------------------------------
function buildCSP() {
  const policy = `
    default-src 'self';

    script-src
      'self'
      'unsafe-inline'
      'unsafe-eval'
      https://cdn.jsdelivr.net
      https://unpkg.com;

    style-src
      'self'
      'unsafe-inline'
      https://fonts.googleapis.com
      https://cdn.jsdelivr.net;

    font-src
      'self'
      data:
      https://fonts.gstatic.com;

    img-src
      'self'
      data:
      blob:
      https:;

    connect-src
      'self'
      ${process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"}
      https://api.tinyurl.com
      https://cdn.jsdelivr.net;

    worker-src
      'self'
      blob:;

    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  return policy;
}
