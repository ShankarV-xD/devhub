import { NextRequest, NextResponse } from "next/server";

/**
 * S2: Server-side in-memory rate limiter.
 * Limits each IP to 30 proxy requests per minute — enough for normal
 * API builder usage while preventing abuse.
 */
const proxyRateMap = new Map<string, number[]>();
const PROXY_MAX = 30;
const PROXY_WINDOW_MS = 60_000;

function isProxyRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (proxyRateMap.get(ip) ?? []).filter(
    (t) => now - t < PROXY_WINDOW_MS
  );
  if (hits.length >= PROXY_MAX) return true;
  hits.push(now);
  proxyRateMap.set(ip, hits);
  return false;
}

// ── SSRF Protection ────────────────────────────────────────────────────────
// Comprehensive block list covering:
//   - Loopback (127.0.0.1, ::1, 0.0.0.0, localhost)
//   - Private / internal networks (10.x, 172.16-31.x, 192.168.x)
//   - Link-local (169.254.x.x, fe80::/10)
//   - Cloud metadata endpoints (169.254.169.254)
//   - IPv6-mapped IPv4 bypasses (::ffff:127.0.0.1, etc.)
//   - DNS rebinding: resolve hostname first, then check IP

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "0000:0000:0000:0000:0000:0000:0000:0001",
]);

const PROXY_TIMEOUT_MS = 30_000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5 MB

function isPrivateIP(ip: string): boolean {
  // Normalize IPv6-mapped IPv4 (e.g., ::ffff:192.168.1.1)
  let normalized = ip.toLowerCase();
  const v4Mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (v4Mapped) {
    normalized = v4Mapped[1];
  }

  // IPv4 checks
  const v4Parts = normalized.split(".");
  if (v4Parts.length === 4) {
    const octets = v4Parts.map(Number);
    if (octets.some(isNaN)) return false;

    const [a, b, c, d] = octets;

    // Loopback
    if (a === 127) return true;
    // Private Class A: 10.0.0.0/8
    if (a === 10) return true;
    // Private Class B: 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // Private Class C: 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // Link-local: 169.254.0.0/16
    if (a === 169 && b === 254) return true;
    // Carrier-grade NAT: 100.64.0.0/10
    if (a === 100 && b >= 64 && b <= 127) return true;
    // IETF protocol: 0.0.0.0/8
    if (a === 0) return true;
    // Broadcast
    if (a === 255 && b === 255 && c === 255 && d === 255) return true;
  }

  // IPv6 checks (after normalizing)
  if (normalized.includes(":")) {
    // Loopback
    if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;
    // Link-local
    if (normalized.startsWith("fe80:")) return true;
    // Unique local
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    // IPv4-mapped (already handled above, but catch all)
    if (normalized.includes(":ffff:")) return true;
  }

  return false;
}

async function urlIsSafe(
  url: string
): Promise<{ safe: boolean; reason?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { safe: false, reason: "Invalid URL" };
  }

  // Block non-HTTP(S) protocols
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { safe: false, reason: "Only HTTP(S) protocols are allowed" };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Check against explicit blocked hosts list
  if (BLOCKED_HOSTS.has(hostname)) {
    return { safe: false, reason: "Requests to this host are not allowed" };
  }

  // Resolve the hostname to check the actual IP (DNS rebinding protection)
  let resolvedIPs: string[];
  try {
    const { lookup } = await import("dns").then((m) => m.promises ?? m);
    const result = await lookup(hostname);
    resolvedIPs = Array.isArray(result)
      ? result.map((r) => r.address)
      : [result.address];
  } catch {
    // DNS resolution failed — try to proceed but block obvious issues.
    // If hostname looks like an IP, check it directly.
    resolvedIPs = [hostname];
  }

  for (const ip of resolvedIPs) {
    if (isPrivateIP(ip)) {
      return {
        safe: false,
        reason: "Requests to private/internal networks are not allowed",
      };
    }
  }

  return { safe: true };
}

/**
 * Server-side proxy for the API Request Builder.
 *
 * WHY THIS EXISTS:
 * Browsers enforce CORS — if the target server doesn't include
 * `Access-Control-Allow-Origin` in its response headers, the browser
 * blocks the request even if the server responded with 200 OK.
 * This route forwards requests from the browser to the target URL on the
 * server side (Node.js), where CORS doesn't apply, and streams the
 * response back to the client.
 */

export async function POST(req: NextRequest) {
  // S2: Rate limit by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isProxyRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment before retrying." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let payload: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
  };

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid proxy request payload" },
      { status: 400 }
    );
  }

  const { url, method, headers, body } = payload;

  if (!url) {
    return NextResponse.json(
      { error: "Missing required field: url" },
      { status: 400 }
    );
  }

  // SSRF: Validate the target URL against private networks
  const safetyCheck = await urlIsSafe(url);
  if (!safetyCheck.safe) {
    return NextResponse.json({ error: safetyCheck.reason }, { status: 403 });
  }

  // Remove host header to prevent Host header injection
  const safeHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase();
    if (
      lower === "host" ||
      lower === "connection" ||
      lower === "transfer-encoding"
    ) {
      continue;
    }
    safeHeaders[key] = value;
  }

  const startTime = Date.now();

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: safeHeaders,
      signal: controller.signal,
      redirect: "follow",
      ...(method.toUpperCase() !== "GET" &&
        method.toUpperCase() !== "HEAD" &&
        body !== undefined && { body }),
    };

    const upstream = await fetch(url, fetchOptions);
    clearTimeout(timeout);

    // Enforce maximum response size
    const contentLength = upstream.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
      return NextResponse.json(
        {
          error: `Response too large (max ${MAX_RESPONSE_BYTES / 1024 / 1024}MB)`,
        },
        { status: 413 }
      );
    }

    const responseText = await upstream.text();
    const time = Date.now() - startTime;

    // Check actual response size (for responses without Content-Length or compressed)
    if (responseText.length > MAX_RESPONSE_BYTES) {
      return NextResponse.json(
        {
          error: `Response too large (max ${MAX_RESPONSE_BYTES / 1024 / 1024}MB)`,
        },
        { status: 413 }
      );
    }

    // Forward safe response headers back to the client
    const responseHeaders: Record<string, string> = {};
    const blockedResponseHeaders = new Set([
      "set-cookie",
      "set-cookie2",
      "www-authenticate",
      "proxy-authenticate",
      "proxy-authorization",
    ]);
    upstream.headers.forEach((value, key) => {
      if (!blockedResponseHeaders.has(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    return NextResponse.json({
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
      body: responseText,
      time,
      size: responseText.length,
    });
  } catch (error: unknown) {
    const time = Date.now() - startTime;

    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        { error: `Request timed out after ${PROXY_TIMEOUT_MS / 1000}s` },
        { status: 504 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Proxy request failed";

    return NextResponse.json(
      {
        status: 0,
        statusText: "Proxy Error",
        headers: {},
        body: "",
        time,
        size: 0,
        error: message,
      },
      { status: 502 }
    );
  }
}
