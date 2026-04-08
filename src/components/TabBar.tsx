import { Plus, X } from "lucide-react";
import clsx from "clsx";
import { Tab } from "@/store/tabStore";
import { getTypeColor } from "@/lib/constants";

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
}

export function TabBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
}: TabBarProps) {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 border-b border-zinc-800 bg-zinc-950 px-2 py-1 overflow-x-auto custom-scrollbar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={clsx(
            "group flex items-center gap-2 px-3 py-1.5 rounded-t-lg border-b-2 transition-all cursor-pointer min-w-[120px] max-w-[200px]",
            activeTabId === tab.id
              ? "bg-zinc-900 border-blue-500 text-zinc-100"
              : "bg-zinc-900/50 border-transparent text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200"
          )}
          onClick={() => onTabClick(tab.id)}
        >
          <div className="flex-1 truncate">
            <div className="flex items-center gap-1.5">
              <span
                className={clsx(
                  "text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded",
                  getTypeColor(tab.type)
                )}
              >
                {tab.type}
              </span>
              <span className="text-xs truncate">
                {tab.title || "Untitled"}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-800 rounded transition-opacity"
            aria-label="Close tab"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      <button
        onClick={onNewTab}
        className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 rounded transition-colors ml-1"
        aria-label="New tab"
        title="New tab (Ctrl+T)"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
