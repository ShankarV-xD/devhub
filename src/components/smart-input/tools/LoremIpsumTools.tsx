import { useState } from "react";
import { X, Type } from "lucide-react";
import { loremIpsum } from "lorem-ipsum";
import { toast } from "sonner";

interface LoremIpsumToolsProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (text: string) => void;
}

type LoremMode = "paragraphs" | "words" | "sentences";

const LIMITS = {
  paragraphs: { min: 1, max: 10, default: 3 },
  words: { min: 10, max: 500, default: 100 },
  sentences: { min: 1, max: 20, default: 5 },
};

export function LoremIpsumTools({
  isOpen,
  onClose,
  onGenerate,
}: LoremIpsumToolsProps) {
  const [mode, setMode] = useState<LoremMode>("paragraphs");
  const [count, setCount] = useState(LIMITS[mode].default);
  const [useHtml, setUseHtml] = useState(false);

  if (!isOpen) return null;

  // Update count when mode changes
  const handleModeChange = (newMode: LoremMode) => {
    setMode(newMode);
    setCount(LIMITS[newMode].default);
  };

  const handleGenerate = () => {
    try {
      const text = loremIpsum({
        count,
        units: mode,
        format: useHtml ? "html" : "plain",
        paragraphLowerBound: 3,
        paragraphUpperBound: 7,
        sentenceLowerBound: 5,
        sentenceUpperBound: 15,
      });

      onGenerate(text);
      toast.success(`Generated ${count} ${mode}`);
      onClose();
    } catch (error) {
      toast.error("Failed to generate lorem ipsum");
    }
  };

  const limits = LIMITS[mode];

  // Estimate output
  const estimateWords = () => {
    if (mode === "words") return count;
    if (mode === "sentences") return count * 10; // ~10 words per sentence
    if (mode === "paragraphs") return count * 50; // ~50 words per paragraph
    return 0;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Type size={18} className="text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">
              Lorem Ipsum Generator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(["paragraphs", "words", "sentences"] as LoremMode[]).map(
                (m) => (
                  <button
                    key={m}
                    onClick={() => handleModeChange(m)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      mode === m
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Count Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">Count</label>
              <span className="text-sm text-zinc-500">{count}</span>
            </div>
            <input
              type="range"
              min={limits.min}
              max={limits.max}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-zinc-600">
              <span>{limits.min}</span>
              <span>{limits.max}</span>
            </div>
          </div>

          {/* HTML Format Toggle */}
          <div className="flex items-center justify-between p-3 bg-zinc-950 rounded border border-zinc-800">
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-300">
                HTML Format
              </div>
              <div className="text-xs text-zinc-500">
                Wrap paragraphs in &lt;p&gt; tags
              </div>
            </div>
            <button
              onClick={() => setUseHtml(!useHtml)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                useHtml ? "bg-emerald-600" : "bg-zinc-700"
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  useHtml ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Preview Estimate */}
          <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
            <div className="text-xs text-zinc-500">
              Estimated output: ~{estimateWords()} words
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded transition-colors"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
