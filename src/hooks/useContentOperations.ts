"use client";

import { useCallback } from "react";
import { generateHash, HashAlgorithm } from "@/lib/generators";
import { toast } from "sonner";

/**
 * AR2: useContentOperations
 *
 * Encapsulates all content transformation operations — JSON formatting,
 * SQL formatting, hashing, and text case conversions. Separates logic
 * from UI and makes each operation individually testable and reusable.
 */
export function useContentOperations(
  content: string,
  setContent: (value: string) => void,
) {
  // ── JSON ────────────────────────────────────────────────────────────

  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(content);
      setContent(JSON.stringify(parsed, null, 2));
    } catch {
      toast.error("Invalid JSON");
    }
  }, [content, setContent]);

  const minifyJson = useCallback(() => {
    try {
      const parsed = JSON.parse(content);
      setContent(JSON.stringify(parsed));
    } catch {
      toast.error("Invalid JSON");
    }
  }, [content, setContent]);

  // ── SQL ─────────────────────────────────────────────────────────────

  const formatSqlQuery = useCallback(() => {
    // sql-formatter is lazy-loaded to keep initial bundle small
    toast.promise(
      async () => {
        const { format } = await import("sql-formatter");
        const formatted = format(content, { language: "sql" });
        setContent(formatted);
        return "SQL formatted";
      },
      {
        loading: "Formatting SQL…",
        success: (msg) => msg,
        error: (err: unknown) => {
          if (err instanceof Error && err.message.length < 120) {
            return `SQL error: ${err.message}`;
          }
          return "SQL formatting failed";
        },
      },
    );
  }, [content, setContent]);

  // ── Hashing ─────────────────────────────────────────────────────────

  const generateHashForContent = useCallback(
    async (algorithm: HashAlgorithm) => {
      try {
        const hash = await generateHash(content, algorithm);
        setContent(hash);
        toast.success(`${algorithm} hash generated`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Hash generation failed",
        );
      }
    },
    [content, setContent],
  );

  // ── Text case transforms ─────────────────────────────────────────────

  const toUpperCase = useCallback(() => {
    setContent(content.toUpperCase());
  }, [content, setContent]);

  const toLowerCase = useCallback(() => {
    setContent(content.toLowerCase());
  }, [content, setContent]);

  const toTitleCase = useCallback(() => {
    const result = content.replace(
      /\w\S*/g,
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );
    setContent(result);
  }, [content, setContent]);

  const toCamelCase = useCallback(() => {
    const result = content
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((word, i) =>
        i === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join("");
    setContent(result);
  }, [content, setContent]);

  const toSnakeCase = useCallback(() => {
    const result = content
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.toLowerCase())
      .join("_");
    setContent(result);
  }, [content, setContent]);

  const toKebabCase = useCallback(() => {
    const result = content
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.toLowerCase())
      .join("-");
    setContent(result);
  }, [content, setContent]);

  return {
    // JSON
    formatJson,
    minifyJson,
    // SQL
    formatSqlQuery,
    // Hashing
    generateHashForContent,
    // Text transforms
    toUpperCase,
    toLowerCase,
    toTitleCase,
    toCamelCase,
    toSnakeCase,
    toKebabCase,
  };
}
