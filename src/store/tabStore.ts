import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ContentType } from "@/lib/detector";
import { STORAGE_KEYS, MAX_PERSISTED_TABS } from "@/lib/constants";

export interface Tab {
  id: string;
  content: string;
  type: ContentType;
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface TabStore {
  tabs: Tab[];
  activeTabId: string | null;

  // Actions
  createTab: (content?: string) => string;
  closeTab: (id: string) => void;
  switchTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  getActiveTab: () => Tab | null;
  clearAllTabs: () => void;
}

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,

      createTab: (content = "") => {
        const newTab: Tab = {
          id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content,
          type: "text",
          title: "Untitled",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        }));

        return newTab.id;
      },

      closeTab: (id: string) => {
        const { tabs, activeTabId } = get();
        const tabIndex = tabs.findIndex((t) => t.id === id);

        if (tabIndex === -1) return;

        const newTabs = tabs.filter((t) => t.id !== id);

        // If closing active tab, switch to adjacent tab
        let newActiveId = activeTabId;
        if (activeTabId === id) {
          if (newTabs.length > 0) {
            // Switch to previous tab, or next if first
            newActiveId =
              tabIndex > 0 ? newTabs[tabIndex - 1].id : newTabs[0].id;
          } else {
            newActiveId = null;
          }
        }

        set({ tabs: newTabs, activeTabId: newActiveId });
      },

      switchTab: (id: string) => {
        set({ activeTabId: id });
      },

      updateTab: (id: string, updates: Partial<Tab>) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id ? { ...tab, ...updates, updatedAt: Date.now() } : tab
          ),
        }));
      },

      getActiveTab: () => {
        const { tabs, activeTabId } = get();
        return tabs.find((t) => t.id === activeTabId) || null;
      },

      clearAllTabs: () => {
        set({ tabs: [], activeTabId: null });
      },
    }),
    {
      name: STORAGE_KEYS.TABS,
      partialize: (state) => ({
        tabs: state.tabs.slice(0, MAX_PERSISTED_TABS), // Only persist last N tabs
        activeTabId: state.activeTabId,
      }),
    }
  )
);
