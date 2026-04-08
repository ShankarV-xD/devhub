import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for the API Request Builder.
 *
 * WHY THIS EXISTS:
 * Browsers enforce CORS — if the target server doesn't include
 * `Access-Control-Allow-Origin` in its response headers, the browser
 * blocks the request even if the server responded with 200 OK.
 * Postman (and curl) work because they are not browsers and don't enforce CORS.
 *
 * This route forwards requests from the browser to the target URL on the
 * server side (Node.js), where CORS doesn't apply, and streams the
 * response back to the client.
 *
 * Request format (POST to /api/proxy):
 * {
 *   url: string;            // Target URL to proxy to
 *   method: string;         // HTTP method
 *   headers: Record<string, string>;  // Request headers
 *   body?: string;          // Request body (JSON string or raw text)
 * }
 */

export async function POST(req: NextRequest) {
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
      { status: 400 },
    );
  }

  const { url, method, headers, body } = payload;

  if (!url) {
    return NextResponse.json(
      { error: "Missing required field: url" },
      { status: 400 },
    );
  }

  // Safety: block requests to internal/private network addresses
  try {
    const targetUrl = new URL(url);
    const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];
    if (blockedHosts.includes(targetUrl.hostname)) {
      return NextResponse.json(
        { error: "Requests to localhost are not allowed via the proxy" },
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const startTime = Date.now();

  try {
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers,
      // Include body for non-GET/HEAD requests
      ...(method.toUpperCase() !== "GET" &&
        method.toUpperCase() !== "HEAD" &&
        body !== undefined && { body }),
    };

    const upstream = await fetch(url, fetchOptions);
    const responseText = await upstream.text();
    const time = Date.now() - startTime;

    // Forward response headers back to the client
    const responseHeaders: Record<string, string> = {};
    upstream.headers.forEach((value, key) => {
      responseHeaders[key] = value;
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
      { status: 502 },
    );
  }
}
