import { describe, it, expect } from "vitest";
import { detectType } from "@/lib/detector";

describe("Type Detection", () => {
  it("should detect JSON correctly", () => {
    const jsonString = '{"name": "test", "value": 123}';
    expect(detectType(jsonString)).toBe("json");
  });

  it("should detect Base64", () => {
    const base64 =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ";
    expect(detectType(base64)).toBe("base64");
  });

  it("should detect JWT", () => {
    const jwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
    expect(detectType(jwt)).toBe("jwt");
  });

  it("should detect URLs", () => {
    expect(detectType("https://example.com")).toBe("url");
    expect(detectType("http://test.com/path")).toBe("url");
  });

  it("should detect colors", () => {
    expect(detectType("#ff0000")).toBe("color");
    expect(detectType("rgb(255, 0, 0)")).toBe("color");
  });

  it("should detect Markdown over SQL for text with markdown formatting and SQL keywords", () => {
    const markdownWithSql = `# Milestone BugFix
- Select plan type
- update external perimeter from the database`;
    expect(detectType(markdownWithSql)).toBe("markdown");
  });

  it("should default to text for unknown patterns", () => {
    expect(detectType("just some text")).toBe("text");
  });
});
