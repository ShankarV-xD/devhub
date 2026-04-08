"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import { useAppStore } from "@/store/useAppStore";

/**
 * AR5: SettingsContext
 *
 * Provides a focused context for user-configurable settings.
 * Separates settings concerns from the broader AppState so
 * components that only care about settings don't re-render
 * on content/type changes.
 */

interface AppSettings {
  autoFormat: boolean;
  fontSize: number;
  defaultView: "raw" | "tree" | "table";
}

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  /** Convenience: toggle autoFormat */
  toggleAutoFormat: () => void;
  /** Convenience: set font size with clamping (10–24) */
  setFontSize: (size: number) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      updateSettings,
      toggleAutoFormat: () =>
        updateSettings({ autoFormat: !settings.autoFormat }),
      setFontSize: (size: number) =>
        updateSettings({ fontSize: Math.min(24, Math.max(10, size)) }),
    }),
    [settings, updateSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to consume settings context.
 * Must be used inside <SettingsProvider>.
 */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a <SettingsProvider>");
  }
  return ctx;
}
