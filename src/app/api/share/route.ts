import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const SHARE_DIR = join(tmpdir(), "devhub-shares");
const MAX_CONTENT_LENGTH = 1_000_000;
const SHARE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const ratelimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ratelimitMap.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (hits.length >= RATE_LIMIT_MAX) return true;
  hits.push(now);
  ratelimitMap.set(ip, hits);
  return false;
}

async function ensureDir() {
  try {
    await mkdir(SHARE_DIR, { recursive: true });
  } catch {}
}

function sharePath(id: string) {
  return join(SHARE_DIR, `${id}.json`);
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  let content: string;
  try {
    const body = await request.json();
    content = body.content;
    if (typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: "Content too large (max 1MB)" },
      { status: 413 }
    );
  }

  const id = randomBytes(6).toString("base64url");
  const data = {
    content,
    created: Date.now(),
  };

  await ensureDir();
  await writeFile(sharePath(id), JSON.stringify(data), "utf-8");

  return NextResponse.json({ id });
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !/^[A-Za-z0-9_-]{1,16}$/.test(id)) {
    return NextResponse.json({ error: "Invalid share ID" }, { status: 400 });
  }

  await ensureDir();
  const filePath = sharePath(id);

  let data: { content: string; created: number };
  try {
    const raw = await readFile(filePath, "utf-8");
    data = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Share not found or expired" },
      { status: 404 }
    );
  }

  if (Date.now() - data.created > SHARE_TTL_MS) {
    try {
      await unlink(filePath);
    } catch {}
    return NextResponse.json({ error: "Share expired" }, { status: 410 });
  }

  return NextResponse.json({ content: data.content });
}
