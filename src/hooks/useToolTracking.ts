import { useState, useCallback } from "react";

export interface ToolUsage {
  toolId: string;
  toolName: string;
  timestamp: number;
  wasSuccessful: boolean;
}

interface UseToolTrackingOptions {
  maxHistory?: number;
}

export function useToolTracking(options: UseToolTrackingOptions = {}) {
  const { maxHistory = 20 } = options;

  const [toolHistory, setToolHistory] = useState<ToolUsage[]>([]);
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set());

  const trackToolUsage = useCallback(
    (toolId: string, toolName: string, wasSuccessful: boolean = true) => {
      const usage: ToolUsage = {
        toolId,
        toolName,
        timestamp: Date.now(),
        wasSuccessful,
      };

      setToolHistory((prev) => {
        const newHistory = [usage, ...prev].slice(0, maxHistory);
        return newHistory;
      });

      if (wasSuccessful) {
        setActiveTools((prev) => new Set(prev).add(toolId));
      }
    },
    [maxHistory]
  );

  const clearToolHistory = useCallback(() => {
    setToolHistory([]);
    setActiveTools(new Set());
  }, []);

  const isToolActive = useCallback(
    (toolId: string) => {
      return activeTools.has(toolId);
    },
    [activeTools]
  );

  const getLastToolUsage = useCallback(
    (toolId: string) => {
      return toolHistory.find((usage) => usage.toolId === toolId);
    },
    [toolHistory]
  );

  return {
    toolHistory,
    activeTools,
    trackToolUsage,
    clearToolHistory,
    isToolActive,
    getLastToolUsage,
  };
}
