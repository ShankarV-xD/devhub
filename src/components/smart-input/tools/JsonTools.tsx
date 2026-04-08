import React, { useState } from "react";
// YAML is dynamically imported to reduce bundle size
import {
  FileJson,
  ScrollText,
  Braces,
  CheckCircle,
  FileCode,
} from "lucide-react";
import { toast } from "sonner";
import ToolButton from "../ToolButton";
import { JsonSchemaValidator } from "./JsonSchemaValidator";
import { XMLBuilder } from "fast-xml-parser";

interface JsonToolsProps {
  content: string;
  setContent: (value: string) => void;
  setViewMode: (mode: "raw" | "tree" | "table") => void;
  setLastTransform: (
    transform: { type: string; original: string } | null
  ) => void;
  searchTerm?: string;
}

export const JsonTools: React.FC<JsonToolsProps> = ({
  content,
  setContent,
  setViewMode,
  setLastTransform,
  searchTerm = "",
}) => {
  const [showSchemaValidator, setShowSchemaValidator] = useState(false);

  const filter = (label: string) =>
    !searchTerm || label.toLowerCase().includes(searchTerm.toLowerCase());

  return (
    <>
      <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
        {filter("Format JSON") && (
          <ToolButton
            icon={<Braces size={16} />}
            label="Format"
            // shortcut="Ctrl+J"
            onClick={() => {
              try {
                const parsed = JSON.parse(content);
                setContent(JSON.stringify(parsed, null, 2));
                setViewMode("raw");
              } catch {
                toast.error("Invalid JSON");
              }
            }}
          />
        )}
        {filter("Minify JSON") && (
          <ToolButton
            icon={<FileJson size={16} />}
            label="Minify"
            onClick={() => {
              try {
                const parsed = JSON.parse(content);
                setContent(JSON.stringify(parsed));
                setViewMode("raw");
              } catch {
                toast.error("Invalid JSON");
              }
            }}
          />
        )}
        {filter("Validate Schema") && (
          <ToolButton
            icon={<CheckCircle size={16} />}
            label="Validate Schema"
            onClick={() => setShowSchemaValidator(true)}
          />
        )}
        {filter("Convert to YAML") && (
          <ToolButton
            icon={<ScrollText size={16} />}
            label="Convert to YAML"
            onClick={async () => {
              try {
                const YAML = await import("yaml");
                const parsed = JSON.parse(content);
                setContent(YAML.stringify(parsed));
                setLastTransform({
                  type: "json-to-yaml",
                  original: content,
                });
                
              } catch {
                toast.error("Invalid JSON");
              }
            }}
          />
        )}
        {filter("Convert to XML") && (
          <ToolButton
            icon={<FileCode size={16} />}
            label="Convert to XML"
            onClick={() => {
              try {
                const parsed = JSON.parse(content);
                const builder = new XMLBuilder({
                  ignoreAttributes: false,
                  attributeNamePrefix: "@_",
                  format: true,
                  indentBy: "  ",
                });

                // Wrap in root element to ensure valid XML
                const wrapped = { root: parsed };
                let xml = builder.build(wrapped);

                // Add XML declaration
                xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + xml;

                setContent(xml);
                setLastTransform({
                  type: "json-to-xml",
                  original: content,
                });
                
              } catch {
                toast.error("Invalid JSON");
              }
            }}
          />
        )}
        {filter("Generate TypeScript") && (
          <ToolButton
            icon={<FileCode size={16} />}
            label="Generate TypeScript"
            onClick={() => {
              try {
                // Dynamic import to avoid SSR issues or large bundle
                import("json-to-ts").then(({ default: JsonToTs }) => {
                  try {
                    const parsed = JSON.parse(content);
                    const interfaces = JsonToTs(parsed);
                    const tsCode = interfaces.join("\n\n");

                    setLastTransform({
                      type: "json-to-ts",
                      original: content,
                    });
                    setContent(tsCode);
                  } catch (e) {
                    console.error(e);
                    toast.error("Invalid JSON or conversion failed");
                  }
                });
              } catch {
                toast.error("Failed to load converter");
              }
            }}
          />
        )}
      </div>

      {showSchemaValidator && (
        <JsonSchemaValidator
          initialData={content}
          onClose={() => setShowSchemaValidator(false)}
        />
      )}
    </>
  );
};
