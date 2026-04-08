import { useMemo } from "react";

export interface ContentStats {
  chars: number;
  words: number;
  lines: number;
  bytes: number;
}

export function useContentStats(content: string): ContentStats | null {
  return useMemo(() => {
    if (!content) return null;

    const chars = content.length;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const lines = content.split("\n").length;
    const bytes = new Blob([content]).size;

    return { chars, words, lines, bytes };
  }, [content]);
}
