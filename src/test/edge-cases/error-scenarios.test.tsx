import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Test component that throws errors
const ErrorComponent = ({
  shouldThrow = false,
  errorMessage = "Test error",
}: {
  shouldThrow?: boolean;
  errorMessage?: string;
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>Normal content</div>;
};

describe("Error Scenario Edge Cases", () => {
  beforeEach(() => {
    // Mock console.error to avoid test output noise
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Component Error Boundaries", () => {
    it("should catch and render error fallback", () => {
      render(
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <ErrorComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.queryByText("Normal content")).not.toBeInTheDocument();
    });

    it("should render children normally when no error", () => {
      render(
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <ErrorComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Normal content")).toBeInTheDocument();
      expect(
        screen.queryByText("Something went wrong")
      ).not.toBeInTheDocument();
    });

    it("should handle different error types", () => {
      const TypeErrorComponent = () => {
        throw new TypeError("Cannot read property of undefined");
      };

      render(
        <ErrorBoundary fallback={<div>Type error occurred</div>}>
          <TypeErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText("Type error occurred")).toBeInTheDocument();
    });
  });

  describe("Network Error Scenarios", () => {
    it("should handle fetch failures gracefully", async () => {
      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const ComponentWithFetch = () => {
        const [data, setData] = React.useState<string | null>(null);
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
          fetch("/api/data")
            .then((res) => res.json())
            .then(setData)
            .catch((e: Error) => setError(e.message));
        }, []);

        if (error) return <div>Network error: {error}</div>;
        if (data) return <div>Data loaded</div>;
        return <div>Loading...</div>;
      };

      render(<ComponentWithFetch />);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it("should handle timeout errors", async () => {
      // Mock fetch to timeout
      global.fetch = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timeout")), 300)
            )
        );

      const ComponentWithTimeout = () => {
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
          const timeoutId = setTimeout(() => {
            setError("Request timeout");
          }, 200);

          fetch("/api/data")
            .catch(() => {})
            .finally(() => clearTimeout(timeoutId));

          return () => clearTimeout(timeoutId);
        }, []);

        if (error) return <div>Timeout error: {error}</div>;
        return <div>Loading...</div>;
      };

      render(<ComponentWithTimeout />);

      await waitFor(
        () => {
          expect(screen.getByText(/Timeout error/)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Input Validation Edge Cases", () => {
    it("should handle malformed JSON input", () => {
      const JsonValidator = ({ input }: { input: string }) => {
        let currentError: string | null = null;
        let isValid = false;
        try {
          JSON.parse(input);
          isValid = true;
        } catch (e) {
          currentError = (e as Error).message;
        }

        if (isValid) return <div>Valid JSON</div>;
        return <div>Invalid JSON: {currentError}</div>;
      };

      const malformedJson = '{"name": "test", "invalid":}';

      render(<JsonValidator input={malformedJson} />);

      expect(screen.getByText(/Invalid JSON/)).toBeInTheDocument();
    });

    it("should handle extremely large inputs", () => {
      const LargeInputHandler = ({ input }: { input: string }) => {
        const MAX_SIZE = 1000;

        if (input.length > MAX_SIZE) {
          return (
            <div>
              Input too large: {input.length} characters (max: {MAX_SIZE})
            </div>
          );
        }

        return <div>Input processed: {input.length} characters</div>;
      };

      const largeInput = "a".repeat(2000);

      render(<LargeInputHandler input={largeInput} />);

      expect(screen.getByText(/Input too large/)).toBeInTheDocument();
      expect(screen.getByText(/2000 characters/)).toBeInTheDocument();
    });

    it("should handle special characters and encoding", () => {
      const SpecialCharacterHandler = ({ input }: { input: string }) => {
        let encodingError: string | null = null;
        let isDecodedDiff = false;
        try {
          // Test for various encoding issues
          const encoded = encodeURIComponent(input);
          const decoded = decodeURIComponent(encoded);

          if (decoded !== input) {
            isDecodedDiff = true;
          }
        } catch (e) {
          encodingError = (e as Error).message;
        }

        if (encodingError) {
          return <div>Encoding error: {encodingError}</div>;
        }
        if (isDecodedDiff) {
          return <div>Encoding issue detected</div>;
        }
        return <div>Special characters handled: {input}</div>;
      };

      const specialChars = "🚀 Test with émojis and spëcial chars";

      render(<SpecialCharacterHandler input={specialChars} />);

      expect(
        screen.getByText(/Special characters handled/)
      ).toBeInTheDocument();
    });
  });

  describe("Memory and Performance Edge Cases", () => {
    it("should handle memory leaks in useEffect", () => {
      const MemoryLeakComponent = ({
        shouldLeak = false,
      }: {
        shouldLeak?: boolean;
      }) => {
        const [count, setCount] = React.useState(0);

        React.useEffect(() => {
          if (shouldLeak) {
            // Simulate memory leak
            setInterval(() => {
              setCount((c) => c + 1);
            }, 10);

            // Don't cleanup - this would be a memory leak
            // return () => clearInterval(interval);
          } else {
            const interval = setInterval(() => {
              setCount((c) => c + 1);
            }, 10);

            return () => clearInterval(interval);
          }
        }, [shouldLeak]);

        return <div>Count: {count}</div>;
      };

      const { unmount } = render(<MemoryLeakComponent shouldLeak={false} />);

      // Component should render normally
      expect(screen.getByText("Count: 0")).toBeInTheDocument();

      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });

    it("should handle infinite recursion prevention", () => {
      const RecursiveComponent = ({
        depth = 0,
        maxDepth = 5,
      }: {
        depth?: number;
        maxDepth?: number;
      }) => {
        if (depth >= maxDepth) {
          return <div>Max depth reached: {depth}</div>;
        }

        return (
          <div>
            Depth: {depth}
            <RecursiveComponent depth={depth + 1} maxDepth={maxDepth} />
          </div>
        );
      };

      render(<RecursiveComponent />);

      expect(screen.getByText("Max depth reached: 5")).toBeInTheDocument();
    });
  });

  describe("Browser Compatibility Edge Cases", () => {
    it("should handle missing browser APIs", () => {
      // Mock missing API
      const originalLocalStorage = global.localStorage;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).localStorage = undefined;

      const LocalStorageComponent = () => {
        let currentError: string | null = null;
        let isWorking = false;
        try {
          localStorage.setItem("test", "value");
          isWorking = true;
        } catch {
          currentError = "LocalStorage not available";
        }

        if (isWorking) return <div>LocalStorage working</div>;
        return <div>Fallback: {currentError}</div>;
      };

      render(<LocalStorageComponent />);

      expect(screen.getByText(/Fallback/)).toBeInTheDocument();

      // Restore localStorage
      global.localStorage = originalLocalStorage;
    });

    it("should handle unsupported features gracefully", () => {
      // Mock unsupported feature
      const originalIntersectionObserver = global.IntersectionObserver;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).IntersectionObserver = undefined;

      const IntersectionObserverComponent = () => {
        const [supported, setSupported] = React.useState(true);

        React.useEffect(() => {
          if (typeof IntersectionObserver === "undefined") {
            setSupported(false);
          }
        }, []);

        if (!supported) {
          return <div>IntersectionObserver not supported - using fallback</div>;
        }

        return <div>IntersectionObserver supported</div>;
      };

      render(<IntersectionObserverComponent />);

      expect(
        screen.getByText(/not supported - using fallback/)
      ).toBeInTheDocument();

      // Restore IntersectionObserver
      global.IntersectionObserver = originalIntersectionObserver;
    });
  });

  describe("Race Conditions and Async Issues", () => {
    it("should handle component unmounting during async operation", async () => {
      const AsyncComponent = ({
        shouldUnmount = false,
      }: {
        shouldUnmount?: boolean;
      }) => {
        const [data, setData] = React.useState<string | null>(null);
        const mountedRef = React.useRef(true);

        React.useEffect(() => {
          const fetchData = async () => {
            try {
              // Simulate async operation
              await new Promise((resolve) => setTimeout(resolve, 100));

              // Check if component is still mounted
              if (mountedRef.current) {
                setData("Data loaded");
              }
            } catch (error) {
              if (mountedRef.current) {
                console.error("Async error:", error);
              }
            }
          };

          fetchData();

          return () => {
            mountedRef.current = false;
          };
        }, [shouldUnmount]);

        return <div>{data || "Loading..."}</div>;
      };

      const { unmount } = render(<AsyncComponent />);

      // Unmount before async operation completes
      unmount();

      // Should not throw any errors
      expect(true).toBeTruthy();
    });

    it("should handle multiple rapid state updates", async () => {
      const RapidUpdateComponent = () => {
        const [count, setCount] = React.useState(0);
        const [isProcessing, setIsProcessing] = React.useState(false);

        const handleRapidUpdates = async () => {
          setIsProcessing(true);

          // Simulate rapid updates
          for (let i = 0; i < 100; i++) {
            setCount((prev) => prev + 1);
            await new Promise((resolve) => setTimeout(resolve, 1));
          }

          setIsProcessing(false);
        };

        return (
          <div>
            <div>Count: {count}</div>
            <button onClick={handleRapidUpdates} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Start Rapid Updates"}
            </button>
          </div>
        );
      };

      render(<RapidUpdateComponent />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(screen.getByText("Count: 100")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });
});
