import { Plus, Trash2 } from "lucide-react";
import { HeaderRow } from "./types";

interface HeadersEditorProps {
  headers: HeaderRow[];
  onChange: (headers: HeaderRow[]) => void;
}

export function HeadersEditor({ headers, onChange }: HeadersEditorProps) {
  const updateHeader = (
    index: number,
    field: keyof HeaderRow,
    value: string | boolean
  ) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    onChange(newHeaders);
  };

  const addHeader = () => {
    onChange([...headers, { key: "", value: "", enabled: true }]);
  };

  const removeHeader = (index: number) => {
    onChange(headers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-zinc-300">Headers</h3>
        <button
          onClick={addHeader}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {headers.length === 0 ? (
        <div className="text-xs text-zinc-500 py-4 text-center border border-zinc-800 rounded">
          No headers added
        </div>
      ) : (
        <div className="space-y-2">
          {headers.map((header, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={header.enabled}
                onChange={(e) =>
                  updateHeader(index, "enabled", e.target.checked)
                }
                className="w-4 h-4"
              />
              <input
                type="text"
                placeholder="Key"
                value={header.key}
                onChange={(e) => updateHeader(index, "key", e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
              <input
                type="text"
                placeholder="Value"
                value={header.value}
                onChange={(e) => updateHeader(index, "value", e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
              <button
                onClick={() => removeHeader(index)}
                className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
