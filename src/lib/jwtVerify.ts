import * as jose from "jose";

export type JWTAlgorithm = "HS256" | "RS256";

export interface JWTVerifyResult {
  valid: boolean;
  error?: string;
  payload?: any;
}

/**
 * Verify JWT signature using HS256 (HMAC) or RS256 (RSA) algorithm
 * @param token - JWT token string
 * @param secret - Secret key for HS256 or public key for RS256
 * @param algorithm - Algorithm to use (default: HS256)
 */
export async function verifyJWT(
  token: string,
  secret: string,
  algorithm: JWTAlgorithm = "HS256"
): Promise<JWTVerifyResult> {
  if (!token || !secret) {
    return {
      valid: false,
      error: "Token and secret are required",
    };
  }

  try {
    if (algorithm === "HS256") {
      // HMAC verification with secret - create a proper CryptoKey
      // We use crypto.subtle.importKey to ensure compatibility with jose in all environments
      const secretBytes = new TextEncoder().encode(secret);
      const secretKey = await crypto.subtle.importKey(
        "raw",
        secretBytes,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );

      const { payload } = await jose.jwtVerify(token, secretKey, {
        algorithms: ["HS256"],
      });

      return {
        valid: true,
        payload,
      };
    } else if (algorithm === "RS256") {
      // RSA verification with public key
      try {
        const publicKey = await jose.importSPKI(secret, "RS256");
        const { payload } = await jose.jwtVerify(token, publicKey, {
          algorithms: ["RS256"],
        });

        return {
          valid: true,
          payload,
        };
      } catch (importError) {
        return {
          valid: false,
          error:
            "Invalid public key format. Expected PEM format (BEGIN PUBLIC KEY)",
        };
      }
    } else {
      return {
        valid: false,
        error: `Unsupported algorithm: ${algorithm}`,
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Key for the HS256 algorithm")) {
        return {
          valid: false,
          error: "Invalid signature",
        };
      }
      return {
        valid: false,
        error: error.message,
      };
    }
    return {
      valid: false,
      error: "Unknown verification error",
    };
  }
}
