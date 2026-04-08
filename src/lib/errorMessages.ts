/**
 * Enhanced error messages with context and recovery suggestions
 */

export interface ErrorMessage {
  title: string;
  message: string;
  recovery?: string;
  technicalDetails?: string;
}

export type ErrorContext =
  | "json_parse"
  | "base64_decode"
  | "jwt_decode"
  | "regex_invalid"
  | "url_parse"
  | "sql_format"
  | "yaml_parse"
  | "file_too_large"
  | "network_error"
  | "unknown";

/**
 * Get user-friendly error message with recovery suggestions
 */
export function getErrorMessage(
  context: ErrorContext,
  error?: Error
): ErrorMessage {
  const baseMessage = getContextMessage(context);

  return {
    ...baseMessage,
    technicalDetails: error?.message,
  };
}

function getContextMessage(
  context: ErrorContext
): Omit<ErrorMessage, "technicalDetails"> {
  switch (context) {
    case "json_parse":
      return {
        title: "Invalid JSON",
        message: "The content is not valid JSON format.",
        recovery:
          "Check for missing commas, quotes, or brackets. Use the JSON formatter to help identify syntax errors.",
      };

    case "base64_decode":
      return {
        title: "Invalid Base64",
        message: "The content is not valid Base64 encoding.",
        recovery:
          "Ensure the text contains only valid Base64 characters (A-Z, a-z, 0-9, +, /, =).",
      };

    case "jwt_decode":
      return {
        title: "Invalid JWT",
        message: "Unable to decode the JWT token.",
        recovery:
          "Check that the token has three parts separated by dots (header.payload.signature).",
      };

    case "regex_invalid":
      return {
        title: "Invalid Regular Expression",
        message: "The regex pattern contains syntax errors.",
        recovery:
          "Check for unescaped special characters or unclosed groups. Common issues: unmatched [], (), or {}.",
      };

    case "url_parse":
      return {
        title: "Invalid URL",
        message: "Unable to parse the URL.",
        recovery:
          "Ensure the URL starts with a protocol (http://, https://) and has no invalid characters.",
      };

    case "sql_format":
      return {
        title: "SQL Formatting Error",
        message: "Unable to format the SQL query.",
        recovery:
          "Check for basic SQL syntax. The formatter works best with standard SQL statements.",
      };

    case "yaml_parse":
      return {
        title: "Invalid YAML",
        message: "The YAML content has syntax errors.",
        recovery:
          "Check indentation (use spaces, not tabs) and ensure colons have spaces after them.",
      };

    case "file_too_large":
      return {
        title: "Content Too Large",
        message: "The content exceeds the maximum size limit.",
        recovery:
          "Try processing smaller chunks of data or use a desktop tool for very large files.",
      };

    case "network_error":
      return {
        title: "Network Error",
        message: "Unable to complete the operation due to network issues.",
        recovery: "Check your internet connection and try again.",
      };

    case "unknown":
    default:
      return {
        title: "Something Went Wrong",
        message: "An unexpected error occurred.",
        recovery:
          "Try refreshing the page or clearing the content and starting over.",
      };
  }
}

/**
 * Format error for display
 */
export function formatError(errorMsg: ErrorMessage): string {
  let formatted = `${errorMsg.title}: ${errorMsg.message}`;

  if (errorMsg.recovery) {
    formatted += `\n\n💡 ${errorMsg.recovery}`;
  }

  if (errorMsg.technicalDetails) {
    formatted += `\n\nDetails: ${errorMsg.technicalDetails}`;
  }

  return formatted;
}
