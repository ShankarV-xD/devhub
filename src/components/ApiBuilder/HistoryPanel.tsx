import { Clock, Trash2 } from "lucide-react";
import { ApiRequest } from "./types";

interface HistoryPanelProps {
  history: ApiRequest[];
  onSelect: (request: ApiRequest) => void;
  onClear: () => void;
}

export function HistoryPanel({
  history,
  onSelect,
  onClear,
}: HistoryPanelProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "text-green-500",
      POST: "text-yellow-500",
      PUT: "text-blue-500",
      DELETE: "text-red-500",
      PATCH: "text-purple-500",
    };
    return colors[method] || "text-gray-500";
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
        <Clock size={32} className="mb-2 opacity-50" />
        <p className="text-sm">No history yet</p>
        <p className="text-xs mt-1">Your requests will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">History</h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 hover:text-red-500 transition-colors"
        >
          <Trash2 size={12} />
          Clear
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-auto custom-scrollbar">
        {history.map((request) => (
          <button
            key={request.id}
            onClick={() => onSelect(request)}
            className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded hover:border-zinc-700 transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-medium ${getMethodColor(request.method)}`}
              >
                {request.method}
              </span>
              <span className="text-xs text-zinc-500">
                {formatTime(request.timestamp)}
              </span>
            </div>
            <div className="text-sm text-zinc-300 truncate">{request.url}</div>
            {request.name && (
              <div className="text-xs text-zinc-500 mt-1">{request.name}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
