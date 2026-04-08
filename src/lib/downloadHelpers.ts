import type { ContentType } from "./detector";

/**
 * Extension mapping for different content types
 */
const EXTENSION_MAP: Record<ContentType, string> = {
  json: ".json",
  jwt: ".txt", // JWT as text
  base64: ".txt",
  regex: ".txt",
  code: ".js", // Default to JavaScript
  uuid: ".txt",
  hash: ".txt",
  sql: ".sql",
  url: ".txt",
  color: ".txt",
  html: ".html",
  markdown: ".md",
  cron: ".txt",
  yaml: ".yaml",
  text: ".txt",
  timestamp: ".txt",
  csv: ".csv",
  xml: ".xml",
  graphql: ".graphql",
  ipaddress: ".txt",
  ascii: ".txt",
  css: ".css",
};

export type ExportFormat = "auto" | "json" | "txt" | "csv";

/**
 * Get appropriate filename with extension based on content type and export format
 */
export function getDownloadFilename(
  type: ContentType,
  format: ExportFormat = "auto"
): string {
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  let extension: string;
  if (format === "auto") {
    extension = EXTENSION_MAP[type] || ".txt";
  } else {
    extension = `.${format}`;
  }

  const formatSuffix = format !== "auto" ? `-${format}` : "";
  return `devhub-${type}${formatSuffix}-${timestamp}${extension}`;
}

/**
 * Download content as a file
 */
export function downloadContent(
  content: string,
  filename: string,
  mimeType: string = "text/plain"
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get MIME type based on content type and export format
 */
export function getMimeType(
  type: ContentType,
  format: ExportFormat = "auto"
): string {
  if (format === "csv") return "text/csv";
  if (format === "json") return "application/json";
  if (format === "txt") return "text/plain";

  const mimeMap: Partial<Record<ContentType, string>> = {
    json: "application/json",
    html: "text/html",
    markdown: "text/markdown",
    yaml: "text/yaml",
    sql: "application/sql",
    code: "text/javascript",
  };
  return mimeMap[type] || "text/plain";
}

/**
 * Convert JSON to CSV format
 */
export function jsonToCSV(json: string): string {
  try {
    const data = JSON.parse(json);

    // Handle array of objects
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              // Escape commas and quotes
              const escaped = String(value).replace(/"/g, '""');
              return value !== null && value !== undefined
                ? `"${escaped}"`
                : '""';
            })
            .join(",")
        ),
      ];
      return csvRows.join("\n");
    }

    // Handle single object
    if (typeof data === "object" && !Array.isArray(data)) {
      const csvRows = [
        "Key,Value",
        ...Object.entries(data).map(([key, value]) => {
          const escapedValue = String(value).replace(/"/g, '""');
          return `"${key}","${escapedValue}"`;
        }),
      ];
      return csvRows.join("\n");
    }

    throw new Error("JSON must be an array of objects or a single object");
  } catch (error) {
    throw new Error("Invalid JSON for CSV conversion");
  }
}
