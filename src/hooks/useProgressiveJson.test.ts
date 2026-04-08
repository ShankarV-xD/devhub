import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProgressiveJson } from "./useProgressiveJson";

describe("useProgressiveJson", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with provided expanded paths", () => {
    const initialPaths = new Set(["root", "root.child1"]);
    const { result } = renderHook(() => useProgressiveJson(initialPaths));

    expect(result.current.expandedPaths).toEqual(initialPaths);
    expect(result.current.loadingPath).toBeNull();
  });

  it("expands a new path with loading state", () => {
    const initialPaths = new Set<string>();
    const { result } = renderHook(() => useProgressiveJson(initialPaths));

    act(() => {
      result.current.toggleExpand("root");
    });

    expect(result.current.expandedPaths).not.toContain("root");
    expect(result.current.loadingPath).toBe("root");
  });

  it("completes expansion after delay", () => {
    const initialPaths = new Set<string>();
    const { result } = renderHook(() => useProgressiveJson(initialPaths));

    act(() => {
      result.current.toggleExpand("root");
    });

    expect(result.current.loadingPath).toBe("root");

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.expandedPaths).toContain("root");
    expect(result.current.loadingPath).toBeNull();
  });

  it("collapses an expanded path immediately", () => {
    const initialPaths = new Set(["root", "root.child1"]);
    const { result } = renderHook(() => useProgressiveJson(initialPaths));

    act(() => {
      result.current.toggleExpand("root");
    });

    expect(result.current.expandedPaths).not.toContain("root");
    expect(result.current.loadingPath).toBeNull();
  });

  it("cancels expansion if different path is toggled", () => {
    const initialPaths = new Set<string>();
    const { result } = renderHook(() => useProgressiveJson(initialPaths));

    act(() => {
      result.current.toggleExpand("root");
    });

    expect(result.current.loadingPath).toBe("root");

    // Toggle a different path before first completes
    act(() => {
      result.current.toggleExpand("other");
    });

    // After the second toggle, the hook should set loadingPath to "other"
    expect(result.current.loadingPath).toBe("other");

    // Complete first expansion timer - this should be ignored since loadingPath changed
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // First path should not be expanded since loadingPath changed when we toggled "other"
    expect(result.current.expandedPaths).not.toContain("root");
    // The first setTimeout should be ignored, but the second setTimeout is still pending
    // However, since the first timer ran and set loadingPath to null (because path !== loadingPath),
    // we need to advance timers again for the second one to complete
    expect(result.current.loadingPath).toBeNull();

    // Complete second expansion timer
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Now "other" should be expanded
    expect(result.current.expandedPaths).toContain("other");
    expect(result.current.loadingPath).toBeNull();
  });

  it("sets expanded paths directly", () => {
    const initialPaths = new Set<string>();
    const { result } = renderHook(() => useProgressiveJson(initialPaths));

    const newPaths = new Set(["root", "root.child1", "root.child2"]);

    act(() => {
      result.current.setExpandedPaths(newPaths);
    });

    expect(result.current.expandedPaths).toEqual(newPaths);
    expect(result.current.loadingPath).toBeNull();
  });

  it("handles multiple rapid expansions", () => {
    const initialPaths = new Set<string>();
    const { result } = renderHook(() => useProgressiveJson(initialPaths));

    // Rapidly expand multiple paths
    act(() => {
      result.current.toggleExpand("root");
    });
    act(() => {
      result.current.toggleExpand("root.child1");
    });
    act(() => {
      result.current.toggleExpand("root.child2");
    });

    // Only the last one should be in loading state
    expect(result.current.loadingPath).toBe("root.child2");
    expect(result.current.expandedPaths.size).toBe(0);

    // Complete all timers
    act(() => {
      vi.advanceTimersByTime(30);
    });

    // Only the last path should be expanded
    expect(result.current.expandedPaths).toContain("root.child2");
    expect(result.current.expandedPaths.size).toBe(1);
    expect(result.current.loadingPath).toBeNull();
  });

  it("handles expansion and collapse of same path", () => {
    const initialPaths = new Set<string>();
    const { result } = renderHook(() => useProgressiveJson(initialPaths));

    // Start expansion
    act(() => {
      result.current.toggleExpand("root");
    });

    expect(result.current.loadingPath).toBe("root");

    // Complete expansion
    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.expandedPaths).toContain("root");
    expect(result.current.loadingPath).toBeNull();

    // Collapse the same path
    act(() => {
      result.current.toggleExpand("root");
    });

    expect(result.current.expandedPaths).not.toContain("root");
    expect(result.current.loadingPath).toBeNull();
  });

  it("preserves other paths when expanding/collapsing", () => {
    const initialPaths = new Set(["existing.path"]);
    const { result } = renderHook(() => useProgressiveJson(initialPaths));

    // Expand new path
    act(() => {
      result.current.toggleExpand("new.path");
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.expandedPaths).toContain("existing.path");
    expect(result.current.expandedPaths).toContain("new.path");

    // Collapse one path
    act(() => {
      result.current.toggleExpand("existing.path");
    });

    expect(result.current.expandedPaths).not.toContain("existing.path");
    expect(result.current.expandedPaths).toContain("new.path");
  });
});
