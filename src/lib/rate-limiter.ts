/**
 * S2: Client-Side Rate Limiter
 *
 * Guards expensive operations (proxy calls, hash generation, etc.) from
 * accidental or intentional abuse. Since there is no backend, this runs
 * entirely in the browser — it is a UX guard, not a security boundary.
 *
 * Usage:
 *   import { rateLimiter } from '@/lib/rate-limiter';
 *
 *   if (!rateLimiter.canMakeRequest('url-shorten')) {
 *     toast.error('Too many requests — please wait a moment.');
 *     return;
 *   }
 */

class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60_000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Returns true if the request is allowed, false if the limit is exceeded.
   * Records the request timestamp if allowed.
   */
  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) ?? [];

    // Drop timestamps outside the sliding window
    const valid = timestamps.filter((t) => now - t < this.windowMs);

    if (valid.length >= this.maxRequests) {
      return false;
    }

    valid.push(now);
    this.requests.set(key, valid);
    return true;
  }

  /** How many more requests are allowed within the current window. */
  getRemainingRequests(key: string): number {
    const now = Date.now();
    const valid = (this.requests.get(key) ?? []).filter(
      (t) => now - t < this.windowMs
    );
    return Math.max(0, this.maxRequests - valid.length);
  }

  /**
   * Seconds until the oldest request exits the window (i.e. when capacity
   * becomes available again). Returns 0 if under the limit.
   */
  getRetryAfterSeconds(key: string): number {
    const now = Date.now();
    const valid = (this.requests.get(key) ?? []).filter(
      (t) => now - t < this.windowMs
    );
    if (valid.length < this.maxRequests) return 0;
    const oldest = Math.min(...valid);
    return Math.ceil((oldest + this.windowMs - now) / 1000);
  }

  /** Reset the counter for a specific key (useful in tests). */
  reset(key: string): void {
    this.requests.delete(key);
  }
}

/**
 * Shared singleton instance.
 * 10 requests per minute per operation key — generous for a dev-tools app
 * where each action is deliberate (not background polling).
 */
export const rateLimiter = new ClientRateLimiter(10, 60_000);
