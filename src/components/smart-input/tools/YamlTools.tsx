import React from "react";
// YAML is dynamically imported to reduce bundle size
import { FileJson } from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";

interface YamlToolsProps {
  content: string;
  setContent: (value: string) => void;
  // setMsg: (msg: { text: string; type: "success" | "error" }) => void; // REMOVED
  setLastTransform: (
    transform: { type: string; original: string } | null
  ) => void;
  searchTerm?: string;
}

export const YamlTools: React.FC<YamlToolsProps> = ({
  content,
  setContent,
  // setMsg,
  setLastTransform,
  searchTerm = "",
}) => {
  const filter = (label: string) =>
    !searchTerm || label.toLowerCase().includes(searchTerm.toLowerCase());

  return (
    <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
      {filter("Convert to JSON") && (
        <ToolButton
          icon={<FileJson size={16} />}
          label="Convert to JSON"
          onClick={async () => {
            toast.promise(
              async () => {
                const YAML = await import("yaml");
                const parsed = YAML.parse(content);
                setContent(JSON.stringify(parsed, null, 2));
                setLastTransform({
                  type: "yaml-to-json",
                  original: content,
                });
                return "Converted to JSON";
              },
              {
                loading: "Converting YAML...",
                success: (msg) => msg,
                error: (error: any) => {
                  let errorMsg = "Invalid YAML";
                  if (error?.linePos) {
                    errorMsg = `YAML Error at Line ${error.linePos[0].line}, Col ${error.linePos[0].col}`;
                  } else if (error?.message && error.message.length < 100) {
                    errorMsg = `YAML: ${error.message}`;
                  }
                  return errorMsg;
                },
              }
            );
          }}
        />
      )}
    </div>
  );
};
