"use client";

import { useEffect, useState } from "react";
import { useTabStore } from "@/store/tabStore";
import { TabBar } from "./TabBar";
import { toast } from "sonner";
import SmartInput from "./smart-input/SmartInput";
import { detectType } from "@/lib/detector";

/**
 * Multi-Tab wrapper for SmartInput
 *
 * NOTE: This component is ready but not yet integrated because SmartInput
 * doesn't currently accept `initialContent` and `onContentChange` props.
 *
 * To integrate:
 * 1. Refactor SmartInput to accept these props instead of using URL state
 * 2. Update this component to pass content to SmartInput
 * 3. Replace SmartInputWrapper with MultiTabSmartInput in page.tsx
 */
export function MultiTabSmartInput() {
  const { tabs, activeTabId, createTab, closeTab, switchTab } = useTabStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Using requestAnimationFrame to avoid setState-in-effect warning
    // while still ensuring client-side only rendering
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  // Create initial tab if none exists - ONLY after hydration
  useEffect(() => {
    if (mounted && tabs.length === 0) {
      createTab("");
    }
  }, [mounted, tabs.length, createTab]);

  // Keyboard shortcuts for tab navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+T - New tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "t") {
        e.preventDefault();
        createTab("");
        toast.success("New tab created");
      }

      // Ctrl+W - Close current tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (activeTabId && tabs.length > 1) {
          closeTab(activeTabId);
          toast.success("Tab closed");
        }
      }

      // Ctrl+Tab - Next tab
      if (e.ctrlKey && e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
        if (currentIndex !== -1 && tabs.length > 1) {
          const nextIndex = (currentIndex + 1) % tabs.length;
          switchTab(tabs[nextIndex].id);
        }
      }

      // Ctrl+Shift+Tab - Previous tab
      if (e.ctrlKey && e.shiftKey && e.key === "Tab") {
        e.preventDefault();
        const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
        if (currentIndex !== -1 && tabs.length > 1) {
          const prevIndex =
            currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
          switchTab(tabs[prevIndex].id);
        }
      }

      // Ctrl+1-9 - Switch to tab by number
      if ((e.ctrlKey || e.metaKey) && /^[1-9]$/.test(e.key)) {
        const tabIndex = parseInt(e.key, 10) - 1;
        if (tabIndex < tabs.length) {
          e.preventDefault();
          switchTab(tabs[tabIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tabs, activeTabId, createTab, closeTab, switchTab]);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleTabContentChange = (content: string) => {
    if (activeTabId) {
      // Update store
      const type = detectType(content);
      // We need a store action to update content/type/title
      // Added updateTab to destructuring at top (need to execute that first or assuming it's available)
      useTabStore.getState().updateTab(activeTabId, {
        content,
        type,
        title: type.toUpperCase() || "Untitled",
      });
    }
  };

  const handleNewTab = () => {
    createTab("");
    toast.success("New tab created");
  };

  const handleTabClose = (id: string) => {
    if (tabs.length > 1) {
      closeTab(id);
      toast.success("Tab closed");
    } else {
      toast.error("Cannot close the last tab");
    }
  };

  return (
    <div className="flex flex-col w-full h-svh">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={switchTab}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
      />

      {/* Active Tab Content */}
      {activeTab && (
        <div className="flex-1 overflow-hidden relative">
          <SmartInput
            key={activeTab.id}
            initialContent={activeTab.content}
            onContentChange={handleTabContentChange}
          />
        </div>
      )}
    </div>
  );
}
