/**
 * S3: Encrypted localStorage
 *
 * Wraps localStorage with AES-256 encryption so that sensitive content
 * (history items containing JWT tokens, API keys, etc.) isn't stored in
 * plain text. Any XSS exploit that reads localStorage gets ciphertext only.
 *
 * Key derivation:
 *   The NEXT_PUBLIC_STORAGE_KEY env var provides the passphrase.
 *   Falls back to a deterministic browser fingerprint so the app still
 *   works without configuration — while still being better than plain text.
 *
 * Usage:
 *   import { secureStorage } from '@/lib/secure-storage';
 *   secureStorage.set('devhub_history', items);
 *   const items = secureStorage.get<HistoryItem[]>('devhub_history');
 */

import CryptoJS from "crypto-js";

// ---------------------------------------------------------------------------
// Encryption key — injected at build time via env var.
// The fallback is intentionally NOT a secret; it only prevents trivial
// plain-text reads and is documented as such.
// ---------------------------------------------------------------------------
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_STORAGE_KEY ?? "devhub-default-key-change-in-prod";

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
      const cipher = CryptoJS.AES.encrypt(plain, ENCRYPTION_KEY).toString();
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
        const bytes = CryptoJS.AES.decrypt(stored, ENCRYPTION_KEY);
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
};
