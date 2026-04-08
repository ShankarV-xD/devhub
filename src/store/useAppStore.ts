/**
 * AR3: Centralized Zustand Store
 *
 * Single source of truth for all global app state, with:
 *   - devtools middleware for time-travel debugging
 *   - persist middleware for theme + settings across reloads
 *   - History stack (undo/redo) for content changes
 *   - Settings (autoFormat, fontSize, defaultView)
 *   - UI state (sidebar, command palette)
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ContentType } from "@/lib/detector";
import {
  HISTORY_MAX_SIZE,
  STORAGE_KEYS,
} from "@/lib/constants";

type Theme = "light" | "dark";
type ViewMode = "raw" | "tree" | "table";
type ActiveView = "editor" | "todo" | "api";

// ─────────────────────────────────────────────────────────────────
// State shape
// ─────────────────────────────────────────────────────────────────

interface AppSettings {
  autoFormat: boolean;
  fontSize: number;
  defaultView: ViewMode;
}

interface AppState {
  // ── Content ───────────────────────────────────────────────────
  content: string;
  /** Current detected/forced content type */
  type: ContentType;
  /** Alias kept for spec compatibility */
  detectedType: ContentType;
  viewMode: ViewMode;

  // ── UI ────────────────────────────────────────────────────────
  activeView: ActiveView;
  isDiffMode: boolean;
  theme: Theme;
  isSidebarOpen: boolean;
  isCommandPaletteOpen: boolean;

  // ── History stack (for undo/redo) ─────────────────────────────
  history: string[];
  historyIndex: number;

  // ── Settings ──────────────────────────────────────────────────
  settings: AppSettings;

  // ── Content actions ───────────────────────────────────────────
  setContent: (content: string) => void;
  setType: (type: ContentType) => void;
  /** Alias kept for spec compatibility */
  setDetectedType: (type: ContentType) => void;
  setViewMode: (mode: ViewMode) => void;
  clearEditor: () => void;

  // ── View actions ──────────────────────────────────────────────
  setActiveView: (view: ActiveView) => void;
  setIsDiffMode: (isDiff: boolean) => void;

  // ── Theme actions ─────────────────────────────────────────────
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // ── Sidebar / command palette ─────────────────────────────────
  toggleSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  // ── History stack actions ─────────────────────────────────────
  addToHistory: (content: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // ── Settings actions ──────────────────────────────────────────
  updateSettings: (settings: Partial<AppSettings>) => void;
}

// ─────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // ── Initial state ──────────────────────────────────────

        content: "",
        type: "text",
        detectedType: "text",
        viewMode: "raw",

        activeView: "editor",
        isDiffMode: false,
        theme: "dark",
        isSidebarOpen: false,
        isCommandPaletteOpen: false,

        history: [],
        historyIndex: -1,

        settings: {
          autoFormat: false,
          fontSize: 14,
          defaultView: "raw",
        },

        // ── Content actions ────────────────────────────────────

        setContent: (content) => set({ content }),

        setType: (type) => set({ type, detectedType: type }),

        setDetectedType: (detectedType) =>
          set({ detectedType, type: detectedType }),

        setViewMode: (viewMode) => set({ viewMode }),

        clearEditor: () =>
          set({
            content: "",
            type: "text",
            detectedType: "text",
            viewMode: "raw",
          }),

        // ── View actions ───────────────────────────────────────

        setActiveView: (activeView) => set({ activeView }),

        setIsDiffMode: (isDiffMode) => set({ isDiffMode }),

        // ── Theme actions ──────────────────────────────────────

        setTheme: (theme) => {
          set({ theme });
          // Sync dark class with document
          if (typeof document !== "undefined") {
            if (theme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
        },

        toggleTheme: () => {
          const newTheme = get().theme === "dark" ? "light" : "dark";
          get().setTheme(newTheme);
        },

        // ── Sidebar / command palette ──────────────────────────

        toggleSidebar: () =>
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

        openCommandPalette: () => set({ isCommandPaletteOpen: true }),

        closeCommandPalette: () => set({ isCommandPaletteOpen: false }),

        // ── History stack ──────────────────────────────────────

        addToHistory: (content: string) => {
          const { history, historyIndex } = get();
          // Discard future entries if we're not at the tip
          const base = history.slice(0, historyIndex + 1);
          // Avoid duplicate consecutive entries
          if (base[base.length - 1] === content) return;
          const newHistory = [...base, content].slice(-HISTORY_MAX_SIZE);
          set({ history: newHistory, historyIndex: newHistory.length - 1 });
        },

        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            set({ historyIndex: newIndex, content: history[newIndex] });
          }
        },

        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            set({ historyIndex: newIndex, content: history[newIndex] });
          }
        },

        canUndo: () => get().historyIndex > 0,

        canRedo: () => get().historyIndex < get().history.length - 1,

        // ── Settings ───────────────────────────────────────────

        updateSettings: (newSettings) =>
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          })),
      }),
      {
        name: STORAGE_KEYS.APP,
        // Only persist user preferences, not volatile editor state
        partialize: (state) => ({
          theme: state.theme,
          settings: state.settings,
        }),
      },
    ),
    {
      name: "DevHub Store",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
