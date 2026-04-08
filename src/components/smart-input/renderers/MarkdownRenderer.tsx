"use client";

import dynamic from "next/dynamic";

const ReactMarkdown = dynamic(() => import("react-markdown"), {
  loading: () => (
    <div className="text-zinc-500 text-sm p-4">Loading preview...</div>
  ),
  ssr: false,
});
import clsx from "clsx";

interface MarkdownRendererProps {
  content: string;
  isPreviewMode: boolean;
  onTogglePreview: (isPreview: boolean) => void;
}

export function MarkdownRenderer({
  content,
  isPreviewMode,
  onTogglePreview,
  children,
}: MarkdownRendererProps & { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      {/* View Toggle */}
      <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800 mb-4 shrink-0">
        <button
          onClick={() => onTogglePreview(false)}
          className={clsx(
            "cursor-pointer px-3 py-1 text-xs font-medium rounded transition-colors",
            !isPreviewMode
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-400"
          )}
        >
          Code
        </button>
        <button
          onClick={() => onTogglePreview(true)}
          className={clsx(
            "cursor-pointer px-3 py-1 text-xs font-medium rounded transition-colors",
            isPreviewMode
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-400"
          )}
        >
          Preview
        </button>
      </div>

      {/* Preview or Code */}
      {isPreviewMode ? (
        <div className="flex-1 relative overflow-hidden bg-black rounded-lg border border-zinc-900">
          <div className="absolute inset-0 overflow-auto custom-scrollbar p-8">
            <div className="prose prose-zinc prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 relative min-h-0">{children}</div>
      )}
    </div>
  );
}
