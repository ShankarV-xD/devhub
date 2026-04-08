export const LOREM_IPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export function encodeBase64(text: string): string {
  return btoa(text);
}

export function decodeBase64(encoded: string): string {
  return atob(encoded);
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type HashAlgorithm =
  | "MD5"
  | "SHA-1"
  | "SHA-256"
  | "SHA-384"
  | "SHA-512"
  | "SHA-3"
  | "HMAC-MD5"
  | "HMAC-SHA256"
  | "HMAC-SHA512";

/**
 * Generate a cryptographic hash of the given content using the Web Crypto API.
 * Note: MD5, SHA-3, and HMAC variants are not natively supported by SubtleCrypto
 * so they fall back to a placeholder message.
 */
export async function generateHash(
  content: string,
  algorithm: HashAlgorithm,
): Promise<string> {
  // Map our algorithm names to SubtleCrypto algorithm names
  const subtleCryptoAlgorithms: Partial<Record<HashAlgorithm, string>> = {
    "SHA-1": "SHA-1",
    "SHA-256": "SHA-256",
    "SHA-384": "SHA-384",
    "SHA-512": "SHA-512",
  };

  const cryptoAlgo = subtleCryptoAlgorithms[algorithm];

  if (!cryptoAlgo) {
    // MD5, SHA-3, and HMAC variants require additional libraries
    throw new Error(
      `${algorithm} is not supported natively. Use a dedicated hash tool for this algorithm.`,
    );
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest(cryptoAlgo, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
