import { describe, it, expect } from "vitest";
import {
  ValidationError,
  validateContentSize,
  validateJSON,
  validateBase64,
  validateRegex,
  sanitizeInput,
  validateURL,
  validateEmail,
  validateHexColor,
  validateUUID,
  validateCreditCard,
} from "./validation";

describe("Validation", () => {
  describe("validateContentSize", () => {
    it("should pass for content under size limit", () => {
      const content = "a".repeat(1000);
      expect(() => validateContentSize(content)).not.toThrow();
    });

    it("should throw for content over size limit", () => {
      const content = "a".repeat(2 * 1024 * 1024); // 2MB
      expect(() => validateContentSize(content)).toThrow(ValidationError);
    });
  });

  describe("validateJSON", () => {
    it("should pass for valid JSON", () => {
      expect(() => validateJSON('{"key": "value"}')).not.toThrow();
    });

    it("should throw for invalid JSON", () => {
      expect(() => validateJSON("{invalid}")).toThrow(ValidationError);
    });
  });

  describe("validateBase64", () => {
    it("should return true for valid base64", () => {
      expect(validateBase64("SGVsbG8gV29ybGQ=")).toBe(true);
    });

    it("should return false for invalid base64", () => {
      expect(validateBase64("not-base64!")).toBe(false);
    });
  });

  describe("validateRegex", () => {
    it("should pass for valid regex", () => {
      expect(() => validateRegex("[a-z]+")).not.toThrow();
    });

    it("should throw for invalid regex", () => {
      expect(() => validateRegex("[invalid")).toThrow(ValidationError);
    });
  });

  describe("sanitizeInput", () => {
    it("should remove control characters", () => {
      const dirty = "hello\x00\x01world";
      expect(sanitizeInput(dirty)).toBe("helloworld");
    });

    it("should preserve newlines and tabs", () => {
      const text = "line1\nline2\ttab";
      expect(sanitizeInput(text)).toBe("line1\nline2\ttab");
    });
  });

  describe("validateURL", () => {
    it("should pass for valid HTTP URLs", () => {
      expect(() => validateURL("http://example.com")).not.toThrow();
      expect(() => validateURL("https://www.example.com/path")).not.toThrow();
    });

    it("should pass for valid FTP URLs", () => {
      expect(() => validateURL("ftp://files.example.com")).not.toThrow();
    });

    it("should pass for URLs with query params", () => {
      expect(() => validateURL("https://example.com?key=value")).not.toThrow();
    });

    it("should pass for URLs with fragments", () => {
      expect(() => validateURL("https://example.com#section")).not.toThrow();
    });

    it("should throw for missing protocol", () => {
      expect(() => validateURL("example.com")).toThrow(ValidationError);
    });

    it("should throw for invalid protocol", () => {
      expect(() => validateURL("javascript:alert(1)")).toThrow(ValidationError);
    });

    it("should throw for malformed URLs", () => {
      expect(() => validateURL("not a url")).toThrow(ValidationError);
    });
  });

  describe("validateEmail", () => {
    it("should pass for valid emails", () => {
      expect(() => validateEmail("user@example.com")).not.toThrow();
      expect(() => validateEmail("test.user@sub.example.com")).not.toThrow();
    });

    it("should pass for emails with special characters", () => {
      expect(() => validateEmail("user+tag@example.com")).not.toThrow();
    });

    it("should throw for missing @", () => {
      expect(() => validateEmail("userexample.com")).toThrow(ValidationError);
    });

    it("should throw for invalid domain", () => {
      expect(() => validateEmail("user@")).toThrow(ValidationError);
    });

    it("should throw for spaces", () => {
      expect(() => validateEmail("user @example.com")).toThrow(ValidationError);
    });
  });

  describe("validateHexColor", () => {
    it("should pass for 3-char hex colors", () => {
      expect(() => validateHexColor("#FFF")).not.toThrow();
      expect(() => validateHexColor("#abc")).not.toThrow();
    });

    it("should pass for 6-char hex colors", () => {
      expect(() => validateHexColor("#FFFFFF")).not.toThrow();
      expect(() => validateHexColor("#123abc")).not.toThrow();
    });

    it("should pass for 8-char hex colors with alpha", () => {
      expect(() => validateHexColor("#FFFFFFFF")).not.toThrow();
    });

    it("should throw for missing #", () => {
      expect(() => validateHexColor("FFFFFF")).toThrow(ValidationError);
    });

    it("should throw for invalid characters", () => {
      expect(() => validateHexColor("#GGGGGG")).toThrow(ValidationError);
    });

    it("should throw for wrong length", () => {
      expect(() => validateHexColor("#FF")).toThrow(ValidationError);
    });
  });

  describe("validateUUID", () => {
    it("should pass for valid UUIDv4", () => {
      expect(() =>
        validateUUID("550e8400-e29b-41d4-a716-446655440000")
      ).not.toThrow();
    });

    it("should throw for missing dashes", () => {
      expect(() => validateUUID("550e8400e29b41d4a716446655440000")).toThrow(
        ValidationError
      );
    });

    it("should throw for non-v4 UUID", () => {
      expect(() =>
        validateUUID("550e8400-e29b-31d4-a716-446655440000")
      ).toThrow(ValidationError);
    });

    it("should throw for invalid format", () => {
      expect(() => validateUUID("not-a-uuid")).toThrow(ValidationError);
    });
  });

  describe("validateCreditCard", () => {
    it("should return true for valid credit card numbers", () => {
      expect(validateCreditCard("4532015112830366")).toBe(true); // Visa test number
      expect(validateCreditCard("6011111111111117")).toBe(true); // Discover test number
    });

    it("should return true for numbers with spaces", () => {
      expect(validateCreditCard("4532 0151 1283 0366")).toBe(true);
    });

    it("should return true for numbers with dashes", () => {
      expect(validateCreditCard("4532-0151-1283-0366")).toBe(true);
    });

    it("should return false for invalid Luhn checksum", () => {
      expect(validateCreditCard("4532015112830367")).toBe(false);
    });

    it("should return false for too short numbers", () => {
      expect(validateCreditCard("123456")).toBe(false);
    });

    it("should return false for non-numeric characters", () => {
      expect(validateCreditCard("453x-0151-1283-0366")).toBe(false);
    });
  });
});
