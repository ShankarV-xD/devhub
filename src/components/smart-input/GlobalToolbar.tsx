import React, { useState } from "react";
import {
  Copy,
  Trash2,
  GitCompare,
  FileJson,
  Key,
  Type,
  Search,
  Code,
  Database,
  Link2,
  Brush,
  Braces,
  FileSpreadsheet,
  Palette,
  FileCode,
  FileText,
  Clock,
  ScrollText,
  Globe,
  Image,
  Lock,
  BookMarked,
} from "lucide-react";
import Tooltip from "../Tooltip";
import { GeneratorTools, HashTools } from "./tools";
import { TOOLS } from "@/lib/examples";
import { HashAlgorithm } from "@/lib/generators";
import ToolButton from "./ToolButton";
import { Logo } from "../Logo";

interface GlobalToolbarProps {
  content: string;
  setContent: (value: string) => void;
  activeView: "editor" | "todo" | "api";
  setActiveView: (view: "editor" | "todo" | "api") => void;
  isDiffMode: boolean;
  setIsDiffMode: (value: boolean) => void;
  setDiffOriginal: (value: string) => void;
  handleCopy: () => void;
  handleClear: () => void;
  setLastTransform: (val: any) => void;
  setJwtOriginal: (val: any) => void;
  setIsPreviewMode: (val: boolean) => void;
  onOpenEncryption?: () => void;
  onOpenTemplates?: () => void;
  searchTerm?: string;
}

export const GlobalToolbar: React.FC<GlobalToolbarProps> = ({
  content,
  setContent,
  activeView,
  setActiveView,
  isDiffMode,
  setIsDiffMode,
  setDiffOriginal,
  handleCopy,
  handleClear,
  setLastTransform,
  setJwtOriginal,
  setIsPreviewMode,
  onOpenEncryption,
  onOpenTemplates,
  searchTerm = "",
}) => {
  const [hashes, setHashes] = useState<Record<HashAlgorithm, string>>(
    {} as Record<HashAlgorithm, string>
  );
  const [showHashes, setShowHashes] = useState(false);

  const filter = (label: string) =>
    !searchTerm || label.toLowerCase().includes(searchTerm.toLowerCase());

  const loadExample = (exType: keyof typeof TOOLS) => {
    const newContent = TOOLS[exType];
    setActiveView("editor");
    setContent(newContent);

    setLastTransform(null);
    setJwtOriginal(null);
    setIsPreviewMode(false);
  };

  return (
    <div className="p-3 border-t border-zinc-900/50 bg-zinc-950 shrink-0 flex flex-col gap-2">
      {/* Spacer / Justify Between Logic (Pushing content down) */}
      <div className="flex-1" />

      {/* Templates */}
      {filter("Templates") && onOpenTemplates && (
        <ToolButton
          icon={<BookMarked size={16} />}
          label="Templates"
          onClick={onOpenTemplates}
          showTooltip={false}
        />
      )}

      {/* Encryption */}
      {filter("Encryption") && onOpenEncryption && (
        <ToolButton
          icon={<Lock size={16} />}
          label="Encryption"
          onClick={onOpenEncryption}
          showTooltip={false}
        />
      )}

      {/* API Builder */}
      {filter("API Builder") && (
        <ToolButton
          icon={<Globe size={16} />}
          label="API Builder"
          isActive={activeView === "api"}
          onClick={() => {
            setActiveView(activeView === "api" ? "editor" : "api");
          }}
          showTooltip={false}
        />
      )}

      {filter(isDiffMode ? "Exit Diff Mode" : "Diff Mode") && (
        <ToolButton
          icon={<GitCompare size={16} />}
          label={isDiffMode ? "Exit Diff Mode" : "Diff Mode"}
          isActive={isDiffMode && activeView === "editor"}
          onClick={() => {
            if (activeView !== "editor") {
              setActiveView("editor");
              if (!isDiffMode) {
                setDiffOriginal(content);
                setIsDiffMode(true);
              }
            } else {
              if (isDiffMode) {
                setIsDiffMode(false);
                setDiffOriginal("");
              } else {
                setDiffOriginal(content);
                setIsDiffMode(true);
              }
            }
          }}
          showTooltip={false}
        />
      )}

      {/* Tools Section */}
      <div className="mt-1 pt-1 border-t border-zinc-900/50">
        <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 px-1">
          Tools
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "json", icon: <FileJson size={16} />, label: "JSON" },
            { id: "jwt", icon: <Key size={16} />, label: "JWT" },
            { id: "base64", icon: <Type size={16} />, label: "Base64" },
            { id: "regex", icon: <Search size={16} />, label: "Regex" },
            { id: "code", icon: <Code size={16} />, label: "Code" },
            { id: "sql", icon: <Database size={16} />, label: "SQL" },
            { id: "url", icon: <Link2 size={16} />, label: "URL" },
            { id: "color", icon: <Palette size={16} />, label: "Color" },
            { id: "html", icon: <FileCode size={16} />, label: "HTML" },
            { id: "markdown", icon: <FileText size={16} />, label: "MD" },
            { id: "cron", icon: <Clock size={16} />, label: "Cron" },
            { id: "yaml", icon: <ScrollText size={16} />, label: "YAML" },
            { id: "xml", icon: <Braces size={16} />, label: "XML" },
            { id: "css", icon: <Brush size={16} />, label: "CSS" },
            { id: "csv", icon: <FileSpreadsheet size={16} />, label: "CSV" },
            { id: "image", icon: <Image size={16} />, label: "Image" },
          ]
            .filter((ex) => filter(ex.label))
            .map((ex) => (
              <Tooltip key={ex.id} text={ex.label}>
                <button
                  onClick={() => loadExample(ex.id as keyof typeof TOOLS)}
                  className="cursor-pointer flex items-center justify-center px-2 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-white transition-colors w-full"
                >
                  {ex.icon}
                </button>
              </Tooltip>
            ))}
        </div>
      </div>

      {/* Generators */}
      <GeneratorTools
        content={content}
        setContent={setContent}
        setActiveView={setActiveView}
        // setMsg={setMsg} // REMOVED
        setHashes={setHashes}
        setShowHashes={setShowHashes}
      />
      <HashTools
        content={content}
        hashes={hashes}
        setHashes={setHashes}
        showHashes={showHashes}
        setShowHashes={setShowHashes}
      />

      {/* Global Actions (Bottom) */}
      <div className="grid grid-cols-2 gap-2 mt-1 pt-1 border-t border-zinc-900/50">
        {filter("Copy") && (
          <ToolButton
            icon={<Copy size={16} />}
            label="Copy"
            onClick={handleCopy}
            showTooltip={false}
          />
        )}
        {filter("Clear") && (
          <ToolButton
            icon={<Trash2 size={16} />}
            label="Clear"
            onClick={handleClear}
            variant="danger"
            showTooltip={false}
          />
        )}
      </div>

      {/* Version Footer */}
      <div className="p-4 border-t border-zinc-900/50 mt-auto">
        <div className="flex justify-center mb-2">
          <Logo size={24} />
        </div>
        <div className="text-center text-[10px] text-zinc-700">
          <div className="mt-1">Made with ❤️ for developers</div>
        </div>
      </div>
    </div>
  );
};
