import React from "react";
import { Minimize2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";

interface HtmlToolsProps {
  content: string;
  setContent: (value: string) => void;
}

export const HtmlTools: React.FC<HtmlToolsProps> = ({
  content,
  setContent,
}) => {
  const handleMinify = async () => {
    try {
      // Simple regex-based minification for browser compatibility
      // (html-minifier-terser requires fs/node)
      const result = content
        .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
        .replace(/\s+/g, " ") // Collapse whitespace
        .replace(/>\s+</g, "><") // Remove space between tags
        .trim();

      setContent(result);
      toast.success("HTML Minified");
    } catch (error) {
      console.error(error);
      toast.error("Failed to minify HTML");
    }
  };

  const handleFormat = () => {
    // Basic formatting using DOMParser/XMLSerializer or just simple indenting?
    // Since it's HTML, we can leave it to the editor or use a simple hack.
    // For now, let's omit "Format" for HTML unless we bring in Prettier,
    // or we can use a very basic regex replacer.
    // Actually, standard prettier is best. But let's verify F21 scope: "Minification".
    // Let's add Minify for now.

    // We can simulate basic formatting by replacing > < with >\n< and indenting
    try {
      // This is very naive but better than nothing for quick un-minify
      let formatted = content.replace(/>\s*</g, ">\n<");
      setContent(formatted);
      toast.success("HTML Formatted (Basic)");
    } catch {
      toast.error("Failed to format");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 animate-in slide-in-from-right-4 duration-300">
      <ToolButton
        icon={<Minimize2 size={16} />}
        label="Minify HTML"
        onClick={handleMinify}
      />
      <ToolButton
        icon={<Wand2 size={16} />}
        label="Format HTML"
        onClick={handleFormat}
      />
    </div>
  );
};
