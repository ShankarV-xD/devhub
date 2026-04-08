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
 * Detects the content type of the input string.
 * Uses prioritized heuristics with specific guards against false positives.
 */
export function detectType(content: string): ContentType {
  const trimmed = content.trim();

  if (!trimmed) return "text";

  // ── Timestamp Detection ──────────────────────────────────────────────
  // Unix timestamp: 10 digits (seconds) or 13 digits (milliseconds)
  if (/^\d{10}$/.test(trimmed) || /^\d{13}$/.test(trimmed)) {
    return "timestamp";
  }

  // ISO 8601 format
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed)) {
    return "timestamp";
  }

  // ── Base64 Image Detection (data URI scheme) ─────────────────────────
  if (trimmed.startsWith("data:image/")) {
    return "base64";
  }

  // ── IP Address Detection ─────────────────────────────────────────────
  // IPv4 — validate each octet is 0-255
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmed)) {
    const octets = trimmed.split(".").map(Number);
    if (octets.every((o) => o >= 0 && o <= 255)) {
      return "ipaddress";
    }
  }

  // IPv6
  if (/^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(trimmed)) {
    return "ipaddress";
  }

  // ── CSV Detection ────────────────────────────────────────────────────
  // Must be before JSON/SQL/YAML to avoid false positives
  if (
    (content.includes(",") || content.includes("\t")) &&
    !trimmed.startsWith("{") &&
    !trimmed.startsWith("[")
  ) {
    const lines = content.trim().split("\n");
    if (lines.length > 1) {
      const delimiter = content.includes("\t") ? "\t" : ",";
      const firstRowCols = lines[0].split(delimiter).length;
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

  // ── GraphQL Detection ────────────────────────────────────────────────
  // Only match if it starts with a GraphQL keyword AND contains braces
  const graphqlKeywords = ["query", "mutation", "subscription", "fragment"];
  const firstWord = trimmed.split(/[\s{(]/)[0].toLowerCase();
  if (
    graphqlKeywords.includes(firstWord) &&
    trimmed.includes("{") &&
    trimmed.includes("}")
  ) {
    return "graphql";
  }

  // Anonymous GraphQL queries: { field(args) { ... } } without colons
  if (trimmed.startsWith("{") && !trimmed.includes(":")) {
    const hasGraphQLPattern = /\w+\s*(\([\s\S]*?\))?\s*\{/.test(trimmed);
    if (hasGraphQLPattern) {
      return "graphql";
    }
  }

  // ── JSON ─────────────────────────────────────────────────────────────
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // not valid JSON
    }
  }

  // ── Regex ────────────────────────────────────────────────────────────
  // /pattern/flags — must have content between slashes
  if (trimmed.startsWith("/") && trimmed.lastIndexOf("/") > 0) {
    try {
      const lastSlash = trimmed.lastIndexOf("/");
      const pattern = trimmed.slice(1, lastSlash);
      const flags = trimmed.slice(lastSlash + 1);
      // Validate flags are legitimate regex flags
      if (/^[gimsuy]*$/.test(flags) && pattern.length > 0) {
        new RegExp(pattern, flags);
        return "regex";
      }
    } catch {
      // invalid regex
    }
  }

  // ── JWT ──────────────────────────────────────────────────────────────
  // Three dot-separated segments, where header is valid base64url-encoded JSON
  // containing "typ":"JWT" or "alg" field
  if (trimmed.split(".").length === 3) {
    const parts = trimmed.split(".");
    if (
      /^[A-Za-z0-9_-]+$/.test(parts[0]) &&
      /^[A-Za-z0-9_-]+$/.test(parts[1])
    ) {
      try {
        // Decode the header to verify it looks like a JWT
        const headerJson = atob(parts[0].replace(/-/g, "+").replace(/_/g, "/"));
        const header = JSON.parse(headerJson);
        if (
          header &&
          typeof header === "object" &&
          ("alg" in header || "typ" in header)
        ) {
          return "jwt";
        }
      } catch {
        // Not a valid JWT header, but still might be
        // Check if parts[2] (signature) looks like base64url
        if (/^[A-Za-z0-9_-]+$/.test(parts[2])) {
          return "jwt";
        }
      }
    }
  }

  // ── Hash Detection ───────────────────────────────────────────────────
  // Hex strings of common hash lengths (32=MD5, 40=SHA1, 64=SHA256)
  if (/^[a-fA-F0-9]+$/.test(trimmed) && !trimmed.includes(" ")) {
    const len = trimmed.length;
    if (
      len === 32 ||
      len === 40 ||
      len === 56 ||
      len === 64 ||
      len === 96 ||
      len === 128
    ) {
      return "hash";
    }
  }

  // ── Base64 Detection ────────────────────────────────────────────────
  // Require significant length and no spaces. Must not be purely hex.
  if (
    trimmed.length >= 16 &&
    /^[A-Za-z0-9+/]*={0,2}$/.test(trimmed) &&
    !trimmed.includes(" ")
  ) {
    // If purely hex characters, it's more likely a hash than base64
    if (/^[0-9a-fA-F]+$/.test(trimmed)) {
      // Already checked hash lengths above; skip base64 for hex strings
    } else {
      try {
        const decoded = atob(trimmed);
        // The decoded content should have a reasonable ratio of printable chars
        // to avoid false positives on random-looking strings
        if (decoded.length > 0) {
          const printableRatio =
            decoded.split("").filter((c) => {
              const code = c.charCodeAt(0);
              return (
                (code >= 32 && code <= 126) ||
                code === 9 ||
                code === 10 ||
                code === 13
              );
            }).length / decoded.length;
          if (printableRatio > 0.5) {
            return "base64";
          }
        }
      } catch {
        // not valid base64
      }
    }
  }

  // ── Markdown Detection ──────────────────────────────────────────────
  // Tightened to reduce false positives on natural language:
  // - Headers (#) must be at start of line
  // - Unordered lists require multi-line content or multiple list markers
  // - Links require brackets then parens immediately
  // - Code blocks (```) are a strong signal
  const lines = trimmed.split("\n");

  const hasCodeBlock = /```[\s\S]*```/.test(trimmed);
  const hasHeader = lines.some((line) => /^#{1,6}\s/.test(line));
  const hasLink = /\[[^\]]+\]\([^)]+\)/.test(trimmed);
  const hasBlockquote = lines.some((line) => /^>\s/.test(line));
  const hasUnorderedList =
    lines.filter((line) => /^[-*]\s/.test(line)).length >= 2;

  if (
    hasCodeBlock ||
    hasHeader ||
    hasLink ||
    hasBlockquote ||
    hasUnorderedList
  ) {
    return "markdown";
  }

  // ── UUID Detection ──────────────────────────────────────────────────
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(trimmed)) {
    return "uuid";
  }

  // ── SQL Detection ───────────────────────────────────────────────────
  // Tightened: must start with a SQL keyword OR have strong SQL signals
  const sqlCommands = [
    "SELECT ",
    "INSERT INTO ",
    "UPDATE ",
    "DELETE FROM ",
    "CREATE TABLE ",
    "ALTER TABLE ",
    "DROP TABLE ",
    "WITH ",
  ];
  const upperTrimmed = trimmed.toUpperCase();

  if (sqlCommands.some((k) => upperTrimmed.startsWith(k))) {
    return "sql";
  }

  // For non-leading SQL: require BOTH a keyword pair AND SQL punctuation
  // to distinguish from English text like "select from the menu"
  const sqlKeywordPairs: Array<[string, string]> = [
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

  // Strong SQL signals: semicolons, table/column references with dots, parentheses around column lists
  const hasSqlPunctuation =
    trimmed.includes(";") ||
    /\b\w+\.\w+/.test(trimmed) || // table.column references
    /SELECT\s.+\sFROM\s/i.test(trimmed); // SELECT...FROM pattern with content between

  if (hasSqlPair && hasSqlPunctuation) {
    return "sql";
  }

  // ── CSS Detection ───────────────────────────────────────────────────
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

  // ── Code Detection ──────────────────────────────────────────────────
  // Tightened: require at least 2 code signals (keyword + syntax)
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
    "interface ",
    "type ",
    "namespace ",
  ];
  const hasKeyword = codeKeywords.some((k) => trimmed.includes(k));
  const hasCodeSyntax =
    trimmed.includes(";") || trimmed.includes("{") || trimmed.includes("=>");

  if (hasKeyword && hasCodeSyntax) {
    return "code";
  }

  // ── URL Detection ───────────────────────────────────────────────────
  const lowerTrimmed = trimmed.toLowerCase();
  if (
    lowerTrimmed.startsWith("http://") ||
    lowerTrimmed.startsWith("https://") ||
    lowerTrimmed.startsWith("ftp://") ||
    lowerTrimmed.startsWith("http%3a") ||
    lowerTrimmed.startsWith("https%3a") ||
    (trimmed.startsWith("/") &&
      !trimmed.includes("\n") &&
      !trimmed.includes(" "))
  ) {
    return "url";
  }

  // ── XML Detection ───────────────────────────────────────────────────
  if (
    lowerTrimmed.startsWith("<?xml") ||
    (lowerTrimmed.startsWith("<") &&
      lowerTrimmed.endsWith(">") &&
      !lowerTrimmed.includes("<!doctype html") &&
      !lowerTrimmed.includes("<html") &&
      !lowerTrimmed.includes("<div") &&
      !lowerTrimmed.includes("<span"))
  ) {
    const xmlTagPattern = /<([a-zA-Z][\w:-]*)[^>]*>[\s\S]*<\/\1>/;
    if (xmlTagPattern.test(trimmed) || lowerTrimmed.startsWith("<?xml")) {
      return "xml";
    }
  }

  // ── HTML Detection ──────────────────────────────────────────────────
  if (
    (lowerTrimmed.startsWith("<") && lowerTrimmed.endsWith(">")) ||
    lowerTrimmed.startsWith("<!doctype html>")
  ) {
    if (
      lowerTrimmed.includes("<html") ||
      lowerTrimmed.includes("<div") ||
      lowerTrimmed.includes("<span") ||
      lowerTrimmed.includes("<p") ||
      lowerTrimmed.includes("<a ") ||
      lowerTrimmed.includes("<script") ||
      lowerTrimmed.includes("<style") ||
      lowerTrimmed.includes("<!doctype html>")
    ) {
      return "html";
    }
  }

  // ── YAML Detection ──────────────────────────────────────────────────
  // Tightened: require MULTIPLE yaml indicators, or a document separator
  // Single "key: value" lines are too easily confused with natural language
  // ("Name: John" or "color: red")
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    const yamlLines = lines.filter(
      (line) =>
        /^[\w-]+\s*:\s.+/.test(line.trim()) && !line.trim().endsWith(";")
    );
    const hasSeparator = lines.some((line) => line.trim() === "---");
    const hasListItems =
      lines.filter((line) => /^-\s/.test(line.trim())).length >= 2;

    // Require either: a document separator, or multiple key: value lines,
    // or key: value + list items together
    if (
      hasSeparator ||
      yamlLines.length >= 2 ||
      (yamlLines.length >= 1 && hasListItems)
    ) {
      return "yaml";
    }
  }

  // ── Cron Detection ──────────────────────────────────────────────────
  // Tightened: all 5-6 parts must be valid cron fields
  const cronParts = trimmed.split(/\s+/);
  if (
    cronParts.length >= 5 &&
    cronParts.length <= 6 &&
    !trimmed.includes("\n")
  ) {
    // Each part: digits, *, ranges, steps, lists — but no letters (except month/day names)
    const validCronField = /^[0-9*\-,/]+$/;
    const allFieldsValid = cronParts.every((part) => validCronField.test(part));
    if (allFieldsValid) {
      return "cron";
    }
  }

  // ── Color Detection ─────────────────────────────────────────────────
  const isHexColor = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(
    trimmed
  );
  const isRgbColor = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*/.test(trimmed);
  const isHslColor = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%/.test(trimmed);

  if (isHexColor || isRgbColor || isHslColor) {
    return "color";
  }

  return "text";
}
