export type ContentType =
  | "json"
  | "jwt"
  | "base64"
  | "text"
  | "code"
  | "regex"
  | "uuid"
  | "hash"
  | "sql"
  | "url"
  | "color"
  | "html"
  | "markdown"
  | "cron"
  | "yaml"
  | "timestamp"
  | "csv"
  | "xml"
  | "graphql"
  | "ipaddress"
  | "ascii"
  | "css";

/**
 * Detects the content type of the input string
 * @param content - The content to analyze
 * @returns The detected content type
 * @example
 * ```typescript
 * detectType('{"name": "John"}') // Returns 'json'
 * detectType('/\d+/g') // Returns 'regex'
 * detectType('SELECT * FROM users') // Returns 'sql'
 * ```
 */
export function detectType(content: string): ContentType {
  const trimmed = content.trim();

  if (!trimmed) return "text";

  // Timestamp Detection (Unix timestamp or ISO 8601)
  // Unix timestamp: 10 digits (seconds) or 13 digits (milliseconds)
  if (/^\d{10,13}$/.test(trimmed)) {
    return "timestamp";
  }

  // ISO 8601 format (various patterns)
  // Match: 2021-01-01T00:00:00.000Z, 2021-01-01T00:00:00Z, 2021-01-01T00:00:00+05:30
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed)) {
    return "timestamp";
  }

  // Base64 Image Detection (data URI scheme)
  if (trimmed.startsWith("data:image/")) {
    return "base64";
  }

  // IP Address Detection (IPv4)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmed)) {
    return "ipaddress";
  }

  // IP Address Detection (IPv6 - basic pattern)
  if (/^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(trimmed)) {
    return "ipaddress";
  }

  // CSV detection (must be before JSON to avoid false positives)
  if (
    (content.includes(",") || content.includes("\t")) &&
    !trimmed.startsWith("{") &&
    !trimmed.startsWith("[")
  ) {
    const lines = content.trim().split("\n");
    if (lines.length > 1) {
      const delimiter = content.includes("\t") ? "\t" : ",";
      const firstRowCols = lines[0].split(delimiter).length;
      // Check if first few rows have consistent column count (indicates CSV)
      if (firstRowCols > 1) {
        const sampleSize = Math.min(5, lines.length);
        const isConsistent = lines
          .slice(0, sampleSize)
          .every((line) => line.split(delimiter).length === firstRowCols);
        if (isConsistent) {
          return "csv";
        }
      }
    }
  }

  // GraphQL Detection (must be before JSON to avoid false positives)
  if (
    trimmed.startsWith("query") ||
    trimmed.startsWith("mutation") ||
    trimmed.startsWith("subscription") ||
    trimmed.startsWith("fragment")
  ) {
    // Looks like GraphQL operation
    if (trimmed.includes("{") && trimmed.includes("}")) {
      return "graphql";
    }
  }

  // Also detect anonymous GraphQL queries (starting with {)
  if (trimmed.startsWith("{") && !trimmed.includes(":")) {
    // GraphQL queries have { field(args) { ... } } pattern without colons
    // JSON has { "key": "value" } with colons
    const hasGraphQLPattern = /\w+\s*(\([\s\S]*?\))?\s*\{/.test(trimmed);
    if (hasGraphQLPattern) {
      return "graphql";
    }
  }

  // JSON
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // ignore
    }
  }

  // Regex (e.g., /abc/gi)
  // Must start with /, have another /, and optional flags.
  // This is a simple heuristic.
  if (trimmed.startsWith("/") && trimmed.lastIndexOf("/") > 0) {
    try {
      const lastSlash = trimmed.lastIndexOf("/");
      const pattern = trimmed.slice(1, lastSlash);
      const flags = trimmed.slice(lastSlash + 1);
      new RegExp(pattern, flags);
      return "regex";
    } catch {
      // invalid regex
    }
  }

  // JWT
  if (trimmed.split(".").length === 3) {
    // Basic base64url check for parts
    const parts = trimmed.split(".");
    // Relaxed check: Just look for 3 parts where the first two look like base64
    if (
      /^[A-Za-z0-9_-]+$/.test(parts[0]) &&
      /^[A-Za-z0-9_-]+$/.test(parts[1])
    ) {
      return "jwt";
    }
  }

  if (/^[a-fA-F0-9]{32,}$/.test(trimmed) && !trimmed.includes(" ")) {
    return "hash";
  }

  // Base64 (heuristic: length multiple of 4 or ends with =)
  // Ensure it's not just a regular word.
  if (
    trimmed.length >= 16 && // Lowered from 20 to catch shorter base64 strings
    /^[A-Za-z0-9+/]*={0,2}$/.test(trimmed) &&
    !trimmed.includes(" ")
  ) {
    // If it is strictly hex characters, it is likely a hash (SHA, MD5) and NOT base64 (which usually has more variety or ends in =)
    // Unless it explicitly ends in =, it's ambiguous. But 64 chars of just 0-9a-f is almost certainly a SHA.
    const isHex = /^[0-9a-fA-F]+$/.test(trimmed);
    if (!isHex) {
      // Try to decode to verify it's valid base64
      try {
        const decoded = atob(trimmed);
        // If decoded successfully and has reasonable content, it's base64
        if (decoded.length > 0) {
          return "base64";
        }
      } catch {
        // ignore - not valid base64
      }
    }
  }

  // Markdown Detection (Headers, Lists, Links, Code Blocks)
  const isMarkdown =
    /^#{1,6}\s/.test(trimmed) || // Headers 1-6
    /^\*\s/.test(trimmed) || // Unordered list (asterisk)
    /^-\s/.test(trimmed) || // Unordered list (dash)
    /^>\s/.test(trimmed) || // Blockquote
    /\[.+\]\(.+\)/.test(trimmed) || // Link
    /```[\s\S]*```/.test(trimmed); // Code block

  if (isMarkdown) {
    return "markdown";
  }

  // UUID (v4 specifically, or generic)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(trimmed)) {
    return "uuid";
  }

  // SQL Detection
  const sqlCommands = [
    "SELECT ",
    "INSERT INTO ",
    "UPDATE ",
    "DELETE FROM ",
    "CREATE TABLE ",
    "ALTER TABLE ",
    "DROP TABLE ",
  ];
  const upperTrimmed = trimmed.toUpperCase();
  // Check if it starts with a common SQL command
  if (sqlCommands.some((k) => upperTrimmed.startsWith(k))) {
    return "sql";
  }

  // If it doesn't start with a command, require a higher density of SQL keywords to avoid false positives in natural language
  const sqlKeywordPairs = [
    ["SELECT", "FROM"],
    ["INSERT", "INTO"],
    ["UPDATE", "SET"],
    ["DELETE", "FROM"],
  ];

  const hasSqlPair = sqlKeywordPairs.some(
    ([w1, w2]) =>
      new RegExp(`\\b${w1}\\b`, "i").test(trimmed) &&
      new RegExp(`\\b${w2}\\b`, "i").test(trimmed)
  );

  // If it has a SQL pair, make sure it has some SQL syntax like a semicolon or doesn't have markdown list markers
  if (hasSqlPair && (trimmed.includes(";") || !trimmed.includes("\n- "))) {
    // Only return SQL if it really looks like SQL (e.g., ends with semicolon or has no natural language paragraph structure)
    // A simple heuristic: SQL usually has a higher ratio of uppercase keywords or punctuation compared to plain text
    // We'll return SQL here but be mindful it could still catch some text. The Markdown check above should catch most formatted text.
    return "sql";
  }

  // CSS Detection
  // Look for typical CSS patterns: selector { property: value; }
  // Avoid confusion with JSON or Objects by ensuring selectors aren't quoted keys
  if (
    trimmed.includes("{") &&
    trimmed.includes("}") &&
    trimmed.includes(":") &&
    trimmed.includes(";")
  ) {
    const hasCssProps =
      /color:|margin:|padding:|background:|font-|border:|display:|width:|height:/.test(
        trimmed
      );
    if (hasCssProps && !trimmed.trim().startsWith("{")) {
      return "css";
    }
  }

  // Code (Heuristic: Look for keywords or syntax)
  const codeKeywords = [
    "function",
    "const",
    "let",
    "var",
    "class",
    "import",
    "export",
    "def ",
    "package ",
    "public ",
    "private ",
    "return ",
    "if (",
    "for (",
    "interface ",
    "type ",
    "namespace ",
  ];
  const hasKeywords = codeKeywords.some((k) => trimmed.includes(k));
  const hasSyntax =
    trimmed.includes(";") || trimmed.includes("{") || trimmed.includes("=>");

  if (hasKeywords && (hasSyntax || !trimmed.includes(" "))) {
    // Single word might check 'const' if it's "constant" but space check helps? No, strict check.
    // Actually code usually has spaces.
  }

  if (
    hasKeywords &&
    (trimmed.includes(";") || trimmed.includes("{") || trimmed.includes("("))
  ) {
    return "code";
  }

  // URL Detection
  const lowerTrimmed = trimmed.toLowerCase();
  if (
    lowerTrimmed.startsWith("http://") ||
    lowerTrimmed.startsWith("https://") ||
    lowerTrimmed.startsWith("ftp://") ||
    lowerTrimmed.startsWith("http%3a") ||
    lowerTrimmed.startsWith("https%3a") ||
    (trimmed.startsWith("/") &&
      !trimmed.includes("\n") &&
      !trimmed.includes(" ")) // Basic absolute path
  ) {
    return "url";
  }

  // XML Detection (must be before HTML to avoid false positives)
  if (
    lowerTrimmed.startsWith("<?xml") ||
    (lowerTrimmed.startsWith("<") &&
      lowerTrimmed.endsWith(">") &&
      !lowerTrimmed.includes("<!doctype html") &&
      !lowerTrimmed.includes("<html") &&
      !lowerTrimmed.includes("<div") &&
      !lowerTrimmed.includes("<span"))
  ) {
    // Check for XML patterns like closing tags matching opening tags
    const xmlTagPattern = /<([a-zA-Z][\w:-]*)[^>]*>[\s\S]*<\/\1>/;
    if (xmlTagPattern.test(trimmed) || lowerTrimmed.startsWith("<?xml")) {
      return "xml";
    }
  }

  // HTML Detection
  if (
    (lowerTrimmed.startsWith("<") && lowerTrimmed.endsWith(">")) ||
    lowerTrimmed.startsWith("<!doctype html>")
  ) {
    // Basic check for common tags to distinguish from XML/other
    if (
      lowerTrimmed.includes("<html") ||
      lowerTrimmed.includes("<div") ||
      lowerTrimmed.includes("<span") ||
      lowerTrimmed.includes("<p") ||
      lowerTrimmed.includes("<a") ||
      lowerTrimmed.includes("<script") ||
      lowerTrimmed.includes("<style") ||
      lowerTrimmed.includes("<!doctype html>")
    ) {
      return "html";
    }
  }

  // (Markdown detection was moved above SQL detection)

  // YAML Detection
  // Heuristic: looks like key-value pairs or lists, not JSON
  // If it parses as JSON, it's JSON (handled above).
  // Key indicators: "key: value", "- item", or "---" start
  const lines = trimmed.split("\n");
  const isYaml = lines.some(
    (line) =>
      (/^[\w-]+\s*:\s.+/.test(line.trim()) && !line.trim().endsWith(";")) || // key: value, but NOT ending in ; (which is likely TS/JS/CSS)
      /^-\s/.test(line.trim()) || // - item
      line.trim() === "---" // document start
  );

  if (isYaml && !trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return "yaml";
  }

  // Cron Detection (5 or 6 parts, e.g. * * * * *)
  // Basic validation: space separated parts, typically numbers, *, /, -, ,
  const cronParts = trimmed.split(/\s+/);
  if (
    cronParts.length >= 5 &&
    cronParts.length <= 6 &&
    !trimmed.includes("\n") &&
    /^[0-9*\-,/]+$/.test(cronParts[0]) // First part usually minute/second
  ) {
    return "cron";
  }

  // Color Detection
  const isHexColor = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(
    trimmed
  );
  const isRgbColor = trimmed.startsWith("rgb(") || trimmed.startsWith("rgba(");
  const isHslColor = trimmed.startsWith("hsl(") || trimmed.startsWith("hsla(");

  if (isHexColor || isRgbColor || isHslColor) {
    return "color";
  }

  return "text";
}
