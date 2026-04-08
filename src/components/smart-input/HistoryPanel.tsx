import { useState, useEffect, useRef } from "react";
import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
  HistoryItem,
} from "@/lib/history";
import { History, Trash2, X } from "lucide-react";
import clsx from "clsx";
import { getTypeColor } from "@/lib/constants";

function formatTimeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface HistoryPanelProps {
  onSelect: (content: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryPanel({ onSelect, isOpen, onClose }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  // Refresh history when panel opens
  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 w-80 md:w-96 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 flex flex-col max-h-[500px]"
    >
      <div className="flex items-center justify-between p-3 border-b border-zinc-800 shrink-0">
        <h3 className="font-semibold text-sm text-zinc-200 flex items-center gap-2">
          <History size={16} />
          Recent History
        </h3>
        <div className="flex gap-1">
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
              title="Clear all history"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto custom-scrollbar p-1 flex-1">
        {history.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            No history yet
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {history.map((item) => (
              <div
                key={item.id}
                className="group p-3 rounded-md hover:bg-zinc-800 cursor-pointer relative border border-transparent hover:border-zinc-700 transition-all"
                onClick={() => {
                  onSelect(item.content);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={clsx(
                          "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800",
                          getTypeColor(item.type)
                        )}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-zinc-300 truncate opacity-80 group-hover:opacity-100">
                      {item.preview || "(empty)"}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 rounded transition-all absolute right-2 top-1/2 -translate-y-1/2"
                    title="Delete item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
