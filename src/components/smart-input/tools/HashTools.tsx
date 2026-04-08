import React, { useState } from "react";
import { Copy, X, Equal, Hash } from "lucide-react";
import TooltipWrapper from "../../Tooltip";
import { toast } from "sonner";
import { type HashAlgorithm } from "@/lib/generators";
import { HashComparison } from "./HashComparison";
import { useDebounce } from "@/hooks/useDebounce";

interface HashToolsProps {
  content: string;
  hashes: Record<HashAlgorithm, string>;
  setHashes: (hashes: Record<HashAlgorithm, string>) => void;
  showHashes: boolean;
  setShowHashes: (show: boolean) => void;
  isLoading?: boolean;
}

export const HashTools: React.FC<HashToolsProps> = ({
  content,
  hashes,
  setHashes,
  showHashes,
  setShowHashes,
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [hmacSecret, setHmacSecret] = useState("");
  const debouncedSecret = useDebounce(hmacSecret, 500);

  React.useEffect(() => {
    if (!showHashes || !content) return;

    const algorithms: HashAlgorithm[] = [
      "MD5",
      "SHA-1",
      "SHA-256",
      "SHA-384",
      "SHA-512",
      "SHA-3",
      "HMAC-MD5",
      "HMAC-SHA256",
      "HMAC-SHA512",
    ];

    const worker = new Worker(
      new URL("@/workers/hash.worker.ts", import.meta.url)
    );

    const hashResults: Record<string, string> = {};
    let completed = 0;

    worker.onmessage = (e) => {
      const { algorithm, hash, error } = e.data;
      if (!error) {
        hashResults[algorithm] = hash;
      }
      completed++;
      if (completed === algorithms.length) {
        setHashes(hashResults as Record<HashAlgorithm, string>);
        worker.terminate();
      }
    };

    algorithms.forEach((algo) => {
      worker.postMessage({
        text: content,
        algorithm: algo,
        secret: debouncedSecret,
      });
    });

    return () => {
      worker.terminate();
    };
  }, [debouncedSecret, content, showHashes, setHashes]);

  if (!showHashes || Object.keys(hashes).length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-3xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Hash size={18} className="text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">
              Generated Hashes
            </h2>
          </div>
          <button
            onClick={() => setShowHashes(false)}
            className="p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Secret Input */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
          <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
            HMAC Secret (Optional)
          </label>
          <input
            type="text"
            value={hmacSecret}
            onChange={(e) => setHmacSecret(e.target.value)}
            placeholder="Enter secret to generate HMAC variants..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors font-mono"
            spellCheck={false}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {(Object.entries(hashes) as [HashAlgorithm, string][]).map(
              ([algo, hash]) => (
                <div key={algo} className="space-y-1.5 group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      {algo}
                    </span>
                    <TooltipWrapper text={`Copy ${algo}`}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(hash);
                          toast.success(`Copied ${algo} hash`);
                        }}
                        className="flex items-center gap-1.5 text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-400 hover:text-emerald-400 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Copy size={12} />
                        Copy
                      </button>
                    </TooltipWrapper>
                  </div>
                  <div className="relative">
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded font-mono text-sm text-zinc-300 break-all">
                      {hash}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 flex justify-end bg-zinc-900/50 rounded-b-lg">
          <button
            onClick={() => setShowComparison(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors text-sm font-medium"
          >
            <Equal size={16} />
            Compare Hashes
          </button>
        </div>
      </div>

      {/* Hash Comparison Modal (Nested) */}
      <HashComparison
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        initialHash={Object.values(hashes)[0] || ""}
      />
    </div>
  );
};
