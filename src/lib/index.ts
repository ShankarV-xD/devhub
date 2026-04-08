/**
 * AR8: Layered Architecture — Central Barrel Export
 *
 * This file documents and enforces the 3-layer architecture of DevHub.
 * Import core utilities from here instead of reaching into individual files —
 * this ensures the layering contract is explicit and refactoring-friendly.
 *
 * ══════════════════════════════════════════════════════════════════════
 *  LAYER 1 — PRESENTATION
 *  React components, hooks that produce UI state / side effects.
 *  Location: src/components/, src/app/
 *  Rules: May import from Layer 2 and Layer 3. Never import from another page.
 * ══════════════════════════════════════════════════════════════════════
 *
 * ══════════════════════════════════════════════════════════════════════
 *  LAYER 2 — BUSINESS LOGIC
 *  Pure functions, custom hooks (non-UI), state management.
 *  Location: src/hooks/, src/store/, src/lib/ (non-data)
 *  Rules: May import from Layer 3. Must NOT import from Layer 1.
 * ══════════════════════════════════════════════════════════════════════
 *
 * ══════════════════════════════════════════════════════════════════════
 *  LAYER 3 — DATA
 *  API calls, localStorage, external service adapters.
 *  Location: src/lib/history.ts, src/lib/di.ts, src/lib/analytics.ts
 *  Rules: Must NOT import from Layer 1 or Layer 2.
 * ══════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// Layer 2: Business Logic — Core utilities
// ─────────────────────────────────────────────────────────────────

// Content detection
export { detectType } from "./detector";
export type { ContentType } from "./detector";

// Content generation & hashing
export {
  generateUUID,
  encodeBase64,
  decodeBase64,
  generateHash,
  LOREM_IPSUM,
} from "./generators";
export type { HashAlgorithm } from "./generators";

// Constants (AR9)
export {
  TYPE_COLORS,
  UI_COLORS,
  SIZE_LIMITS,
  STORAGE_KEYS,
  QUICK_SWITCH_TOOLS,
  DETECTION_DEBOUNCE_MS,
  AUTO_SAVE_DELAY_MS,
  URL_SAVE_DELAY_MS,
  CLIPBOARD_RESET_DELAY_MS,
  VIEW_TRANSITION_MS,
  TOAST_TIMEOUT_MS,
  FOCUS_DELAY_MS,
  HISTORY_MAX_SIZE,
  MAX_PERSISTED_TABS,
  HISTORY_MIN_LENGTH,
  getTypeColor,
} from "./constants";

// Validation
export { checkContentSize } from "./sizeValidation";

// Download helpers
export { downloadContent, getDownloadFilename, getMimeType } from "./downloadHelpers";

// Error messages
export { getErrorMessage } from "./errorMessages";

// Tool descriptions
export { TOOL_DESCRIPTIONS } from "./toolDescriptions";

// ─────────────────────────────────────────────────────────────────
// Layer 2: Business Logic — Plugin system (AR6)
// ─────────────────────────────────────────────────────────────────

export { pluginRegistry } from "./plugins";
export type {
  PluginAPI,
  ToolConfig,
  ToolComponentProps,
  DetectorFunction,
  TransformFunction,
  TransformConfig,
} from "./plugins";

// ─────────────────────────────────────────────────────────────────
// Layer 3: Data — Service container (AR7)
// ─────────────────────────────────────────────────────────────────

export { container, createContainer } from "./di";
export type { ClipboardService, StorageService, AnalyticsService } from "./di";

// ─────────────────────────────────────────────────────────────────
// Layer 3: Data — Persistent history
// ─────────────────────────────────────────────────────────────────

export {
  addToHistory,
  getHistory,
  clearHistory,
  deleteHistoryItem,
} from "./history";
export type { HistoryItem } from "./history";
