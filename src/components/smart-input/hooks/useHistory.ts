import { useState, useEffect, useCallback } from "react";

interface UseHistoryOptions {
  maxHistorySize?: number;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useHistory(
  content: string,
  setContent: (content: string) => void,
  options: UseHistoryOptions = {}
) {
  const { maxHistorySize = 20, onUndo, onRedo } = options;

  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Record content to history
  const recordHistory = useCallback(
    (newContent: string) => {
      // Don't record if content hasn't changed
      if (historyIndex >= 0 && history[historyIndex] === newContent) {
        return;
      }

      // Remove any "future" history if user made changes after undoing
      const newHistory = history.slice(0, historyIndex + 1);

      // Add new state
      newHistory.push(newContent);

      // Keep only last N states
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      } else {
        setHistoryIndex(historyIndex + 1);
      }

      setHistory(newHistory);
    },
    [history, historyIndex, maxHistorySize]
  );

  // Undo (Ctrl+Z)
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
      onUndo?.();
    }
  }, [historyIndex, history, setContent, onUndo]);

  // Redo (Ctrl+Y / Ctrl+Shift+Z)
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
      onRedo?.();
    }
  }, [historyIndex, history, setContent, onRedo]);

  // Auto-record content changes
  useEffect(() => {
    if (content) {
      recordHistory(content);
    }
  }, [content]);

  return {
    history,
    historyIndex,
    undo,
    redo,
    recordHistory,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}
