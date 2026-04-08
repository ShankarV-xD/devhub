import { ContentType } from "./detector";

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
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToHistory(content: string, type: ContentType) {
  if (!content || content.length < 5) return; // Don't save very short content

  const history = getHistory();

  // Avoid duplicates at the top (compare with latest item)
  if (history.length > 0 && history[0].content === content) {
    return;
  }

  const newItem: HistoryItem = {
    id: Date.now().toString(),
    content: content.slice(0, 50000), // increased limit a bit
    type,
    timestamp: Date.now(),
    preview: content.slice(0, 100).replace(/\n/g, " "),
  };

  const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  // Dispatch a storage event so other components can update if needed
  window.dispatchEvent(new Event("local-storage"));
}

export function deleteHistoryItem(id: string) {
  const history = getHistory();
  const updated = history.filter((item) => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("local-storage"));
}
