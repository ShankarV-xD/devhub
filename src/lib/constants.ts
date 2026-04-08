import { ContentType } from "./detector";

/**
 * Color mappings for different content types
 * Used for visual differentiation in the UI
 */
export const TYPE_COLORS: Record<ContentType, string> = {
  json: "text-yellow-500",
  jwt: "text-rose-500",
  base64: "text-blue-500",
  regex: "text-emerald-500",
  uuid: "text-purple-500",
  code: "text-cyan-500",
  sql: "text-orange-500",
  url: "text-sky-500",
  color: "text-pink-500",
  html: "text-orange-500",
  markdown: "text-blue-500",
  cron: "text-violet-500",
  yaml: "text-amber-500",
  timestamp: "text-teal-500",
  csv: "text-green-500",
  xml: "text-orange-500",
  graphql: "text-pink-500",
  ipaddress: "text-cyan-500",
  text: "text-zinc-100",
  hash: "text-red-500",
  css: "text-indigo-400",
  ascii: "text-purple-400",
};

/**
 * Get the color class for a given content type
 */
export function getTypeColor(type: ContentType): string {
  return TYPE_COLORS[type] || TYPE_COLORS.text;
}

/**
 * Special colors for UI states
 */
export const UI_COLORS = {
  todo: "text-emerald-500",
  success: "text-emerald-400",
  error: "text-rose-400",
  warning: "text-amber-400",
  info: "text-blue-400",
} as const;

/**
 * Content size limits (in characters)
 */
export const SIZE_LIMITS = {
  WARNING: 100_000, // 100 KB - Show warning
  MAX: 1_000_000, // 1 MB - Hard limit
  MONACO_MAX: 500_000, // 500 KB - Monaco editor limit
};

// ─────────────────────────────────────────────────────────────────
// AR9: Timing constants — eliminate magic numbers across codebase
// ─────────────────────────────────────────────────────────────────

/** How long to debounce content type detection after each keystroke (ms) */
export const DETECTION_DEBOUNCE_MS = 300;

/** Delay before auto-saving content to persistent history (ms) */
export const AUTO_SAVE_DELAY_MS = 2000;

/** Delay before persisting editor content to URL state (ms) */
export const URL_SAVE_DELAY_MS = 500;

/** How long the clipboard "isCopied" visual state persists (ms) */
export const CLIPBOARD_RESET_DELAY_MS = 2000;

/** Duration of view-mode transition animation (ms) */
export const VIEW_TRANSITION_MS = 200;

/** Auto-dismiss duration for detection toast messages (ms) */
export const TOAST_TIMEOUT_MS = 3000;

/** Auto-focus delay after programmatic content load (ms) */
export const FOCUS_DELAY_MS = 100;

// ─────────────────────────────────────────────────────────────────
// AR9: History & tab constants
// ─────────────────────────────────────────────────────────────────

/** Maximum number of undo/redo history entries kept in memory */
export const HISTORY_MAX_SIZE = 20;

/** Maximum number of tabs persisted to localStorage */
export const MAX_PERSISTED_TABS = 10;

/** Minimum content length (chars) before auto-saving to history */
export const HISTORY_MIN_LENGTH = 5;

// ─────────────────────────────────────────────────────────────────
// AR9: localStorage keys — single source of truth
// ─────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  APP: "devhub-storage",
  TABS: "devhub-tabs",
  THEME: "devhub-theme",
  SETTINGS: "devhub-settings",
  HISTORY: "devhub-history",
} as const;

// ─────────────────────────────────────────────────────────────────
// AR9: Quick-switch tool mapping (keyboard shortcuts 1–5)
// ─────────────────────────────────────────────────────────────────

export const QUICK_SWITCH_TOOLS: ContentType[] = [
  "json",
  "jwt",
  "sql",
  "base64",
  "url",
];
