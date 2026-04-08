"use client";

import DOMPurify from "dompurify";
import clsx from "clsx";

interface HtmlRendererProps {
  content: string;
  isPreviewMode: boolean;
  onTogglePreview: (isPreview: boolean) => void;
}

export function HtmlRenderer({
  content,
  isPreviewMode,
  onTogglePreview,
  children,
}: HtmlRendererProps & { children?: React.ReactNode }) {
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
        <div
          className="flex-1 relative overflow-hidden rounded-lg border border-zinc-900/50"
          style={{
            backgroundColor: "#09090b",
            backgroundImage: "radial-gradient(#27272a 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div className="absolute inset-0 overflow-auto custom-scrollbar p-8">
            <div
              className="prose prose-sm md:prose-base prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(content, { FORCE_BODY: true }),
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 relative min-h-0">{children}</div>
      )}
    </div>
  );
}
