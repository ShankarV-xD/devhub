import { VALIDATION } from "./toolDescriptions";

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recovery?: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validates that content size doesn't exceed maximum limits
 * @param content - The content to validate
 * @throws {ValidationError} When content exceeds maximum size
 * @example
 * ```typescript
 * try {
 *   validateContentSize(largeString);
 * } catch (error) {
 *   console.log(error.message); // "Content exceeds maximum size limit"
 * }
 * ```
 */
export function validateContentSize(content: string): void {
  if (content.length > VALIDATION.MAX_CONTENT_SIZE) {
    throw new ValidationError(
      "Content exceeds maximum size limit",
      "CONTENT_TOO_LARGE",
      "Try splitting the content into smaller chunks"
    );
  }
}

/**
 * Validates JSON format
 * @param content - The JSON string to validate
 * @throws {ValidationError} When JSON is invalid
 * @example
 * ```typescript
 * try {
 *   validateJSON('{"name": "John"}');
 *   console.log('Valid JSON');
 * } catch (error) {
 *   console.log(error.message); // "Invalid JSON format"
 * }
 * ```
 */
export function validateJSON(content: string): void {
  try {
    JSON.parse(content);
  } catch (error) {
    throw new ValidationError(
      "Invalid JSON format",
      "INVALID_JSON",
      "Check for missing commas, quotes, or brackets"
    );
  }
}

export function validateBase64(content: string): boolean {
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(content.replace(/\s/g, ""));
}

export function validateRegex(pattern: string): void {
  if (pattern.length > VALIDATION.MAX_REGEX_LENGTH) {
    throw new ValidationError(
      "Regex pattern too long",
      "REGEX_TOO_LONG",
      "Simplify the pattern or split into multiple expressions"
    );
  }

  try {
    new RegExp(pattern);
  } catch (error) {
    throw new ValidationError(
      "Invalid regular expression",
      "INVALID_REGEX",
      "Check for unclosed groups or invalid escape sequences"
    );
  }
}

export function sanitizeInput(input: string): string {
  // Remove null bytes and control characters except newlines and tabs
  return input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");
}

// NEW VALIDATORS

export function validateURL(url: string): void {
  const urlPattern =
    /^(https?|ftp):\/\/(([a-z\d]([a-z\d-]*[a-z\d])?\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;

  if (!urlPattern.test(url)) {
    throw new ValidationError(
      "Invalid URL format",
      "INVALID_URL",
      "URL must start with http://, https://, or ftp:// and be properly formatted"
    );
  }
}

export function validateEmail(email: string): void {
  // RFC 5322 compliant email regex (simplified)
  const emailPattern =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailPattern.test(email)) {
    throw new ValidationError(
      "Invalid email address",
      "INVALID_EMAIL",
      "Email must be in format: user@example.com"
    );
  }
}

export function validateHexColor(color: string): void {
  // Support #RGB, #RRGGBB, #RRGGBBAA formats
  const hexPattern = /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;

  if (!hexPattern.test(color)) {
    throw new ValidationError(
      "Invalid hex color format",
      "INVALID_HEX_COLOR",
      "Hex color must be in format: #RGB, #RRGGBB, or #RRGGBBAA"
    );
  }
}

export function validateUUID(uuid: string): void {
  // UUIDv4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(uuid)) {
    throw new ValidationError(
      "Invalid UUID format",
      "INVALID_UUID",
      "UUID must be version 4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
    );
  }
}

export function validateCreditCard(number: string): boolean {
  // Remove spaces and dashes
  const cleaned = number.replace(/[\s-]/g, "");

  // Must be 13-19 digits
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}
