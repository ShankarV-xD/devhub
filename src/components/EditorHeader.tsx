import { clsx } from "clsx";
import {
  CheckCircle,
  AlertTriangle,
  Trash2,
  ArrowDown,
  Share2,
} from "lucide-react";
import Tooltip from "./Tooltip";
import { ContentType } from "@/lib/detector";
import { getTypeColor, UI_COLORS } from "@/lib/constants";

interface EditorHeaderProps {
  activeView: "editor" | "todo";
  content: string;
  type: ContentType;
  msg: { text: string; type: "success" | "error" } | null;
  contentStats: {
    chars: number;
    words: number;
    lines: number;
    bytes: number;
  } | null;
  onClear: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export function EditorHeader({
  activeView,
  content,
  type,
  msg,
  contentStats,
  onClear,
  onDownload,
  onShare,
}: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 h-8 shrink-0">
      <div
        className={clsx(
          "text-xs uppercase tracking-[0.2em] font-bold flex items-center gap-3",
          !content && activeView === "editor" ? "opacity-30" : "opacity-100",
          activeView === "todo" ? UI_COLORS.todo : getTypeColor(type)
        )}
      >
        <span>
          {activeView === "todo"
            ? "TODO LIST"
            : content
              ? type
              : "WAITING FOR INPUT..."}
        </span>

        {msg && (
          <span
            className={clsx(
              "ml-4 normal-case tracking-normal flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 rounded-full px-2 py-0.5 text-[10px]",
              msg.type === "success"
                ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/50"
                : "bg-rose-950/50 text-rose-400 border border-rose-900/50"
            )}
          >
            {msg.type === "success" ? (
              <CheckCircle size={10} />
            ) : (
              <AlertTriangle size={10} />
            )}
            {msg.text}
          </span>
        )}
      </div>

      {/* Statistics and Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Content Statistics */}
        {contentStats && activeView === "editor" && (
          <div className="flex items-center gap-4 text-[10px] text-zinc-600 uppercase tracking-wider">
            <span>{contentStats.chars} chars</span>
            <span>{contentStats.words} words</span>
            <span>{contentStats.lines} lines</span>
          </div>
        )}

        {/* Share Button */}
        {content && activeView === "editor" && (
          <Tooltip text="Share via URL">
            <button
              onClick={onShare}
              aria-label="Share content"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-zinc-900 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
            >
              <Share2 size={16} />
            </button>
          </Tooltip>
        )}

        {/* Download Button */}
        {content && activeView === "editor" && (
          <Tooltip text="Download content (Ctrl+D)">
            <button
              onClick={onDownload}
              aria-label="Download content"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-zinc-900 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
            >
              <ArrowDown size={16} />
            </button>
          </Tooltip>
        )}

        {/* Clear Button */}
        {content && activeView === "editor" && (
          <Tooltip text="Clear content (Escape)">
            <button
              onClick={onClear}
              aria-label="Clear content"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-zinc-900 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
