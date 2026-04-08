"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import { useAppStore } from "@/store/useAppStore";

/**
 * AR5: HistoryContext
 *
 * Provides a focused context for the Zustand-backed undo/redo history stack.
 * Exposes a clean API so components don't need to import Zustand directly
 * for history operations.
 */

interface HistoryContextValue {
  /** Push a new entry onto the history stack */
  addToHistory: (content: string) => void;
  /** Step backwards in history */
  undo: () => void;
  /** Step forwards in history */
  redo: () => void;
  /** True when there is a previous history entry to undo */
  canUndo: boolean;
  /** True when there is a future history entry to redo */
  canRedo: boolean;
  /** Total number of history entries */
  historyLength: number;
  /** Current position within the history stack */
  historyIndex: number;
}

const HistoryContext = createContext<HistoryContextValue | undefined>(
  undefined,
);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const addToHistory = useAppStore((s) => s.addToHistory);
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);
  const history = useAppStore((s) => s.history);
  const historyIndex = useAppStore((s) => s.historyIndex);
  // Use the store's computed helpers
  const canUndoFn = useAppStore((s) => s.canUndo);
  const canRedoFn = useAppStore((s) => s.canRedo);

  const value = useMemo<HistoryContextValue>(
    () => ({
      addToHistory,
      undo,
      redo,
      canUndo: canUndoFn(),
      canRedo: canRedoFn(),
      historyLength: history.length,
      historyIndex,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addToHistory, undo, redo, history, historyIndex],
  );

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}

/**
 * Hook to consume history context.
 * Must be used inside <HistoryProvider>.
 */
export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) {
    throw new Error("useHistory must be used within a <HistoryProvider>");
  }
  return ctx;
}
