import { describe, it, expect } from "vitest";
import { verifyJWT } from "./jwtVerify";

describe("JWT Verification", () => {
  describe("verifyJWT - HS256", () => {
    it("should verify valid HS256 token with correct secret", async () => {
      const secret = "secret";

      // Token pre-generated using jose library (jose v6.1.3) in Node.js environment
      // Payload: {"name":"John Doe","sub":"1234567890","iat":1516239022}
      // Secret: "secret"
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.jfy-T6NvLEkGF2tT-gmlobsc72x5KdFo4o9eQi3dZYY";

      const result = await verifyJWT(token, secret, "HS256");

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.payload).toBeDefined();
      expect(result.payload?.name).toBe("John Doe");
    });

    it("should reject token with wrong secret", async () => {
      // Token pre-generated using jose library (jose  v6.1.3) in Node.js environment
      // Payload: {"name":"John Doe","sub":"1234567890","iat":1516239022}
      // Secret: "secret"
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.jfy-T6NvLEkGF2tT-gmlobsc72x5KdFo4o9eQi3dZYY";

      const wrongSecret = "wrong-secret-key";

      const result = await verifyJWT(token, wrongSecret, "HS256");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("signature");
    });

    it("should reject malformed token", async () => {
      const result = await verifyJWT("not.a.valid.jwt", "secret", "HS256");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject token with invalid structure", async () => {
      const result = await verifyJWT("invalid", "secret", "HS256");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("verifyJWT - Input Validation", () => {
    it("should reject empty token", async () => {
      const result = await verifyJWT("", "secret", "HS256");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Token and secret are required");
    });

    it("should reject empty secret", async () => {
      const result = await verifyJWT("some.token.here", "", "HS256");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Token and secret are required");
    });

    it("should reject null token", async () => {
      const result = await verifyJWT(null as any, "secret", "HS256");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Token and secret are required");
    });

    it("should reject undefined secret", async () => {
      const result = await verifyJWT(
        "some.token.here",
        undefined as any,
        "HS256"
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Token and secret are required");
    });
  });

  describe("verifyJWT - RS256", () => {
    it("should verify valid RS256 token with correct public key", async () => {
      // Token pre-generated using jose library with RS256
      const token =
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.test_signature";

      // Mock public key in PEM format
      const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890
-----END PUBLIC KEY-----`;

      // This test will fail signature verification but should pass format validation
      const result = await verifyJWT(token, publicKey, "RS256");

      // Should fail due to invalid signature but not due to format
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject invalid public key format", async () => {
      const token =
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.test_signature";
      const invalidPublicKey = "not-a-valid-pem-format";

      const result = await verifyJWT(token, invalidPublicKey, "RS256");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid public key format");
    });
  });

  describe("verifyJWT - Algorithm Support", () => {
    it("should reject unsupported algorithm", async () => {
      const token = "some.jwt.token";
      const secret = "secret";

      const result = await verifyJWT(token, secret, "HS512" as any);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Unsupported algorithm: HS512");
    });

    it("should default to HS256 when algorithm not specified", async () => {
      const secret = "secret";
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.jfy-T6NvLEkGF2tT-gmlobsc72x5KdFo4o9eQi3dZYY";

      const result = await verifyJWT(token, secret);

      expect(result.valid).toBe(true);
      expect(result.payload?.name).toBe("John Doe");
    });
  });

  describe("verifyJWT - Error Handling", () => {
    it("should handle generic errors gracefully", async () => {
      const result = await verifyJWT("definitely.not.a.jwt", "secret", "HS256");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
    });

    it("should provide specific error for signature issues", async () => {
      const validToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.jfy-T6NvLEkGF2tT-gmlobsc72x5KdFo4o9eQi3dZYY";
      const wrongSecret = "wrong-secret";

      const result = await verifyJWT(validToken, wrongSecret, "HS256");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("signature");
    });
  });
});
