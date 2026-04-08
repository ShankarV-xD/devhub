"use client";

import JsonViewer from "@/components/JsonViewer";
import JsonTable from "@/components/JsonTable";
import clsx from "clsx";

interface JsonRendererProps {
  data: unknown;
  viewMode: "raw" | "tree" | "table";
  onViewModeChange: (mode: "raw" | "tree" | "table") => void;
}

export function JsonRenderer({
  data,
  viewMode,
  onViewModeChange,
  children,
}: JsonRendererProps & { children?: React.ReactNode }) {
  if (!data) return <>{children}</>;

  return (
    <div className="flex flex-col h-full">
      {/* View Mode Tabs */}
      <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800 mb-4 shrink-0">
        <button
          onClick={() => onViewModeChange("raw")}
          className={clsx(
            "cursor-pointer px-3 py-1 text-xs font-medium rounded transition-colors",
            viewMode === "raw"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-400"
          )}
        >
          Raw
        </button>
        <button
          onClick={() => onViewModeChange("tree")}
          className={clsx(
            "cursor-pointer px-3 py-1 text-xs font-medium rounded transition-colors",
            viewMode === "tree"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-400"
          )}
        >
          Tree
        </button>
        <button
          onClick={() => onViewModeChange("table")}
          className={clsx(
            "cursor-pointer px-3 py-1 text-xs font-medium rounded transition-colors",
            viewMode === "table"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-400"
          )}
        >
          Table
        </button>
      </div>

      {/* Render based on view mode */}
      {viewMode === "raw" && (
        <div className="flex-1 relative min-h-0">{children}</div>
      )}
      {viewMode === "tree" && (
        <div className="flex-1 overflow-auto custom-scrollbar">
          <JsonViewer data={data || {}} />
        </div>
      )}
      {viewMode === "table" && (
        <div className="flex-1 overflow-auto custom-scrollbar">
          <JsonTable data={data} />
        </div>
      )}
    </div>
  );
}
