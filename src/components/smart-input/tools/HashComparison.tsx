import { useState } from "react";
import { X, CheckCircle, XCircle, Copy } from "lucide-react";
import { toast } from "sonner";

interface HashComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  initialHash?: string;
}

export function HashComparison({
  isOpen,
  onClose,
  initialHash = "",
}: HashComparisonProps) {
  const [hashA, setHashA] = useState(initialHash);
  const [hashB, setHashB] = useState("");

  if (!isOpen) return null;

  const normalizedA = hashA.trim().toLowerCase();
  const normalizedB = hashB.trim().toLowerCase();
  const isMatch = normalizedA === normalizedB && normalizedA.length > 0;
  const hasBothHashes = normalizedA.length > 0 && normalizedB.length > 0;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Character-by-character comparison for highlighting
  const renderDiff = () => {
    if (!hasBothHashes) return null;

    const maxLen = Math.max(normalizedA.length, normalizedB.length);
    const chars = [];

    for (let i = 0; i < maxLen; i++) {
      const charA = normalizedA[i] || "";
      const charB = normalizedB[i] || "";
      const matches = charA === charB;

      chars.push(
        <span
          key={i}
          className={`font-mono ${matches ? "text-green-400" : "text-red-400 bg-red-950/30"}`}
        >
          {charA || charB || "_"}
        </span>
      );
    }

    return <div className="text-xs break-all">{chars}</div>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">
            Hash Comparison
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Hash A Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">
                Hash A
              </label>
              {hashA && (
                <button
                  onClick={() => copyToClipboard(hashA, "Hash A")}
                  className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                >
                  <Copy size={12} />
                  Copy
                </button>
              )}
            </div>
            <textarea
              value={hashA}
              onChange={(e) => setHashA(e.target.value)}
              placeholder="Paste first hash here..."
              className="custom-scrollbar w-full h-24 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm text-zinc-100 font-mono focus:outline-none focus:border-zinc-700 resize-none"
            />
          </div>

          {/* Hash B Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">
                Hash B
              </label>
              {hashB && (
                <button
                  onClick={() => copyToClipboard(hashB, "Hash B")}
                  className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                >
                  <Copy size={12} />
                  Copy
                </button>
              )}
            </div>
            <textarea
              value={hashB}
              onChange={(e) => setHashB(e.target.value)}
              placeholder="Paste second hash here..."
              className="custom-scrollbar w-full h-24 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm text-zinc-100 font-mono focus:outline-none focus:border-zinc-700 resize-none"
            />
          </div>

          {/* Comparison Result */}
          {hasBothHashes && (
            <div
              className={`p-4 rounded-lg border ${
                isMatch
                  ? "bg-green-950/20 border-green-900/50"
                  : "bg-red-950/20 border-red-900/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {isMatch ? (
                  <>
                    <CheckCircle size={20} className="text-green-500" />
                    <span className="text-sm font-medium text-green-400">
                      Hashes Match
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle size={20} className="text-red-500" />
                    <span className="text-sm font-medium text-red-400">
                      Hashes Do Not Match
                    </span>
                  </>
                )}
              </div>

              <div className="space-y-2 text-xs text-zinc-400">
                <div>Length A: {normalizedA.length} characters</div>
                <div>Length B: {normalizedB.length} characters</div>
                {!isMatch && normalizedA.length === normalizedB.length && (
                  <div className="mt-3">
                    <div className="text-zinc-300 mb-1">
                      Character Differences:
                    </div>
                    {renderDiff()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-zinc-500">
            <p>• Comparison is case-insensitive</p>
            <p>• Leading and trailing whitespace is ignored</p>
            <p>
              • Supports all hash types (MD5, SHA-1, SHA-256, SHA-512, etc.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
