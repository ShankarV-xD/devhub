/**
 * History module — auto-saves recent editor sessions to encrypted storage.
 *
 * S3: Uses secureStorage (AES-256) instead of raw localStorage so that
 * history items containing JWT tokens, API keys, and other sensitive content
 * are never stored in plain text.
 */

import { ContentType } from "./detector";
import { secureStorage } from "./secure-storage";

export interface HistoryItem {
  id: string;
  content: string;
  type: ContentType;
  timestamp: number;
  preview: string;
}

const HISTORY_KEY = "devhub_history";
const MAX_HISTORY_ITEMS = 10;

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  // secureStorage.get handles decrypt errors gracefully, returning null
  return secureStorage.get<HistoryItem[]>(HISTORY_KEY) ?? [];
}

export function addToHistory(content: string, type: ContentType) {
  if (!content || content.length < 5) return; // skip trivially short content

  const history = getHistory();

  // Avoid duplicate at the top
  if (history.length > 0 && history[0].content === content) return;

  const newItem: HistoryItem = {
    id: Date.now().toString(),
    content: content.slice(0, 50_000),
    type,
    timestamp: Date.now(),
    preview: content.slice(0, 100).replace(/\n/g, " "),
  };

  const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
  secureStorage.set(HISTORY_KEY, updated); // encrypted ✅
}

export function clearHistory() {
  secureStorage.remove(HISTORY_KEY);
  window.dispatchEvent(new Event("local-storage"));
}

export function deleteHistoryItem(id: string) {
  const history = getHistory();
  const updated = history.filter((item) => item.id !== id);
  secureStorage.set(HISTORY_KEY, updated); // encrypted ✅
  window.dispatchEvent(new Event("local-storage"));
}
