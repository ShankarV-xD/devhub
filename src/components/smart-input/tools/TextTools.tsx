import React from "react";
import { ArrowUp, ArrowDown, CaseSensitive, WrapText } from "lucide-react";
import ToolButton from "../ToolButton";

interface TextToolsProps {
  content: string;
  setContent: (value: string) => void;
  lastTransform: { type: string; original: string } | null;
  setLastTransform: (
    transform: { type: string; original: string } | null
  ) => void;
  searchTerm?: string;
}

export const TextTools: React.FC<TextToolsProps> = ({
  content,
  setContent,
  lastTransform,
  setLastTransform,
  searchTerm = "",
}) => {
  const filter = (label: string) =>
    !searchTerm || label.toLowerCase().includes(searchTerm.toLowerCase());

  const applyTextTransform = (
    transformType: string,
    transformer: (s: string) => string
  ) => {
    if (lastTransform?.type === transformType) {
      // Revert
      setContent(lastTransform.original);
      setLastTransform(null);
    } else {
      setLastTransform({ type: transformType, original: content });
      setContent(transformer(content));
    }
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="flex gap-2 mb-2">
        {filter("Upper") && (
          <ToolButton
            icon={<ArrowUp size={16} />}
            label="Upper"
            onClick={() => applyTextTransform("upper", (s) => s.toUpperCase())}
          />
        )}
        {filter("Lower") && (
          <ToolButton
            icon={<ArrowDown size={16} />}
            label="Lower"
            onClick={() => applyTextTransform("lower", (s) => s.toLowerCase())}
          />
        )}
        {filter("Title") && (
          <ToolButton
            icon={<CaseSensitive size={16} />}
            label="Title"
            onClick={() =>
              applyTextTransform("title", (s) =>
                s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
              )
            }
          />
        )}
        {filter("Slugify") && (
          <ToolButton
            icon={<WrapText size={16} />}
            label="Slugify"
            onClick={() =>
              applyTextTransform("slugify", (s) =>
                s
                  .toLowerCase()
                  .trim()
                  .replace(/[^\w\s-]/g, "")
                  .replace(/[\s_-]+/g, "-")
                  .replace(/^-+|-+$/g, "")
              )
            }
          />
        )}
      </div>

      <div className="h-px bg-zinc-900 my-1" />
    </div>
  );
};
