import React, { useState, useCallback } from "react";
import { Wand2 } from "lucide-react";
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

// Detect language based on code heuristics
function detectLanguage(content: string): string | null {
  if (!content) return null;

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

  if (isPython) return "python";
  if (isRust) return "rust";
  if (isGo) return "go";
  if (isJava) return "java";
  if (isTypeScript) return "typescript";
  return null;
}

export const CodeTools: React.FC<CodeToolsProps> = ({
  content,
  setContent,
}) => {
  const [isFormatting, setIsFormatting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // Initialize with detected language
    return detectLanguage(content) ?? "javascript";
  });

  // Update language when content changes significantly (only from "javascript" to something else)
  const handleContentChange = useCallback(() => {
    const detected = detectLanguage(content);
    if (detected && selectedLanguage === "javascript") {
      setSelectedLanguage(detected);
    }
  }, [content, selectedLanguage]);

  // Run detection on content change using requestAnimationFrame to avoid setState during render
  React.useLayoutEffect(() => {
    const frameId = requestAnimationFrame(() => {
      handleContentChange();
    });
    return () => cancelAnimationFrame(frameId);
  }, [handleContentChange]);

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
      <ToolButton
        icon={<Wand2 size={16} />}
        label={
          isFormatting
            ? "Formatting..."
            : `Format ${LANGUAGES.find((l) => l.id === selectedLanguage)?.label.replace(" ✦", "") || "Code"}`
        }
        onClick={handleFormat}
      />
    </div>
  );
};
