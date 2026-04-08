import { useMemo, ReactNode } from "react";
import Papa from "papaparse";
import { Edit3 } from "lucide-react";

interface CsvRendererProps {
  content: string;
  isPreviewMode: boolean;
  onTogglePreview: (mode: boolean) => void;
  children: ReactNode;
}

export function CsvRenderer({
  content,
  isPreviewMode,
  onTogglePreview,
  children,
}: CsvRendererProps) {
  const parsed = useMemo(() => {
    return Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
  }, [content]);

  // Show editor when not in preview mode
  if (!isPreviewMode) {
    return <>{children}</>;
  }

  if (!parsed || !parsed.data || parsed.data.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-950">
          <h3 className="text-sm font-medium text-zinc-300">CSV Preview</h3>
          <button
            onClick={() => onTogglePreview(false)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          >
            <Edit3 size={14} />
            Edit
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-zinc-500 text-sm">
          No valid CSV data to display
        </div>
      </div>
    );
  }

  const headers = parsed.meta.fields || [];
  const rows = parsed.data;

  return (
    <div className="flex flex-col h-full">
      {/* Header with row count and Edit button */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-950 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-zinc-300">CSV Preview</h3>
            <span className="text-xs text-zinc-500">
              {rows.length} rows × {headers.length} columns
            </span>
          </div>
          <button
            onClick={() => onTogglePreview(false)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          >
            <Edit3 size={14} />
            Edit
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-zinc-900 z-10">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400 border-b border-zinc-800 bg-zinc-900 w-12">
                #
              </th>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-3 py-2 text-left text-xs font-medium text-zinc-400 border-b border-zinc-800 bg-zinc-900"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
              >
                <td className="px-3 py-2 text-zinc-600 text-xs">
                  {rowIdx + 1}
                </td>
                {headers.map((header, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-3 py-2 text-zinc-200 max-w-md truncate"
                    title={String(row[header] ?? "")}
                  >
                    {row[header] !== null && row[header] !== undefined
                      ? String(row[header])
                      : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
