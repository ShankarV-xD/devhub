import { useState, useEffect, useMemo, useRef } from "react";
import { detectType, ContentType } from "@/lib/detector";
import { useDebounce } from "@/hooks/useDebounce";

interface TypeMessage {
  text: string;
  type: "success" | "error";
}

interface UseDetectionOptions {
  debounceMs?: number;
  onTypeChange?: (newType: ContentType, oldType: ContentType) => void;
}

const TYPE_MESSAGES: Partial<Record<ContentType, string>> = {
  json: "JSON detected. Press Ctrl+J to format",
  sql: "SQL detected. Press Ctrl+S to format",
  jwt: "JWT detected. Use tools to decode payload",
  html: "HTML detected. Toggle preview mode",
  markdown: "Markdown detected. Toggle preview mode",
  yaml: "YAML detected. Convert to/from JSON",
  color: "Color code detected. Use picker to adjust",
  uuid: "UUID detected. Click to copy sections",
  hash: "Hash detected. Identify algorithm type",
  regex: "Regex detected. Highlight matches",
  code: "Code snippets detected",
  url: "URL detected. Use tools to encode/decode",
  cron: "Cron schedule detected. View next runs",
  xml: "XML detected. View structure",
  csv: "CSV detected. View as table",
  graphql: "GraphQL detected. View query",
  ipaddress: "IP address detected. View details",
  base64: "Base64 detected. Use tools to decode/encode",
  css: "CSS detected. View and format",
  text: "Plain text mode",
};

export function useDetection(
  content: string,
  options: UseDetectionOptions = {}
) {
  const { debounceMs = 300, onTypeChange } = options;

  const [type, setType] = useState<ContentType>("text");
  const [viewMode, setViewMode] = useState<"raw" | "tree" | "table">("raw");
  const [message, setMessage] = useState<TypeMessage | null>(null);

  // Track previous content to detect large changes (pastes, example loads)
  const prevContentRef = useRef(content);

  // Debounce content for incremental typing only
  const debouncedContent = useDebounce(content, debounceMs);

  // Memoized JSON parsing (only re-parse when content or type changes)
  const parsedJson = useMemo(() => {
    if (type !== "json") return null;
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }, [content, type]);

  // Helper to apply a detected type
  const applyType = (newType: ContentType) => {
    if (newType !== type) {
      const oldType = type;
      setType(newType);
      onTypeChange?.(newType, oldType);
      if (TYPE_MESSAGES[newType]) {
        setMessage({ text: TYPE_MESSAGES[newType]!, type: "success" });
      }
    }
  };

  // IMMEDIATE detection for large content changes (pastes, example loads, file drops)
  useEffect(() => {
    if (!content) {
      if (type !== "text") setType("text");
      prevContentRef.current = content;
      return;
    }

    const delta = Math.abs(content.length - prevContentRef.current.length);
    prevContentRef.current = content;

    // Large change (>10 chars) = programmatic / paste → detect immediately
    if (delta > 10) {
      const newType = detectType(content);
      applyType(newType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // DEBOUNCED detection for incremental typing (small changes)
  useEffect(() => {
    if (!content || !debouncedContent) return;

    const newType = detectType(debouncedContent);

    // UI Stickiness: Prevent rigid, single-line tools from violently
    // switching to 'text' during minor backspaces/editing.
    const stickyTypes: ContentType[] = ["cron", "color"];
    if (stickyTypes.includes(type) && newType === "text") {
      return;
    }

    applyType(newType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent]);

  // Auto-dismiss messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return {
    type,
    setType,
    viewMode,
    setViewMode,
    parsedJson,
    message,
    setMessage,
  };
}
