import { describe, it, expect } from "vitest";
import {
  getErrorMessage,
  formatError,
  type ErrorContext,
} from "./errorMessages";

describe("Error Messages", () => {
  describe("getErrorMessage", () => {
    it("should return JSON parse error", () => {
      const error = getErrorMessage("json_parse");

      expect(error.title).toBe("Invalid JSON");
      expect(error.message).toContain("not valid JSON");
      expect(error.recovery).toContain("commas, quotes, or brackets");
    });

    it("should return Base64 decode error", () => {
      const error = getErrorMessage("base64_decode");

      expect(error.title).toBe("Invalid Base64");
      expect(error.recovery).toContain("Base64 characters");
    });

    it("should return JWT decode error", () => {
      const error = getErrorMessage("jwt_decode");

      expect(error.title).toBe("Invalid JWT");
      expect(error.recovery).toContain("three parts separated by dots");
    });

    it("should include technical details when error provided", () => {
      const error = getErrorMessage(
        "json_parse",
        new Error("Unexpected token")
      );

      expect(error.technicalDetails).toBe("Unexpected token");
    });

    it("should handle unknown error context", () => {
      const error = getErrorMessage("unknown");

      expect(error.title).toBe("Something Went Wrong");
      expect(error.recovery).toContain("refreshing the page");
    });
  });

  describe("formatError", () => {
    it("should format error with all fields", () => {
      const errorMsg = {
        title: "Test Error",
        message: "Test message",
        recovery: "Try this fix",
        technicalDetails: "Error code 123",
      };

      const formatted = formatError(errorMsg);

      expect(formatted).toContain("Test Error");
      expect(formatted).toContain("Test message");
      expect(formatted).toContain("💡 Try this fix");
      expect(formatted).toContain("Details: Error code 123");
    });

    it("should format error without recovery", () => {
      const errorMsg = {
        title: "Simple Error",
        message: "Simple message",
      };

      const formatted = formatError(errorMsg);

      expect(formatted).toBe("Simple Error: Simple message");
    });
  });

  describe("all error contexts", () => {
    const contexts: ErrorContext[] = [
      "json_parse",
      "base64_decode",
      "jwt_decode",
      "regex_invalid",
      "url_parse",
      "sql_format",
      "yaml_parse",
      "file_too_large",
      "network_error",
      "unknown",
    ];

    it("should have messages for all contexts", () => {
      contexts.forEach((context) => {
        const error = getErrorMessage(context);

        expect(error.title).toBeTruthy();
        expect(error.message).toBeTruthy();
        expect(error.recovery).toBeTruthy();
      });
    });
  });
});
