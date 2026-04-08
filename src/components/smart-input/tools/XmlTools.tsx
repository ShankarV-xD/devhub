import { FileJson, FileCode, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";
import { XMLParser } from "fast-xml-parser";
import xmlFormatter from "xml-formatter";

interface XmlToolsProps {
  content: string;
  setContent: (content: string) => void;
  searchTerm?: string;
}

export function XmlTools({
  content,
  setContent,
  searchTerm = "",
}: XmlToolsProps) {
  const filter = (label: string) =>
    !searchTerm || label.toLowerCase().includes(searchTerm.toLowerCase());

  const handleFormatXml = () => {
    try {
      const formatted = xmlFormatter(content, {
        indentation: "  ",
        collapseContent: true,
        lineSeparator: "\n",
      });
      setContent(formatted);
    } catch (error) {
      toast.error("Failed to format XML");
    }
  };

  const handleMinifyXml = () => {
    try {
      // Remove unnecessary whitespace
      const minified = content
        .replace(/>\s+</g, "><")
        .replace(/\n/g, "")
        .trim();
      setContent(minified);
    } catch (error) {
      toast.error("Failed to minify XML");
    }
  };

  const handleConvertToJson = () => {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      });
      const result = parser.parse(content);
      setContent(JSON.stringify(result, null, 2));
    } catch (error) {
      toast.error("Failed to convert XML to JSON");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {filter("Format XML") && (
        <ToolButton
          icon={<FileCode size={16} />}
          label="Format XML"
          onClick={handleFormatXml}
        />
      )}
      {filter("Minify XML") && (
        <ToolButton
          icon={<Minimize2 size={16} />}
          label="Minify XML"
          onClick={handleMinifyXml}
        />
      )}
      {filter("Convert to JSON") && (
        <ToolButton
          icon={<FileJson size={16} />}
          label="Convert to JSON"
          onClick={handleConvertToJson}
        />
      )}
    </div>
  );
}
