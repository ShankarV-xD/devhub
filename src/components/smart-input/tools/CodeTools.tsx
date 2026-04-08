import React, { useState, useEffect } from "react";
import { Wand2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";

interface CodeToolsProps {
  content: string;
  setContent: (value: string) => void;
}

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "json", label: "JSON" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "markdown", label: "Markdown" },
  { id: "python", label: "Python ✦" },
  { id: "go", label: "Go ✦" },
  { id: "rust", label: "Rust ✦" },
  { id: "java", label: "Java ✦" },
  { id: "cpp", label: "C++ ✦" },
];

export const CodeTools: React.FC<CodeToolsProps> = ({
  content,
  setContent,
}) => {
  const [isFormatting, setIsFormatting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [hasManuallyChangedLang, setHasManuallyChangedLang] = useState(false);

  // Auto-detect language based on code heuristics
  useEffect(() => {
    if (!hasManuallyChangedLang && content) {
      const isTypeScript =
        /:\s*(string|number|boolean|any|void|unknown|never)\b/.test(content) ||
        /\b(interface|type)\s+\w+/.test(content) ||
        /<\w+(,\s*\w+)*>/.test(content) ||
        /\b(public|private|protected|readonly)\b/.test(content);

      const isPython =
        /^\s*def\s+\w+\s*\(/m.test(content) ||
        /^\s*import\s+\w+/m.test(content) ||
        /^\s*from\s+\w+\s+import/m.test(content) ||
        /^\s*class\s+\w+(\s*\(.*\))?:/m.test(content);

      const isRust =
        /^\s*fn\s+\w+\s*\(/m.test(content) ||
        /\blet\s+mut\b/.test(content) ||
        /\bimpl\b/.test(content);

      const isGo =
        /^\s*func\s+\w+\s*\(/m.test(content) ||
        /\bpackage\s+main\b/.test(content) ||
        /\bfmt\./.test(content);

      const isJava =
        /\bpublic\s+(class|interface|enum)\b/.test(content) ||
        /\bSystem\.out\.print/.test(content) ||
        /\b@Override\b/.test(content);

      if (isPython && selectedLanguage === "javascript") {
        setSelectedLanguage("python");
      } else if (isRust && selectedLanguage === "javascript") {
        setSelectedLanguage("rust");
      } else if (isGo && selectedLanguage === "javascript") {
        setSelectedLanguage("go");
      } else if (isJava && selectedLanguage === "javascript") {
        setSelectedLanguage("java");
      } else if (isTypeScript && selectedLanguage === "javascript") {
        setSelectedLanguage("typescript");
      }
    }
  }, [content, hasManuallyChangedLang, selectedLanguage]);

  const handleFormat = () => {
    if (isFormatting) return;
    if (!content.trim()) {
      toast.error("No code to format");
      return;
    }

    setIsFormatting(true);
    const toastId = toast.loading(`Formatting ${selectedLanguage}...`);

    const worker = new Worker(
      new URL("@/workers/format.worker.ts", import.meta.url)
    );

    worker.onmessage = (e) => {
      const { formatted, error, language } = e.data;
      if (error) {
        toast.error(`Error formatting: ${error}`, { id: toastId });
      } else {
        setContent(formatted);
        toast.success(
          `${LANGUAGES.find((l) => l.id === language)?.label || language} Formatted`,
          { id: toastId }
        );
      }
      setIsFormatting(false);
      worker.terminate();
    };

    worker.onerror = (err) => {
      console.error("Worker error:", err);
      toast.error("Format worker failed to load. Check console.", {
        id: toastId,
      });
      setIsFormatting(false);
      worker.terminate();
    };

    worker.postMessage({
      text: content,
      language: selectedLanguage,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 pl-2 pr-1 py-1 bg-zinc-900/50 border border-zinc-800 rounded-lg h-8 shadow-sm">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center pr-1 border-r border-zinc-800 h-full">
          Lang
        </span>
        <div className="relative flex items-center group h-full">
          <select
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
              setHasManuallyChangedLang(true);
            }}
            className="appearance-none bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded py-0.5 pl-2 pr-6 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all cursor-pointer h-full"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-1.5 w-3 h-3 text-zinc-500 pointer-events-none group-hover:text-zinc-300 transition-colors" />
        </div>
      </div>

      <ToolButton
        icon={<Wand2 size={16} />}
        label={isFormatting ? "Formatting..." : "Format Code"}
        onClick={handleFormat}
      />
    </div>
  );
};
