import { useState, useCallback } from "react";

interface ProgressiveState {
  expandedPaths: Set<string>;
  loadingPath: string | null;
}

export function useProgressiveJson(initialExpandedPaths: Set<string>) {
  const [state, setState] = useState<ProgressiveState>({
    expandedPaths: initialExpandedPaths,
    loadingPath: null,
  });

  const toggleExpand = useCallback((path: string) => {
    setState((prev) => {
      const isExpanded = prev.expandedPaths.has(path);

      if (isExpanded) {
        // Collapsing is instantaneous
        const newPaths = new Set(prev.expandedPaths);
        newPaths.delete(path);
        return {
          ...prev,
          expandedPaths: newPaths,
          loadingPath: null,
        };
      } else {
        // Expanding triggers a "loading" state
        // In a real heavy scenario, this state allows the UI to render the spinner
        // before the heavy render cycle blocks the main thread.
        return {
          ...prev,
          loadingPath: path,
        };
      }
    });

    // Determine if we need to actually expand (async simulation)
    // We use setTimeout to allow the render cycle to show the spinner first
    setTimeout(() => {
      setState((prev) => {
        if (prev.loadingPath !== path) return prev; // Cancelled or changed

        const newPaths = new Set(prev.expandedPaths);
        newPaths.add(path);
        return {
          ...prev,
          expandedPaths: newPaths,
          loadingPath: null,
        };
      });
    }, 10); // Short delay to allow browser paint
  }, []);

  const setExpandedPaths = useCallback((paths: Set<string>) => {
    setState({
      expandedPaths: paths,
      loadingPath: null,
    });
  }, []);

  return {
    expandedPaths: state.expandedPaths,
    loadingPath: state.loadingPath,
    toggleExpand,
    setExpandedPaths,
  };
}
