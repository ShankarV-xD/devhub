"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Download, Braces } from "lucide-react";
import { toast } from "sonner";
import { ApiResponse } from "./types";

interface ResponsePanelProps {
  response: ApiResponse | null;
  loading: boolean;
}

/** Try to detect and pretty-print JSON, return null on failure */
function tryFormatJson(text: string): string | null {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return null;
  }
}

/** Syntax-color a pretty-printed JSON string */
function colorizeJson(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            // key
            return `<span style="color:#7dd3fc">${match}</span>`;
          }
          // string value
          return `<span style="color:#86efac">${match}</span>`;
        }
        if (/true|false/.test(match)) {
          return `<span style="color:#f9a8d4">${match}</span>`;
        }
        if (/null/.test(match)) {
          return `<span style="color:#fca5a5">${match}</span>`;
        }
        // number
        return `<span style="color:#fcd34d">${match}</span>`;
      },
    );
}

export function ResponsePanel({ response, loading }: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState<"body" | "headers">("body");
  const [isFormatted, setIsFormatted] = useState(true);
  const bodyRef = useRef<HTMLPreElement>(null);

  // Auto-detect JSON and format when response arrives
  const isJson = response?.body ? tryFormatJson(response.body) !== null : false;
  const formattedBody =
    isJson && isFormatted ? tryFormatJson(response?.body ?? "") : null;
  const displayBody = formattedBody ?? response?.body ?? "";

  // Reset state when new response arrives
  useEffect(() => {
    setIsFormatted(true);
    setActiveTab("body");
  }, [response]);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300)
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (status >= 300 && status < 400)
      return "text-sky-400 bg-sky-500/10 border-sky-500/30";
    if (status >= 400 && status < 500)
      return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-red-400 bg-red-500/10 border-red-500/30";
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(displayBody);
      toast.success("Response copied");
    }
  };

  const downloadResponse = () => {
    if (!response) return;
    const ext = isJson ? "json" : "txt";
    const mime = isJson ? "application/json" : "text/plain";
    const blob = new Blob([displayBody], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `response-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as .${ext}`);
  };

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
        </div>
        <p className="text-xs text-zinc-500">Sending request…</p>
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────
  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-zinc-600 gap-2">
        <Braces size={28} className="opacity-40" />
        <p className="text-sm">No response yet</p>
        <p className="text-xs text-zinc-700">Send a request to see the response here</p>
      </div>
    );
  }

  // ── Error (network / proxy failure) ───────────────────────────
  if (response.error && response.status === 0) {
    return (
      <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-lg">
        <h3 className="text-sm font-semibold text-red-400 mb-1">Request Failed</h3>
        <p className="text-sm text-red-300/80 font-mono">{response.error}</p>
      </div>
    );
  }

  // ── Response ───────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(response.status)}`}
          >
            {response.status} {response.statusText}
          </span>
          <span className="text-xs text-zinc-500">{response.time}ms</span>
          <span className="text-xs text-zinc-600">
            {response.size >= 1024
              ? `${(response.size / 1024).toFixed(1)} KB`
              : `${response.size} B`}
          </span>
          {/* Auto-detected JSON badge */}
          {isJson && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Braces size={10} />
              JSON
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Format / Raw toggle — only shown for JSON responses */}
          {isJson && (
            <button
              onClick={() => setIsFormatted((v) => !v)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                isFormatted
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
              }`}
              title={isFormatted ? "Switch to raw" : "Format JSON"}
            >
              {isFormatted ? "Raw" : "Format"}
            </button>
          )}
          <button
            onClick={copyResponse}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors rounded hover:bg-zinc-800"
            title="Copy"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={downloadResponse}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors rounded hover:bg-zinc-800"
            title="Download"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-zinc-800">
        {(["body", "headers"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium tracking-wide transition-colors capitalize ${
              activeTab === tab
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab === "headers"
              ? `Headers (${Object.keys(response.headers).length})`
              : "Body"}
          </button>
        ))}
      </div>

      {/* Body */}
      {activeTab === "body" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
          <pre
            ref={bodyRef}
            className="text-xs font-mono leading-relaxed text-zinc-100 p-4 overflow-auto max-h-[420px] custom-scrollbar whitespace-pre-wrap break-words"
            {...(isJson && isFormatted && formattedBody
              ? {
                  dangerouslySetInnerHTML: {
                    __html: colorizeJson(formattedBody),
                  },
                }
              : { children: displayBody })}
          />
        </div>
      )}

      {/* Headers */}
      {activeTab === "headers" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="divide-y divide-zinc-900 max-h-[420px] overflow-auto custom-scrollbar">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-4 px-4 py-2.5 text-xs hover:bg-zinc-900/50">
                <span className="text-sky-400 font-medium min-w-[180px] shrink-0">{key}</span>
                <span className="text-zinc-300 break-all">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
