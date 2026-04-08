import { BodyType } from "./types";

interface BodyEditorProps {
  bodyType: BodyType;
  body: string;
  onBodyTypeChange: (type: BodyType) => void;
  onBodyChange: (body: string) => void;
}

export function BodyEditor({
  bodyType,
  body,
  onBodyTypeChange,
  onBodyChange,
}: BodyEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-zinc-300">Body</h3>
        <div className="flex gap-1">
          {(["none", "json", "form", "text"] as BodyType[]).map((type) => (
            <button
              key={type}
              onClick={() => onBodyTypeChange(type)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                bodyType === type
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {type === "none" ? "None" : type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {bodyType !== "none" && (
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder={
            bodyType === "json"
              ? '{\n  "key": "value"\n}'
              : bodyType === "form"
                ? "key1=value1&key2=value2"
                : "Enter text..."
          }
          className="custom-scrollbar w-full h-48 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-sm text-zinc-100 font-mono focus:outline-none focus:border-zinc-700 resize-none"
        />
      )}
    </div>
  );
}
