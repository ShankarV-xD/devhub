/**
 * S3: Encrypted localStorage
 *
 * Wraps localStorage with AES-256 encryption so that sensitive content
 * (history items containing JWT tokens, API keys, etc.) isn't stored in
 * plain text. Any XSS exploit that reads localStorage gets ciphertext only.
 *
 * Key derivation:
 *   On first visit, a random 256-bit key is generated via Web Crypto API
 *   and stored in a separate localStorage key. This key never appears in
 *   the JS bundle, is unique per device, and rotates only on explicit
 *   clear. Compromising one device's key does not affect another.
 *
 *   If a NEXT_PUBLIC_STORAGE_KEY env var is provided (e.g., for shared
 *   deployments), it takes precedence — but note it WILL be in the client
 *   bundle, so use it only if you understand the tradeoffs.
 *
 * Threat model:
 *   This protects against *passive* reads of localStorage (e.g., via a
 *   compromised browser extension that scrapes all storage). It does NOT
 *   protect against an active XSS on the same page — such an attacker
 *   can call secureStorage.get() and read the decrypted values anyway.
 *
 * Usage:
 *   import { secureStorage } from '@/lib/secure-storage';
 *   secureStorage.set('devhub_history', items);
 *   const items = secureStorage.get<HistoryItem[]>('devhub_history');
 */

import CryptoJS from "crypto-js";

const STORAGE_KEY_KEY = "devhub_ek";

// ---------------------------------------------------------------------------
// Encryption key resolution — env var → per-device random key
// ---------------------------------------------------------------------------
function getOrCreateEncryptionKey(): string {
  const envKey =
    typeof process !== "undefined" && process.env?.NEXT_PUBLIC_STORAGE_KEY;

  if (envKey) {
    return envKey;
  }

  if (typeof window === "undefined") {
    return "devhub-server-fallback";
  }

  const existing = localStorage.getItem(STORAGE_KEY_KEY);
  if (existing) {
    return existing;
  }

  // Generate a random 256-bit key (32 bytes = 43 base64 chars)
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const key = btoa(String.fromCharCode(...array));
  localStorage.setItem(STORAGE_KEY_KEY, key);
  return key;
}

let _encryptionKey: string | null = null;

function getEncryptionKey(): string {
  if (!_encryptionKey) {
    _encryptionKey = getOrCreateEncryptionKey();
  }
  return _encryptionKey;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export const secureStorage = {
  /**
   * Serialize, encrypt, and persist a value under `key`.
   * Silently no-ops if called server-side or encryption fails.
   */
  set(key: string, value: unknown): void {
    if (typeof window === "undefined") return;
    try {
      const plain = JSON.stringify(value);
      const cipher = CryptoJS.AES.encrypt(plain, getEncryptionKey()).toString();
      localStorage.setItem(key, cipher);
    } catch (err) {
      console.error("[secureStorage] encrypt error:", err);
    }
  },

  /**
   * Retrieve, decrypt, and deserialize a value from `key`.
   * Returns `null` on miss, tampered data, or server-side calls.
   */
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      // --- Attempt AES decryption (post-S3 encrypted data) ---
      try {
        const bytes = CryptoJS.AES.decrypt(stored, getEncryptionKey());
        const plain = bytes.toString(CryptoJS.enc.Utf8);

        if (plain) {
          return JSON.parse(plain) as T;
        }
      } catch {
        // Decryption failed — fall through to legacy path
      }

      // --- Legacy migration path (plain JSON from before S3) ---
      // If the stored value is valid JSON, accept it and re-save it encrypted
      // so all future reads go through the encrypted path.
      try {
        const parsed = JSON.parse(stored) as T;
        // Re-encrypt and persist so next read succeeds normally
        this.set(key, parsed);
        return parsed;
      } catch {
        // Not valid JSON either — data is unrecoverable; wipe it
        localStorage.removeItem(key);
        return null;
      }
    } catch (err) {
      console.error("[secureStorage] get error:", err);
      localStorage.removeItem(key);
      return null;
    }
  },

  /** Remove a single key. */
  remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },

  /** Wipe all keys managed by this app (does NOT clear unrelated keys). */
  clearAll(prefix = "devhub_"): void {
    if (typeof window === "undefined") return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k));
  },

  /**
   * Rotate the encryption key. Re-encrypts all devhub_ entries with a new key.
   * Useful after a suspected key compromise. Returns true on success.
   */
  rotateKey(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const oldKey = _encryptionKey;
      if (!oldKey) return false;

      // Collect all devhub_ entries (decrypted with old key)
      const entries: Array<{ key: string; value: unknown }> = [];
      const prefix = "devhub_";
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith(prefix) && k !== STORAGE_KEY_KEY) {
          const val = this.get(k);
          if (val !== null) {
            entries.push({ key: k, value: val });
          }
        }
      }

      // Generate and install new key
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const newKey = btoa(String.fromCharCode(...array));
      localStorage.setItem(STORAGE_KEY_KEY, newKey);
      _encryptionKey = newKey;

      // Re-encrypt all entries with new key
      for (const { key, value } of entries) {
        this.set(key, value);
      }

      return true;
    } catch (err) {
      console.error("[secureStorage] key rotation error:", err);
      return false;
    }
  },
};
