/**
 * AR3: Centralized Zustand Store
 *
 * Single source of truth for all global app state, with:
 *   - devtools middleware for time-travel debugging
 *   - persist middleware for theme + settings across reloads
 *   - Only global/UI state lives here — content and editor state
 *     are owned by SmartInput and its hooks.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";

type Theme = "light" | "dark";
type ViewMode = "raw" | "tree" | "table";

// ─────────────────────────────────────────────────────────────────
// State shape
// ─────────────────────────────────────────────────────────────────

interface AppSettings {
  autoFormat: boolean;
  fontSize: number;
  defaultView: ViewMode;
}

interface AppState {
  // ── Theme ──────────────────────────────────────────────────────
  theme: Theme;

  // ── UI toggles ─────────────────────────────────────────────────
  isSidebarOpen: boolean;
  isCommandPaletteOpen: boolean;

  // ── Settings ───────────────────────────────────────────────────
  settings: AppSettings;

  // ── Theme actions ──────────────────────────────────────────────
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // ── Sidebar / command palette ───────────────────────────────────
  toggleSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  // ── Settings actions ────────────────────────────────────────────
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

        theme: "dark",
        isSidebarOpen: false,
        isCommandPaletteOpen: false,

        settings: {
          autoFormat: false,
          fontSize: 14,
          defaultView: "raw" as ViewMode,
        },

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
      }
    ),
    {
      name: "DevHub Store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
