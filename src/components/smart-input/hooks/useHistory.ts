import { useState, useEffect, useCallback, useRef } from "react";

interface UseHistoryOptions {
  maxHistorySize?: number;
  onUndo?: () => void;
  onRedo?: () => void;
  /** Milliseconds to debounce before recording a content change. Default: 400 */
  debounceMs?: number;
}

interface HistoryState {
  entries: string[];
  index: number;
}

export function useHistory(
  content: string,
  setContent: (content: string) => void,
  options: UseHistoryOptions = {}
) {
  const { maxHistorySize = 20, onUndo, onRedo, debounceMs = 400 } = options;

  const [state, setState] = useState<HistoryState>({
    entries: [],
    index: -1,
  });

  const lastCommittedRef = useRef<string>("");

  // Debounced recording: only commit to history after the user stops typing.
  // Uses functional setState so the timeout always operates on the latest state.
  useEffect(() => {
    if (!content) return;

    const timer = setTimeout(() => {
      if (content !== lastCommittedRef.current) {
        lastCommittedRef.current = content;

        setState((prev) => {
          // Discard future entries if we're not at the tip
          const base = prev.entries.slice(0, prev.index + 1);

          // Avoid duplicate consecutive entries
          if (base.length > 0 && base[base.length - 1] === content) {
            return prev;
          }

          const newEntries = [...base, content];
          const trimmed =
            newEntries.length > maxHistorySize
              ? newEntries.slice(-maxHistorySize)
              : newEntries;

          return { entries: trimmed, index: trimmed.length - 1 };
        });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [content, debounceMs, maxHistorySize]);

  // Record content to history (immediate — used by programmatic changes like format/minify)
  const recordHistory = useCallback(
    (newContent: string) => {
      if (newContent === lastCommittedRef.current) return;
      lastCommittedRef.current = newContent;

      setState((prev) => {
        const base = prev.entries.slice(0, prev.index + 1);

        if (base.length > 0 && base[base.length - 1] === newContent) {
          return prev;
        }

        const newEntries = [...base, newContent];
        const trimmed =
          newEntries.length > maxHistorySize
            ? newEntries.slice(-maxHistorySize)
            : newEntries;

        return { entries: trimmed, index: trimmed.length - 1 };
      });
    },
    [maxHistorySize]
  );

  // Undo (Ctrl+Z)
  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.index <= 0) return prev;
      const newIndex = prev.index - 1;
      setContent(prev.entries[newIndex]);
      onUndo?.();
      return { ...prev, index: newIndex };
    });
  }, [setContent, onUndo]);

  // Redo (Ctrl+Y / Ctrl+Shift+Z)
  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.index >= prev.entries.length - 1) return prev;
      const newIndex = prev.index + 1;
      setContent(prev.entries[newIndex]);
      onRedo?.();
      return { ...prev, index: newIndex };
    });
  }, [setContent, onRedo]);

  return {
    history: state.entries,
    historyIndex: state.index,
    undo,
    redo,
    recordHistory,
    canUndo: state.index > 0,
    canRedo: state.index < state.entries.length - 1,
  };
}
