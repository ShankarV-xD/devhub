/**
 * AR7: Dependency Injection Container
 *
 * A simple, type-safe service locator / DI container that improves testability
 * by decoupling component code from concrete service implementations.
 *
 * Instead of:
 *   navigator.clipboard.writeText(text); // hard to test
 *
 * Components can use:
 *   const clipboard = container.resolve('clipboard');
 *   clipboard.writeText(text); // mockable in tests
 *
 * Usage:
 *   // Register (in app startup or test setup)
 *   container.register('analytics', () => analyticsService);
 *
 *   // Resolve (in components or hooks)
 *   const analytics = container.resolve<AnalyticsService>('analytics');
 */

// ─────────────────────────────────────────────────────────────────
// Container types
// ─────────────────────────────────────────────────────────────────

type Factory<T> = () => T;

interface Registration<T> {
  factory: Factory<T>;
  singleton: boolean;
  instance?: T;
}

// ─────────────────────────────────────────────────────────────────
// Container implementation
// ─────────────────────────────────────────────────────────────────

class DIContainer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private registry = new Map<string, Registration<any>>();

  /**
   * Register a factory function for a service key.
   *
   * @param key — Unique string identifier for the service
   * @param factory — Function that creates the service instance
   * @param singleton — If true (default), the factory is called once and the
   *                    instance is cached for subsequent resolves.
   */
  register<T>(key: string, factory: Factory<T>, singleton = true): void {
    if (this.registry.has(key)) {
      // Allow override (useful in tests to swap implementations)
      if (process.env.NODE_ENV === "development") {
        console.warn(`[DIContainer] Overriding registration for key "${key}"`);
      }
    }
    this.registry.set(key, { factory, singleton });
  }

  /**
   * Resolve a registered service by key.
   * Throws a descriptive error if the key is unknown.
   */
  resolve<T>(key: string): T {
    const registration = this.registry.get(key) as Registration<T> | undefined;

    if (!registration) {
      throw new Error(
        `[DIContainer] No service registered for key "${key}". ` +
          `Available keys: ${Array.from(this.registry.keys()).join(", ") || "(none)"}`,
      );
    }

    if (registration.singleton) {
      if (!("instance" in registration) || registration.instance === undefined) {
        registration.instance = registration.factory();
      }
      return registration.instance as T;
    }

    // Transient: always call factory
    return registration.factory();
  }

  /**
   * Check whether a key has been registered without resolving it.
   */
  has(key: string): boolean {
    return this.registry.has(key);
  }

  /**
   * Remove a registration (useful for test teardown).
   */
  unregister(key: string): void {
    this.registry.delete(key);
  }

  /**
   * Reset all registrations (useful for test isolation).
   */
  reset(): void {
    this.registry.clear();
  }

  /** List all registered service keys (for debugging) */
  keys(): string[] {
    return Array.from(this.registry.keys());
  }
}

// ─────────────────────────────────────────────────────────────────
// Well-known service interfaces
// ─────────────────────────────────────────────────────────────────

export interface ClipboardService {
  writeText(text: string): Promise<void>;
  readText(): Promise<string>;
}

export interface StorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AnalyticsService {
  track(event: string, properties?: Record<string, unknown>): void;
  page(name: string): void;
}

// ─────────────────────────────────────────────────────────────────
// App container — singleton with default registrations
// ─────────────────────────────────────────────────────────────────

/** Global DI container — import to resolve or register services */
export const container = new DIContainer();

// Register default implementations

container.register<ClipboardService>("clipboard", () => ({
  writeText: (text: string) => navigator.clipboard.writeText(text),
  readText: () => navigator.clipboard.readText(),
}));

container.register<StorageService>("storage", () => ({
  getItem: (key: string) =>
    typeof localStorage !== "undefined" ? localStorage.getItem(key) : null,
  setItem: (key: string, value: string) => {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key);
  },
}));

container.register<AnalyticsService>("analytics", () => ({
  track: (event: string, properties?: Record<string, unknown>) => {
    if (
      typeof window !== "undefined" &&
      typeof (window as unknown as { posthog?: { capture: (...a: unknown[]) => void } }).posthog?.capture === "function"
    ) {
      (window as unknown as { posthog: { capture: (e: string, p?: unknown) => void } }).posthog.capture(event, properties);
    }
  },
  page: (name: string) => {
    if (
      typeof window !== "undefined" &&
      typeof (window as unknown as { posthog?: { capture: (...a: unknown[]) => void } }).posthog?.capture === "function"
    ) {
      (window as unknown as { posthog: { capture: (e: string) => void } }).posthog.capture("$pageview");
      void name;
    }
  },
}));

// ─────────────────────────────────────────────────────────────────
// Factory helper (for non-singleton use cases or testing)
// ─────────────────────────────────────────────────────────────────

/**
 * Create a fresh, isolated DI container.
 * Use this in tests to avoid polluting the global container.
 */
export function createContainer(): DIContainer {
  return new DIContainer();
}

export { DIContainer };
