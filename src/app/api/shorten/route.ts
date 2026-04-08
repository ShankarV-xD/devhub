import { NextRequest, NextResponse } from "next/server";

/**
 * S2: Server-side rate limiter for URL shortening.
 * 20 requests / minute per IP — enough for legitimate use,
 * prevents bulk URL shortening abuse.
 */
const shortenRateMap = new Map<string, number[]>();
const SHORTEN_MAX = 20;
const SHORTEN_WINDOW_MS = 60_000;

function isShortenRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (shortenRateMap.get(ip) ?? []).filter(
    (t) => now - t < SHORTEN_WINDOW_MS
  );
  if (hits.length >= SHORTEN_MAX) return true;
  hits.push(now);
  shortenRateMap.set(ip, hits);
  return false;
}

export async function GET(request: NextRequest) {
  // S2: Rate limit by IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isShortenRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment before retrying." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");


  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      throw new Error(
        `is.gd API refused to shorten URL: ${response.statusText}`
      );
    }

    const shortUrl = await response.text();

    // is.gd returns error messages in the body sometimes even with 200 OK if format is simple,
    // but usually with simple format it returns just the URL or an error code.
    // If it starts with "Error:", it's an error.
    if (shortUrl.startsWith("Error:")) {
      return NextResponse.json({ error: shortUrl }, { status: 400 });
    }

    return NextResponse.json({ shortUrl });
  } catch (error: any) {
    console.error("Shortener Error:", error);
    return NextResponse.json(
      { error: "Failed to shorten URL" },
      { status: 500 }
    );
  }
}
