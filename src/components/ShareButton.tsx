"use client";

/**
 * ShareButton Component (M6 - Share Sheet Integration)
 *
 * Uses the Web Share API to open the native OS share dialog on mobile.
 * Falls back to copying the URL to clipboard on unsupported browsers.
 *
 * Supports:
 * - Sharing text content + URL (default)
 * - Sharing as a file (via shareAsFile prop)
 */

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { haptics } from "@/utils/haptics";
import Tooltip from "./Tooltip";

interface ShareButtonProps {
  /** Content to share. Used as the body text and for file data. */
  content: string;
  /** Optional filename when sharing as a file (e.g. "data.json"). If omitted, shares URL. */
  filename?: string;
  /** MIME type for file sharing. Defaults to "text/plain". */
  mimeType?: string;
  /** Button label (hidden on mobile, shown on sm+). Defaults to "Share". */
  label?: string;
  /** Additional className for the button element. */
  className?: string;
}

export function ShareButton({
  content,
  filename,
  mimeType = "text/plain",
  label = "Share",
  className = "",
}: ShareButtonProps) {
  const handleShare = async () => {
    // --- File sharing path ---
    if (filename && typeof navigator.canShare === "function") {
      await shareAsFile(content, filename, mimeType);
      return;
    }

    // --- Normal URL + text sharing ---
    if (navigator.share) {
      try {
        await navigator.share({
          title: "DevHub Content",
          text: content.slice(0, 200), // Keep preview short
          url: window.location.href,
        });
        haptics.success();
        toast.success("Shared successfully!");
      } catch (error) {
        // User cancelled — don't show an error
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Share failed:", error);
          await fallbackShare();
        }
      }
    } else {
      await fallbackShare();
    }
  };

  return (
    <Tooltip text="Share content">
      <button
        id="share-button"
        onClick={handleShare}
        aria-label="Share content"
        className={`flex items-center gap-2 p-3 min-w-[44px] min-h-[44px] justify-center rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer ${className}`}
      >
        <Share2 size={16} />
        <span className="hidden sm:inline text-xs">{label}</span>
      </button>
    </Tooltip>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fallback: copies the current URL to the clipboard.
 */
async function fallbackShare(): Promise<void> {
  try {
    await navigator.clipboard.writeText(window.location.href);
    haptics.light();
    toast.success("Link copied to clipboard");
  } catch {
    toast.error("Unable to share — please copy the URL manually");
  }
}

/**
 * Shares content as a downloadable file using the Web Share API.
 * Falls back to triggering a browser download if the API is unavailable.
 */
export async function shareAsFile(
  content: string,
  filename: string,
  mimeType = "text/plain"
): Promise<void> {
  if (!navigator.share || typeof navigator.canShare !== "function") {
    // Fallback: trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
    return;
  }

  const file = new File([content], filename, { type: mimeType });

  if (navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "DevHub Export",
      });
      haptics.success();
      toast.success("Shared successfully!");
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("File share failed:", error);
        toast.error("Share failed");
      }
    }
  } else {
    // Browser exists but doesn't support file sharing — fall back to download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  }
}
