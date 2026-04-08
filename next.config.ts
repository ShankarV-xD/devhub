import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// ── S1: Content Security Policy ───────────────────────────────────────────────
// This is the static fallback CSP (no nonce) applied via next.config headers.
// The middleware.ts adds a stricter nonce-based CSP on every live request.
// Both layers work together.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
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

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {},

  // ── S1 + S4: Security headers applied to every route ─────────────────────
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // S1: Primary XSS / injection defence
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          // S1: Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // S1: Prevent MIME-type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // S1: Referrer leakage control
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // S1: Disable browser features DevHub doesn't use
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // S4: Force HTTPS for 2 years and include subdomains
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Additional: Prevent cross-origin attacks
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default withBundleAnalyzer(withPWA(nextConfig));
