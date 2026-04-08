"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { CLIPBOARD_RESET_DELAY_MS } from "@/lib/constants";

/**
 * AR2: useClipboard
 *
 * Wraps the browser Clipboard API with toast feedback and a
 * temporary "copied" indicator state that auto-resets.
 *
 * Usage:
 *   const { copy, isCopied } = useClipboard();
 *   <button onClick={() => copy(content, "JSON")}>Copy</button>
 */
export function useClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success(label ? `${label} copied` : "Copied to clipboard");

      // Auto-reset the copied indicator after the configured delay
      setTimeout(() => setIsCopied(false), CLIPBOARD_RESET_DELAY_MS);
    } catch (error) {
      console.error("Clipboard write failed:", error);
      toast.error("Failed to copy — check browser permissions");
    }
  }, []);

  return { copy, isCopied };
}
