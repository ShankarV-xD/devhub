import { ContentType } from "@/lib/detector";

// Tool descriptions for each content type and mode
export const TOOL_DESCRIPTIONS: Record<ContentType | "todo" | "diff", string> =
  {
    text: "Plain text editor - paste any content to auto-detect type",
    json: "JSON formatter with tree view, table view, and validation",
    jwt: "JWT decoder showing header, payload, and signature details",
    base64: "Base64 encoder/decoder for binary data and text",
    regex: "Regular expression tester with real-time pattern matching",
    code: "Syntax-highlighted code viewer with language detection",
    sql: "SQL formatter with pretty-print and syntax validation",
    url: "URL parser showing protocol, host, path, and query params",
    color: "Color picker with HEX, RGB, HSL formats and preview",
    html: "HTML viewer with sanitization and preview mode",
    markdown: "Markdown renderer with GitHub-flavored syntax",
    cron: "Cron expression parser showing next run times",
    yaml: "YAML formatter with validation and structure view",
    uuid: "UUID/GUID generator and validator",
    hash: "Hash generator supporting SHA-256, SHA-512, and MD5",
    todo: "Task manager with completion tracking and persistence",
    diff: "Side-by-side diff viewer with syntax highlighting",
    timestamp: "Unix timestamp and ISO 8601 date converter",
    csv: "CSV data parser and table viewer",
    xml: "XML formatter and validator",
    graphql: "GraphQL query formatter",
    ipaddress: "IP address and geolocation information",
    ascii: "ASCII art generator from text",
    css: "CSS syntax highlighting and minification",
  };

// Error messages with recovery suggestions
export const ERROR_MESSAGES = {
  invalidJson: {
    title: "Invalid JSON",
    message:
      "The content is not valid JSON. Check for missing commas, quotes, or brackets.",
    recovery: "Try using a JSON validator or formatter to fix syntax errors.",
  },
  invalidBase64: {
    title: "Invalid Base64",
    message: "The content is not valid Base64 encoding.",
    recovery:
      "Ensure the string only contains A-Z, a-z, 0-9, +, /, and = characters.",
  },
  invalidJWT: {
    title: "Invalid JWT",
    message:
      "The token format is incorrect. JWTs should have 3 parts separated by dots.",
    recovery: "Check if the token is complete and properly formatted.",
  },
  invalidRegex: {
    title: "Invalid Regex",
    message: "The regular expression has syntax errors.",
    recovery:
      "Check for unclosed groups, invalid escape sequences, or unsupported features.",
  },
  contentTooLarge: {
    title: "Content Too Large",
    message: "The content exceeds the maximum size limit (1MB).",
    recovery:
      "Try splitting the content into smaller chunks or use file upload instead.",
  },
  parseError: {
    title: "Parse Error",
    message: "Failed to parse the content.",
    recovery:
      "Check the format and try again, or select a different content type.",
  },
};

// Input validation constants
export const VALIDATION = {
  MAX_CONTENT_SIZE: 1024 * 1024, // 1MB
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  DEBOUNCE_MS: 300,
  MIN_REGEX_LENGTH: 1,
  MAX_REGEX_LENGTH: 1000,
};
