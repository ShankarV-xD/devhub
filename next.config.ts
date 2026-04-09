import type { NextConfig } from "next";
import createBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// ── S1: Content Security Policy ───────────────────────────────────────────────
// This is the STATIC fallback CSP applied via next.config headers.
// The middleware (src/middleware.ts) overrides this for page routes with a
// nonce-based CSP that eliminates 'unsafe-inline' for scripts and styles.
// This static fallback still protects static assets, images, and error pages.
// The proxy route also adds its own nonce-based CSP for API endpoints.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com;
  style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net;
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

import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-cache",
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "gstatic-fonts-cache",
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "jsdelivr-cache",
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /^https:\/\/unpkg\.com\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "unpkg-cache",
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
  buildExcludes: [/app-build-manifest\.json$/],
});

export default withBundleAnalyzer(pwaConfig(nextConfig));
