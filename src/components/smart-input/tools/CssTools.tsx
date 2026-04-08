import React from "react";
import { Minimize2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";
// @ts-ignore
import { isSupported, minify } from "csso";

interface CssToolsProps {
  content: string;
  setContent: (value: string) => void;
}

export const CssTools: React.FC<CssToolsProps> = ({ content, setContent }) => {
  const handleMinify = () => {
    try {
      const result = minify(content);
      setContent(result.css);
      toast.success("CSS Minified");
    } catch (error) {
      console.error(error);
      toast.error("Failed to minify CSS");
    }
  };

  const handleFormat = () => {
    // Basic formatting as fallback if prettier isn't available
    // For now, we'll just try to un-minify slightly or use a simple regex replacement
    // Ideally we would use prettier, but bundle size is a concern.
    // Let's stick to minification for F21 as requested.
    // But user might want to un-minify.
    // csso has `restructure` option but not beautify.
    // We can do a rudimentary format:
    try {
      let formatted = content
        .replace(/\{/g, " {\n  ")
        .replace(/;/g, ";\n  ")
        .replace(/\}/g, "\n}\n")
        .replace(/\n\s*\}/g, "\n}");
      setContent(formatted);
      toast.success("CSS Formatted (Basic)");
    } catch {
      toast.error("Failed to format");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 animate-in slide-in-from-right-4 duration-300">
      <ToolButton
        icon={<Minimize2 size={16} />}
        label="Minify CSS"
        onClick={handleMinify}
      />
      <ToolButton
        icon={<Wand2 size={16} />}
        label="Format CSS"
        onClick={handleFormat}
      />
    </div>
  );
};
