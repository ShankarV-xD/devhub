import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
